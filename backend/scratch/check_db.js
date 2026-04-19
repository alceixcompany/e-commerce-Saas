const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

async function checkIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userId = '69e365cfb5874b3a4ac5a568';
        const user = await User.findById(userId);
        console.log('User found:', user ? user.email : 'Not found');

        const products = await Product.find({ price: 17999 });
        console.log('Products with price 17999:', products.length);
        products.forEach(p => console.log(`- ${p.name} (${p._id})`));

        // Check if orders already exist
        const orderIds = ['69e367acb5874b3a4ac5a64d', '69e367e1b5874b3a4ac5a675'];
        const orders = await Order.find({ _id: { $in: orderIds } });
        console.log('Orders already in DB:', orders.length);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkIds();
