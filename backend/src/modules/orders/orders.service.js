const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const { client } = require('../../config/paypal');
const { getIyzipayClient } = require('../../config/iyzipay');
const Iyzipay = require('iyzipay');
const ordersRepo = require('./orders.repository');
const productsRepo = require('../products/products.repository');
const paymentRepo = require('../paymentSettings/paymentSettings.repository');
const { getAuthoritativeUrl } = require('../../utils/url');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const ensureNonNegativeNumber = (value, fieldName) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue < 0) {
        throw createHttpError(`${fieldName} must be a non-negative number`, 400);
    }
    return numberValue;
};

const buildOrderFromProducts = (orderItems, productsById) => {
    let itemsPrice = 0;
    const normalizedItems = orderItems.map((item) => {
        const product = productsById.get(item.product?.toString());
        if (!product) {
            throw createHttpError('Product not found for order item', 400);
        }
        const quantity = Number(item.qty || item.quantity || 1);
        if (!quantity || quantity < 1) {
            throw createHttpError('Invalid quantity', 400);
        }
        const unitPrice = product.discountedPrice != null ? product.discountedPrice : product.price;
        itemsPrice += unitPrice * quantity;

        return {
            name: product.name,
            qty: quantity,
            image: product.mainImage || product.image,
            price: unitPrice,
            product: product._id,
        };
    });

    return { normalizedItems, itemsPrice };
};

const applyCoupon = (coupon, subtotal, userId) => {
    if (!coupon) return { discountAmount: 0, couponData: null };

    if (!coupon.isActive) {
        throw createHttpError('Coupon is no longer active', 400);
    }
    if (new Date() > new Date(coupon.expirationDate)) {
        throw createHttpError('Coupon has expired', 400);
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw createHttpError('Coupon usage limit reached', 400);
    }
    if (coupon.usedBy && coupon.usedBy.some((id) => id.toString() === userId.toString())) {
        throw createHttpError('You have already used this coupon', 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.amount) / 100;
    } else {
        discountAmount = coupon.amount;
    }

    if (discountAmount > subtotal) {
        discountAmount = subtotal;
    }

    return {
        discountAmount,
        couponData: {
            code: coupon.code,
            discountAmount
        }
    };
};

const createOrder = async ({ orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, coupon }, user) => {
    const safeTaxPrice = ensureNonNegativeNumber(taxPrice || 0, 'taxPrice');
    const safeShippingPrice = ensureNonNegativeNumber(shippingPrice || 0, 'shippingPrice');

    let session = null;
    try {
        session = await ordersRepo.startSession();
        if (session) {
            session.startTransaction();
        }
    } catch (sessionError) {
        console.warn('MongoDB Transactions are not supported in this environment (Standalone Mongo). Proceeding without session.');
        session = null;
    }

    try {
        const productIds = orderItems.map((item) => item.product);
        const uniqueProductIds = [...new Set(productIds.map((id) => id.toString()))];
        const products = await ordersRepo.findProductsByIds(uniqueProductIds, session);
        if (products.length !== uniqueProductIds.length) {
            throw createHttpError('One or more products not found', 400);
        }

        const productsById = new Map(products.map((p) => [p._id.toString(), p]));
        const { normalizedItems, itemsPrice: calculatedItemsPrice } = buildOrderFromProducts(orderItems, productsById);

        const subtotal = calculatedItemsPrice + safeTaxPrice + safeShippingPrice;

        let appliedCoupon = null;
        let discountAmount = 0;
        if (coupon && coupon.code) {
            const existingCoupon = await ordersRepo.findCouponByCode(coupon.code.toUpperCase(), session);
            if (!existingCoupon) {
                throw createHttpError('No such coupon found', 400);
            }
            const couponResult = applyCoupon(existingCoupon, subtotal, user._id);
            appliedCoupon = couponResult.couponData;
            discountAmount = couponResult.discountAmount;

            await ordersRepo.incrementCouponUsage(existingCoupon._id, user._id, session);
        }

        const finalTotalPrice = subtotal - discountAmount;

        const orderPayload = {
            orderItems: normalizedItems,
            user: user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice: calculatedItemsPrice,
            taxPrice: safeTaxPrice,
            shippingPrice: safeShippingPrice,
            totalPrice: finalTotalPrice,
            coupon: appliedCoupon || undefined
        };

        const createdOrder = await ordersRepo.createOrder(orderPayload, session);
        
        if (session) {
            await session.commitTransaction();
        }
        
        return createdOrder;
    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error('Failed to abort transaction:', abortError);
            }
        }
        console.error('Create order error:', error);
        throw error;
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

/**
 * Helper to verify and deduct stock for an order
 * Uses a session to ensure atomicity
 */
