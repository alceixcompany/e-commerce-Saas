const mongoose = require('mongoose');
const Banner = require('../src/models/Banner');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/ecommerce');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedBanners = async () => {
    await connectDB();

    const banners = [
        {
            title: 'LAB DIAMONDS',
            description: 'Brilliance for every moment',
            image: 'https://images.unsplash.com/photo-1606293926075-69a00dbfde81?q=80&w=2000&auto=format&fit=crop', // Diamond/Lab image
            buttonText: 'View products',
            buttonUrl: '/products?category=lab-diamonds',
            order: 1,
            status: 'active'
        },
        {
            title: 'GEMSTONE JEWELRY',
            description: 'Treasures of the earth',
            image: 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=2000&auto=format&fit=crop', // Gemstone image
            buttonText: 'View products',
            buttonUrl: '/products?category=gemstones',
            order: 2,
            status: 'active'
        }
    ];

    try {
        await Banner.deleteMany({}); // Clear existing
        await Banner.insertMany(banners);
        console.log('Banners Seeded!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedBanners();
