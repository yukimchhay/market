const express = require('express');
const {
  getListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', getListings);
router.get('/mine', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, upload.array('images', 6), createListing);
router.put('/:id', protect, upload.array('images', 6), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