const verifyAndDeductStock = async (orderItems, session) => {
    for (const item of orderItems) {
        // Find product to check current stock
        const product = await productsRepo.findProductByIdLean(item.product);
        if (!product) {
            throw createHttpError(`Product not found: ${item.name}`, 404);
        }

        if (product.stock < item.qty) {
            throw createHttpError(`Insufficient stock for product: ${item.name}. Available: ${product.stock}`, 400);
        }

        // Atomically decrement stock
        // findByIdAndUpdate with $inc and runValidators:true will fail if stock becomes negative
        try {
            await productsRepo.updateStock(item.product, -item.qty, session);
        } catch (error) {
            if (error.name === 'ValidationError') {
                throw createHttpError(`Stock update failed for ${item.name}: Insufficient stock`, 400);
            }
            throw error;
        }
    }
};

const payOrderWithPaypal = async ({ orderId, paypalOrderId }, user) => {
    const order = await ordersRepo.findOrderById(orderId);
    if (!order) throw createHttpError('Order not found', 404);
    if (order.user.toString() !== user._id.toString() && user.role !== 'admin') {
        throw createHttpError('Not authorized to pay for this order', 403);
    }
    if (order.isPaid) throw createHttpError('Order already paid', 400);

    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(paypalOrderId);
    const paypalClient = await client();
    const paypalOrder = await paypalClient.execute(request);

    const paypalData = paypalOrder.result;
    const purchaseUnit = paypalData?.purchase_units?.[0];
    if (!purchaseUnit || !purchaseUnit.amount) {
        throw createHttpError('Invalid PayPal order data', 400);
    }

    const paypalAmount = purchaseUnit.amount.value;
    const paypalCurrency = purchaseUnit.amount.currency_code;

    const globalSettings = await ordersRepo.findGlobalSettings();
    const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

    if (parseFloat(paypalAmount) !== parseFloat(order.totalPrice)) {
        throw createHttpError(`Payment amount mismatch. Expected ${order.totalPrice}, got ${paypalAmount}`, 400);
    }
    if (paypalCurrency !== storeCurrency) {
        throw createHttpError(`Payment currency mismatch. Expected ${storeCurrency}, got ${paypalCurrency}`, 400);
    }
    if (paypalData.status !== 'COMPLETED' && paypalData.status !== 'APPROVED') {
        throw createHttpError(`PayPal payment not completed. Status: ${paypalData.status}`, 400);
    }

    const session = await ordersRepo.startSession();
    session.startTransaction();

    try {
        // 1. Verify and deduct stock first
        await verifyAndDeductStock(order.orderItems, session);

        // 2. Clear flags and save
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: paypalData.id,
            status: paypalData.status,
            update_time: paypalData.update_time,
            email_address: paypalData.payer.email_address,
        };

        const savedOrder = await order.save({ session });
        await session.commitTransaction();
        return savedOrder;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

const initializeIyzico = async ({ orderId, clientIp }, user) => {
    const order = await ordersRepo.findOrderByIdWithUser(orderId);
    if (!order) throw createHttpError('Order not found', 404);
    if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
        throw createHttpError('Not authorized to pay for this order', 403);
    }
    if (order.isPaid) throw createHttpError('Order already paid', 400);

    const globalSettings = await ordersRepo.findGlobalSettings();
    const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

    const iyzipay = await getIyzipayClient();

    /**
     * PROFESSIONAL PRICE DISTRIBUTION LOGIC
     * Iyzico requires Sum(basketItems.price) == paidPrice.
     * Since we have a global basket discount (coupon), we must distribute it
     * across all products.
     */
    const totalProductPrice = order.orderItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const discountAmount = order.coupon ? order.coupon.discountAmount : 0;
    
    // We'll calculate the 'paid' portion of each item after discount
    // Formula: itemPaidPrice = itemOriginalTotal - (itemOriginalTotal / totalProductPrice * totalDiscount)
    let basketItemsSum = 0;
    const basketItems = order.orderItems.map((item, index) => {
        const itemOriginalTotal = item.price * item.qty;
        let itemPaidPrice;

        if (index === order.orderItems.length - 1 && order.shippingPrice <= 0) {
            // Last item adjustment to prevent rounding issues (if no shipping item follows)
            itemPaidPrice = (totalProductPrice - discountAmount - basketItemsSum);
        } else {
            const ratio = itemOriginalTotal / totalProductPrice;
            itemPaidPrice = Math.round((itemOriginalTotal - (ratio * discountAmount)) * 100) / 100;
            basketItemsSum += itemPaidPrice;
        }

        return {
            id: item.product.toString(),
            name: item.name,
            category1: 'General',
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: itemPaidPrice.toFixed(2),
        };
    });

    // Add Shipping as a separate item if it exists
    if (order.shippingPrice > 0) {
        // Final adjustment calculation including shipping
        const currentSum = basketItems.reduce((acc, item) => acc + parseFloat(item.price), 0);
        const shippingValue = Math.round((order.totalPrice - currentSum) * 100) / 100;

        basketItems.push({
            id: 'shipping_cost',
            name: 'Shipping / Kargo',
            category1: 'Service',
            itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
            price: shippingValue.toFixed(2),
        });
    }

    // Format dates for Iyzico (YYYY-MM-DD HH:mm:ss)
    // Utility to format phone number for Iyzico (expects +905XXXXXXXXX format)
const formatGsmNumber = (phone) => {
    if (!phone) return undefined;
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 0, remove it
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // If it doesn't start with 90, prepend it
    if (!cleaned.startsWith('90')) {
        cleaned = '90' + cleaned;
    }
    
    return '+' + cleaned;
};

const formatDate = (date) => {
        try {
            if (!date) return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            }
            return parsedDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
        } catch (e) {
            return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        }
    };

    // STRICT METADATA VALIDATION
    if (!order.user || !order.user.phone) {
        throw createHttpError('Incomplete Profile: Phone number is required for payment. Please update your profile.', 400);
    }
    
    if (!clientIp) {
        console.warn('Warning: Client IP could not be determined. Using fallback for local dev.');
    }

    const buyerIdentity = (order.user && order.user.identityNumber) || '11111111111';

    // FETCH AUTHORITATIVE STORE URL FROM PAYMENT SETTINGS
    const paymentSettings = await paymentRepo.findPaymentSettings();
    let authoritativeUrl = paymentSettings?.content?.storeUrl;

    const baseUrl = (authoritativeUrl || (globalSettings && globalSettings.content && globalSettings.content.storeUrl))
        ? (authoritativeUrl || globalSettings.content.storeUrl).replace(/\/+$/, '')
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace('/api', '');

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: order._id.toString(),
        price: order.totalPrice.toFixed(2),
        paidPrice: order.totalPrice.toFixed(2),
        currency: Iyzipay.CURRENCY[storeCurrency] || Iyzipay.CURRENCY.USD,
        installment: '1',
        basketId: order._id.toString(),
        paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${baseUrl}/api/orders/iyzico/callback`,
        buyer: {
            id: order.user._id.toString(),
            name: (order.user.name || 'Buyer').split(' ')[0],
            surname: (order.user.name || 'Name').split(' ').slice(1).join(' ') || 'Name',
            gsmNumber: formatGsmNumber(order.user.phone),
            email: order.user.email,
            identityNumber: buyerIdentity,
            lastLoginDate: formatDate(user.lastLogin),
            registrationDate: formatDate(user.createdAt),
            registrationAddress: order.shippingAddress.address,
            ip: clientIp,
            city: order.shippingAddress.city,
            country: order.shippingAddress.country,
            zipCode: order.shippingAddress.postalCode
        },
        shippingAddress: {
            contactName: order.user.name || 'Buyer Name',
            city: order.shippingAddress.city,
            country: order.shippingAddress.country,
            address: order.shippingAddress.address,
            zipCode: order.shippingAddress.postalCode
        },
        billingAddress: {
            contactName: order.user.name || 'Buyer Name',
            city: order.shippingAddress.city,
            country: order.shippingAddress.country,
            address: order.shippingAddress.address,
            zipCode: order.shippingAddress.postalCode
        },
        basketItems: basketItems
    };

    return new Promise((resolve, reject) => {
        iyzipay.checkoutFormInitialize.create(request, function (err, result) {
            if (err) {
                return reject(createHttpError('Iyzico API Error', 500));
            }

            if (result.status === 'success') {
                return resolve({
                    checkoutFormContent: result.checkoutFormContent,
                    token: result.token,
                    paymentPageUrl: result.paymentPageUrl
                });
            }

            return reject(createHttpError(result.errorMessage || 'Failed to initialize payment form', 400));
        });
    });
};

const handleIyzicoCallback = async ({ token }) => {
    const iyzipay = await getIyzipayClient();
    const baseUrl = await getAuthoritativeUrl();

    return new Promise((resolve, reject) => {
        iyzipay.checkoutForm.retrieve({
            locale: iyzipay.LOCALE.TR,
            token: token
        }, async function (err, result) {
            if (err) {
                return resolve({
                    redirectUrl: `${baseUrl}/checkout/callback?status=error&message=gateway_error`
                });
            }

            if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                const orderId = result.basketId;
                const order = await ordersRepo.findOrderById(orderId);

                if (!order) {
                    return resolve({
                        redirectUrl: `${baseUrl}/checkout/callback?status=error&message=order_not_found`
                    });
                }

                if (!order.isPaid) {
                    const globalSettings = await ordersRepo.findGlobalSettings();
                    const storeCurrency = (globalSettings && globalSettings.content && globalSettings.content.currency) || 'USD';

                    const paidPrice = parseFloat(result.paidPrice || result.price || '0');
                    if (Number.isNaN(paidPrice) || paidPrice <= 0) {
                        return resolve({
                            redirectUrl: `${baseUrl}/checkout/callback?status=error&message=invalid_payment_amount`
                        });
                    }

                    if (paidPrice !== parseFloat(order.totalPrice)) {
                        return resolve({
                            redirectUrl: `${baseUrl}/checkout/callback?status=error&message=amount_mismatch`
                        });
                    }

                    if (result.currency && result.currency !== storeCurrency) {
                        return resolve({
                            redirectUrl: `${baseUrl}/checkout/callback?status=error&message=currency_mismatch`
                        });
                    }

                    const session = await ordersRepo.startSession();
                    session.startTransaction();

                    try {
                        // 1. Verify and deduct stock
                        await verifyAndDeductStock(order.orderItems, session);

                        // 2. Update order status
                        order.isPaid = true;
                        order.paidAt = Date.now();
                        order.paymentResult = {
                            id: result.paymentId,
                            status: result.paymentStatus,
                            update_time: new Date().toISOString(),
                            email_address: order.user?.email || 'unknown',
                        };

                        await order.save({ session });
                        await session.commitTransaction();
                    } catch (error) {
                        await session.abortTransaction();
                        // Special handling for Iyzico callback: redirect with error if stock failed
                        return resolve({
                            redirectUrl: `${baseUrl}/checkout/callback?status=error&message=${encodeURIComponent(error.message || 'Stock allocation failed')}`
                        });
                    } finally {
                        session.endSession();
                    }
                }

                return resolve({
                    redirectUrl: `${baseUrl}/checkout/callback?status=success&orderId=${orderId}`
                });
            }

            return resolve({
                redirectUrl: `${baseUrl}/checkout/callback?status=error&message=${encodeURIComponent(result.errorMessage || 'Payment failed')}`
            });
        });
    });
};

const getMyOrders = async ({ userId, page, limit }) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await ordersRepo.findMyOrders(userId, skip, limit);
    return {
        orders,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

const getOrderById = async ({ orderId }, user) => {
    const order = await ordersRepo.findOrderByIdWithUser(orderId);
    if (!order) throw createHttpError('Order not found', 404);
    if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
        throw createHttpError('Not authorized to view this order', 403);
    }
    return order;
};

const listOrders = async ({ page, limit, filter, q }) => {
    const skip = (page - 1) * limit;
    let matchQuery = {};

    if (filter === 'pending') {
        matchQuery.isDelivered = false;
        matchQuery.isPaid = true;
    } else if (filter === 'unpaid') {
        matchQuery.isPaid = false;
    } else if (filter === 'delivered') {
        matchQuery.isDelivered = true;
    }

    const pipeline = [
        { $match: matchQuery },
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $project: {
                user: {
                    _id: '$userDetails._id',
                    name: '$userDetails.name',
                    email: '$userDetails.email'
                },
                orderItems: 1,
                shippingAddress: 1,
                paymentMethod: 1,
                paymentResult: 1,
                itemsPrice: 1,
                taxPrice: 1,
                shippingPrice: 1,
                totalPrice: 1,
                isPaid: 1,
                paidAt: 1,
                isDelivered: 1,
                deliveredAt: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ];

    if (q) {
        const searchRegex = new RegExp(q.trim(), 'i');
        pipeline.push({
            $match: {
                $or: [
                    { '_id': { $regex: q.trim(), $options: 'i' } },
                    { 'user.name': searchRegex },
                    { 'user.email': searchRegex }
                ]
            }
        });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    const countPipeline = [...pipeline];
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    const [orders, countResult] = await ordersRepo.listOrdersAggregate(pipeline, countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
        orders,
        total,
        page,
        pages: Math.ceil(total / parseInt(limit))
    };
};

const deliverOrder = async ({ orderId }) => {
    const order = await ordersRepo.findOrderById(orderId);
    if (!order) throw createHttpError('Order not found', 404);
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    return ordersRepo.saveOrder(order);
};

const deleteOrder = async ({ orderId }) => {
    const order = await ordersRepo.findOrderById(orderId);
    if (!order) throw createHttpError('Order not found', 404);
    await ordersRepo.deleteOrder(order);
    return true;
};

module.exports = {
    createOrder,
    payOrderWithPaypal,
    initializeIyzico,
    handleIyzicoCallback,
    getMyOrders,
    getOrderById,
    listOrders,
    deliverOrder,
    deleteOrder,
};
