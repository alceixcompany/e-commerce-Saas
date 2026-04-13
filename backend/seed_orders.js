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

        const product = await Product.findOne();
        if (!product) {
            console.error('No product found to put in orders');
            process.exit(1);
        }

        const orders = [];
        for (let i = 1; i <= 6; i++) {
            orders.push({
                user: user._id,
                orderItems: [{
                    name: product.name,
                    qty: i,
                    image: product.mainImage,
                    price: product.price,
                    product: product._id
                }],
                shippingAddress: {
                    address: 'Test Street ' + i,
                    city: 'Istanbul',
                    postalCode: '34000',
                    country: 'Turkey'
                },
                paymentMethod: 'Iyzico',
                paymentResult: {
                    id: 'test_pay_' + i,
                    status: 'SUCCESS',
                    update_time: new Date().toISOString(),
                    email_address: user.email
                },
                itemsPrice: product.price * i,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: product.price * i,
                isPaid: true,
                paidAt: new Date(),
                status: 'received'
            });
        }

        await Order.insertMany(orders);
        console.log('Successfully seeded 6 orders with status "received"');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
