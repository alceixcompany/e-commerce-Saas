const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Address sub-schema
const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const userSchema = new mongoose.Schema({
  // 1. Kimlik Bilgileri
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  
  // 2. Giriş Bilgileri
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  
  // 3. Adres Bilgisi
  addresses: [addressSchema],
  
  // 4. Sipariş / Sistemsel Bilgiler
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  
  // 5. Opsiyonel Bilgiler
  phone: {
    type: String,
    trim: true,
  },
  profileImage: {
    type: String,
  },
  lastLogin: {
    type: Date,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  }],
}, {
  timestamps: true, // createdAt (kayıt olma tarihi) ve updatedAt
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

