require('dotenv').config();
const mongoose = require('mongoose');

const Category = require('../src/models/Category');
const Product = require('../src/models/Product');

const DEFAULT_URI = 'mongodb://localhost:27017/ecommerce';
const DEMO_CATEGORY_SLUG = 'order-test-items';
const DEMO_SKU = 'ORDER-TEST-001';

async function ensureCategory() {
  let category = await Category.findOne({ slug: DEMO_CATEGORY_SLUG });

  if (!category) {
    category = await Category.create({
      name: 'Order Test Items',
      slug: DEMO_CATEGORY_SLUG,
      image: '/image/alceix/defaults/bracelet.png',
      bannerImage: '/image/alceix/defaults/bracelet.png',
      status: 'active',
    });
    console.log(`Created category: ${category.name} (${category._id})`);
  }

  return category;
}

async function upsertProduct(categoryId) {
  const payload = {
    name: 'Static Order Test Product',
    category: categoryId,
    shortDescription: 'Temporary static product for testing order creation and payment flows.',
    price: 1,
    discountedPrice: 1,
    stock: 50,
    sku: DEMO_SKU,
    mainImage: '/image/alceix/defaults/necklace.png',
    image: '/image/alceix/defaults/necklace.png',
    images: [
      '/image/alceix/defaults/necklace.png',
      '/image/alceix/defaults/ring.png',
      '/image/alceix/defaults/earrings.png',
    ],
    shippingWeight: 0.1,
    isNewArrival: false,
    isBestSeller: false,
    status: 'active',
    rating: 5,
  };

  const product = await Product.findOneAndUpdate(
    { sku: DEMO_SKU },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Ready product: ${product.name} (${product._id})`);
  return product;
}

async function main() {
  const uri = process.env.MONGODB_URI || DEFAULT_URI;

  await mongoose.connect(uri);
  console.log(`Connected to MongoDB: ${uri}`);

  const category = await ensureCategory();
  await upsertProduct(category._id);

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(async (error) => {
  console.error('Failed to insert static order product:', error);
  try {
    await mongoose.disconnect();
  } catch (_disconnectError) {
    // ignore disconnect failures on the way out
  }
  process.exit(1);
});
