const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  getFavoriteIds,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getMyFavorites);
router.get("/ids", getFavoriteIds);
router.post("/:listingId", addFavorite);
router.delete("/:listingId", removeFavorite);

module.exports = router;
