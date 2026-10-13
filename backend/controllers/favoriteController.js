const Favorite = require('../models/Favorite');
const Listing = require('../models/Listing');

// POST /api/favorites/:listingId
async function addFavorite(req, res) {
  try {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // upsert so double-clicking / re-adding never throws a duplicate-key error
    await Favorite.findOneAndUpdate(
      { user: req.user._id, listing: listingId },
      { user: req.user._id, listing: listingId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ favorited: true });
  } catch (err) {
    return res.status(500).json({ message: 'Could not save favorite', error: err.message });
  }
}

// DELETE /api/favorites/:listingId
async function removeFavorite(req, res) {
  try {
    await Favorite.deleteOne({ user: req.user._id, listing: req.params.listingId });
    return res.json({ favorited: false });
  } catch (err) {
    return res.status(500).json({ message: 'Could not remove favorite', error: err.message });
  }
}

// GET /api/favorites  - full listing details, newest saved first (for the Favorites page)
async function getMyFavorites(req, res) {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'listing',
        populate: { path: 'seller', select: 'name avatar location' },
      });

    // a favorited listing may have since been deleted - skip those
    const listings = favorites.map((f) => f.listing).filter(Boolean);
    return res.json(listings);
  } catch (err) {
    return res.status(500).json({ message: 'Could not load favorites', error: err.message });
  }
}

// GET /api/favorites/ids  - just the listing IDs, for rendering filled/empty hearts in a grid
async function getFavoriteIds(req, res) {
  try {
    const favorites = await Favorite.find({ user: req.user._id }).select('listing');
    return res.json(favorites.map((f) => f.listing.toString()));
  } catch (err) {
    return res.status(500).json({ message: 'Could not load favorites', error: err.message });
  }
}

module.exports = { addFavorite, removeFavorite, getMyFavorites, getFavoriteIds };
