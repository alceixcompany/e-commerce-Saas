const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');

const TEST_USER_ID = '69e2141878292efe86477f77';
const TEST_PRODUCT_ID = '69e2156478292efe86478019';
const TEST_PRODUCT_NAME = 'Los armchahir for basic home detail';
const TEST_PRODUCT_IMAGE = 'http://localhost:5001/api/upload/image/69e2155b78292efe86478015';

const paidOrder = {
    _id: '69e3682ab5874b3a4ac5a690', // New unique ID
    user: TEST_USER_ID,
    orderItems: [
        {
            name: TEST_PRODUCT_NAME,
            qty: 1,
            image: TEST_PRODUCT_IMAGE,
            price: 5000,
            product: TEST_PRODUCT_ID
        }
    ],
    shippingAddress: {
        address: '123 Paid St',
        city: 'Istanbul',
        postalCode: '34000',
        country: 'Turkey'
    },
    paymentMethod: 'Iyzico',
    idempotencyKey: 'f9328405-1234-4567-8901-23456789abcd',
    itemsPrice: 5000,
    taxPrice: 0,
    shippingPrice: 0,
    totalPrice: 5000,
    isPaid: true,
    paidAt: new Date(),
    paymentStatus: 'paid',
    paymentResult: {
        id: 'PAY-12345678',
        status: 'success',
        update_time: new Date().toISOString(),
        email_address: 'admin@gmail.com'
    },
    isDelivered: false,
    status: 'received',
    createdAt: new Date(),
    updatedAt: new Date()
};

async function addPaidOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const order = await Order.findOneAndUpdate(
            { _id: paidOrder._id },
            { $set: paidOrder },
            { upsert: true, new: true, runValidators: true }
        );
        console.log(`📦 Paid Order processed: ${order._id} (Status: ${order.paymentStatus}, isPaid: ${order.isPaid})`);

        await mongoose.disconnect();
        console.log('✅ Done');
    } catch (error) {
        console.error('❌ Error adding paid order:', error);
        process.exit(1);
    }
}

addPaidOrder();
