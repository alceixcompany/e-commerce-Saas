const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
const needle = 'image-1775476929130-43048210.jpeg';

const walk = (value, path = []) => {
  const found = [];
  if (typeof value === 'string') {
    if (value.includes(needle)) found.push({ path: path.join('.'), value });
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => found.push(...walk(item, [...path, index])));
    return found;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      found.push(...walk(child, [...path, key]));
    }
  }
  return found;
};

(async () => {
  await mongoose.connect(uri);
  const collections = await mongoose.connection.db.listCollections().toArray();
  const matches = [];

  for (const { name } of collections) {
    const docs = await mongoose.connection.db.collection(name).find({}).toArray();
    for (const doc of docs) {
      const found = walk(doc);
      if (found.length) {
        matches.push({ collection: name, _id: String(doc._id), found });
      }
    }
  }

  console.log(JSON.stringify(matches, null, 2));
  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
