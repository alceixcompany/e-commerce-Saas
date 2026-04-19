const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');

const TEST_USER_ID = '69e2141878292efe86477f77';
const TEST_PRODUCT_ID = '69e2156478292efe86478019';
const TEST_PRODUCT_NAME = 'Los armchahir for basic home detail';
const TEST_PRODUCT_IMAGE = 'http://localhost:5001/api/upload/image/69e2155b78292efe86478015';

const orders = [
    {
        _id: '69e367acb5874b3a4ac5a64d',
        user: TEST_USER_ID,
        orderItems: [
            {
                name: TEST_PRODUCT_NAME,
                qty: 1,
                image: TEST_PRODUCT_IMAGE,
                price: 17999,
                product: TEST_PRODUCT_ID
            }
        ],
        shippingAddress: {
            address: '123 Test St',
            city: 'Istanbul',
            postalCode: '34000',
            country: 'Turkey'
        },
        paymentMethod: 'Iyzico',
        idempotencyKey: 'a7710eb6-f6ac-4972-8a50-64f050f62c3a',
        itemsPrice: 17999,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 17999,
        isPaid: false,
        paymentStatus: 'pending',
        paymentFailureReason: null,
        isDelivered: false,
        status: 'pending',
        createdAt: new Date('2026-04-18T11:14:52.298Z'),
        updatedAt: new Date('2026-04-18T11:14:52.298Z')
    },
    {
        _id: '69e367e1b5874b3a4ac5a675',
        user: TEST_USER_ID,
        orderItems: [
            {
                name: TEST_PRODUCT_NAME,
                qty: 1,
                image: TEST_PRODUCT_IMAGE,
                price: 17999,
                product: TEST_PRODUCT_ID
            }
        ],
        shippingAddress: {
            address: '123 Test St',
            city: 'Istanbul',
            postalCode: '34000',
            country: 'Turkey'
        },
        paymentMethod: 'Iyzico',
        idempotencyKey: '26f473ad-3078-42c0-b3dd-27600c6526d4',
        itemsPrice: 17999,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 15659.130000000001,
        isPaid: false,
        paymentStatus: 'failed',
        paymentFailureReason: 'Kart limiti yetersiz, yetersiz bakiye',
        isDelivered: false,
        status: 'preparing',
        createdAt: new Date('2026-04-18T11:15:45.195Z'),
        updatedAt: new Date('2026-04-18T12:07:54.848Z')
    }
];

async function addOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        for (const orderData of orders) {
            // Use findOneAndUpdate with upsert: true to avoid duplication errors and update if exists
            const order = await Order.findOneAndUpdate(
                { _id: orderData._id },
                { $set: orderData },
                { upsert: true, new: true, runValidators: true }
            );
            console.log(`📦 Order processed: ${order._id} (Status: ${order.paymentStatus})`);
        }

        await mongoose.disconnect();
        console.log('✅ Done');
    } catch (error) {
        console.error('❌ Error adding orders:', error);
        process.exit(1);
    }
}

addOrders();
