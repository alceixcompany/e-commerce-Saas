const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    trim: true,
    unique: true,
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  bannerImage: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Ensure bannerImage and image are always included in JSON output
      ret.bannerImage = ret.bannerImage !== undefined && ret.bannerImage !== null ? ret.bannerImage : '';
      ret.image = ret.image !== undefined && ret.image !== null ? ret.image : '';
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Ensure bannerImage and image are always included in object output
      ret.bannerImage = ret.bannerImage !== undefined && ret.bannerImage !== null ? ret.bannerImage : '';
      ret.image = ret.image !== undefined && ret.image !== null ? ret.image : '';
      return ret;
    }
  }
});

// Generate slug from name if not provided
categorySchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

