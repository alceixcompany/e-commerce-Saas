const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('../src/models/Order');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orderIds = ['69e367acb5874b3a4ac5a64d', '69e367e1b5874b3a4ac5a675'];
        const orders = await Order.find({ _id: { $in: orderIds } });
        
        console.log(`Found ${orders.length} orders in DB.`);
        orders.forEach(o => {
            console.log(`Order ID: ${o._id}, Status: ${o.paymentStatus}, Total: ${o.totalPrice}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
