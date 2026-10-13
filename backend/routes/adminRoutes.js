const express = require("express");
const {
  getStats,
  getUsers,
  getUserDetail,
  updateUserRole,
  setUserBanned,
  deleteUser,
  getAllListings,
  setListingStatus,
  deleteAnyListing,
} = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

const router = express.Router();

// every route below requires a logged-in admin (or superadmin)
router.use(protect, adminOnly);

router.get("/stats", getStats);

router.get("/users", getUsers);
router.get("/users/:id", getUserDetail);
router.put("/users/:id/role", updateUserRole); // can only demote to 'user' — see controller
router.put("/users/:id/ban", setUserBanned);
router.delete("/users/:id", deleteUser);

// NOTE: there is intentionally no POST route to create or promote admins here.
// Granting admin/superadmin access is only possible via
// `npm run make-admin -- <email> [admin|superadmin]`, run directly on the
// server by someone with database access. No HTTP endpoint can do it,
// even for an authenticated superadmin — this is on purpose.

router.get("/listings", getAllListings);
router.put("/listings/:id/status", setListingStatus);
router.delete("/listings/:id", deleteAnyListing);

module.exports = router;
