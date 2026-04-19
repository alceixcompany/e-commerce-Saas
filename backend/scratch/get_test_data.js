const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

async function getTestData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne();
        if (user) {
            console.log('--- USER_FOUND ---');
            console.log(JSON.stringify({ id: user._id, email: user.email }));
        } else {
            console.log('--- USER_NOT_FOUND ---');
        }

        const product = await Product.findOne();
        if (product) {
            console.log('--- PRODUCT_FOUND ---');
            console.log(JSON.stringify({ id: product._id, name: product.name, price: product.price, image: product.mainImage }));
        } else {
            console.log('--- PRODUCT_NOT_FOUND ---');
        }

        const order = await Order.findOne();
        if (order) {
            console.log('--- ORDER_FOUND_FOR_TEMPLATE ---');
            console.log(JSON.stringify({ 
                shippingAddress: order.shippingAddress,
                orderItems: order.orderItems[0]
            }));
        } else {
            console.log('--- ORDER_NOT_FOUND ---');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

getTestData();
