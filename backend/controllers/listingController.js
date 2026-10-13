const Listing = require('../models/Listing');

// GET /api/listings  - browse, search, filter, paginate
// query params: q, category, minPrice, maxPrice, location, page, limit
async function getListings(req, res) {
  try {
    const { q, category, minPrice, maxPrice, location, page = 1, limit = 12 } = req.query;

    const filter = { status: 'active' };
    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit) || 12, 50);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate('seller', 'name avatar location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Listing.countDocuments(filter),
    ]);

    return res.json({
      listings,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      total,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Could not load listings', error: err.message });
  }
}

// GET /api/listings/:id
async function getListingById(req, res) {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name avatar location phone bio createdAt');

    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    return res.json(listing);
  } catch (err) {
    return res.status(500).json({ message: 'Could not load listing', error: err.message });
  }
}

// GET /api/listings/mine  - the logged-in user's own listings (any status)
async function getMyListings(req, res) {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    return res.json(listings);
  } catch (err) {
    return res.status(500).json({ message: 'Could not load your listings', error: err.message });
  }
}

// POST /api/listings
async function createListing(req, res) {
  try {
    const { title, description, price, currency, category, condition, location } = req.body;

    if (!title || !description || !price || !category || !location) {
      return res.status(400).json({ message: 'Title, description, price, category and location are required' });
    }

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const listing = await Listing.create({
      title,
      description,
      price,
      currency,
      category,
      condition,
      location,
      images,
      seller: req.user._id,
    });

    return res.status(201).json(listing);
  } catch (err) {
    return res.status(500).json({ message: 'Could not create listing', error: err.message });
  }
}

// PUT /api/listings/:id
async function updateListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

    const fields = ['title', 'description', 'price', 'currency', 'category', 'condition', 'location', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) listing[f] = req.body[f];
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f) => `/uploads/${f.filename}`);
      listing.images = [...listing.images, ...newImages];
    }

    await listing.save();
    return res.json(listing);
  } catch (err) {
    return res.status(500).json({ message: 'Could not update listing', error: err.message });
  }
}

// DELETE /api/listings/:id
async function deleteListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    await listing.deleteOne();
    return res.json({ message: 'Listing deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Could not delete listing', error: err.message });
  }
}

module.exports = {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
};
