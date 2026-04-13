require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const user = await User.findOne();
        if (!user) {
            console.error('No user found to assign orders to');
            process.exit(1);
        }

        const products = await Product.find().limit(5);
        if (products.length === 0) {
            console.error('No products found to put in orders');
            process.exit(1);
        }

        const orders = [];
        const statuses = ['received', 'preparing', 'shipped', 'delivered'];
        
        for (let i = 1; i <= 20; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const qty = Math.floor(Math.random() * 3) + 1;
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            orders.push({
                user: user._id,
                orderItems: [{
                    name: product.name,
                    qty: qty,
                    image: product.mainImage,
                    price: product.price,
                    product: product._id
                }],
                shippingAddress: {
                    address: `Test Street No: ${Math.floor(Math.random() * 100) + 1}`,
                    city: 'Istanbul',
                    postalCode: '34' + (Math.floor(Math.random() * 900) + 100),
                    country: 'Turkey'
                },
                paymentMethod: 'Iyzico',
                paymentResult: {
                    id: 'test_pay_alt_' + Date.now() + i,
                    status: 'SUCCESS',
                    update_time: new Date().toISOString(),
                    email_address: user.email
                },
                itemsPrice: product.price * qty,
                taxPrice: 0,
                shippingPrice: 15.00,
                totalPrice: (product.price * qty) + 15.00,
                isPaid: true,
                paidAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date in last 7 days
                status: status,
                paymentStatus: 'paid'
            });
        }

        await Order.insertMany(orders);
        console.log('Successfully seeded 20 more orders with varying statuses');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
