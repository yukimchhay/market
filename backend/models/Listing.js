const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 3000 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['USD', 'KHR'], default: 'USD' },
    category: {
      type: String,
      required: true,
      enum: [
        'Vehicles',
        'Electronics',
        'Property',
        'Jobs',
        'Home & Furniture',
        'Fashion',
        'Services',
        'Other',
      ],
    },
    condition: { type: String, enum: ['New', 'Used'], default: 'Used' },
    images: [{ type: String }], // /uploads paths
    location: { type: String, required: true, trim: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'sold', 'inactive'], default: 'active' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
