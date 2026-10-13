const User = require("../models/User");
const Listing = require("../models/Listing");
const Favorite = require("../models/Favorite");

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const [
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "active" }),
      Listing.countDocuments({ status: "sold" }),
      User.countDocuments({ isBanned: true }),
    ]);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [newUsersThisWeek, newListingsThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Listing.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

    return res.json({
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      bannedUsers,
      newUsersThisWeek,
      newListingsThisWeek,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not load stats", error: err.message });
  }
}

// GET /api/admin/users?q=&page=&limit=
async function getUsers(req, res) {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    // attach each user's listing count
    const userIds = users.map((u) => u._id);
    const counts = await Listing.aggregate([
      { $match: { seller: { $in: userIds } } },
      { $group: { _id: "$seller", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(
      counts.map((c) => [c._id.toString(), c.count]),
    );

    const usersWithCounts = users.map((u) => ({
      ...u.toObject(),
      listingCount: countMap[u._id.toString()] || 0,
    }));

    return res.json({
      users: usersWithCounts,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      total,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not load users", error: err.message });
  }
}

// GET /api/admin/users/:id  (admin view — full profile + every listing they own, any status)
async function getUserDetail(req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const listings = await Listing.find({ seller: user._id }).sort({
      createdAt: -1,
    });

    return res.json({ user, listings });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not load user", error: err.message });
  }
}

// PUT /api/admin/users/:id/role   body: { role: 'user' }
// This can only ever demote — granting admin/superadmin is not possible
// through the API at all, by anyone, including a superadmin. That's only
// done by the developer directly, via `npm run make-admin`.
async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (role !== "user") {
      return res.status(403).json({
        message:
          "Admin access can only be granted by the developer directly, not through the API",
      });
    }
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't change your own role" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    const touchesAdminAccount =
      target.role === "admin" || target.role === "superadmin";
    if (req.user.role !== "superadmin" && touchesAdminAccount) {
      return res
        .status(403)
        .json({ message: "Only a super admin can manage admin accounts" });
    }

    target.role = "user";
    await target.save();
    return res.json(target);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not update role", error: err.message });
  }
}

// PUT /api/admin/users/:id/ban   body: { isBanned: true|false }
async function setUserBanned(req, res) {
  try {
    const { isBanned } = req.body;
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't ban your own account" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });

    if (
      req.user.role !== "superadmin" &&
      (target.role === "admin" || target.role === "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Only a super admin can manage admin accounts" });
    }

    target.isBanned = !!isBanned;
    await target.save();
    return res.json(target);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not update user", error: err.message });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      req.user.role !== "superadmin" &&
      (user.role === "admin" || user.role === "superadmin")
    ) {
      return res
        .status(403)
        .json({ message: "Only a super admin can manage admin accounts" });
    }

    const listingIds = await Listing.find({ seller: user._id }).distinct("_id");
    await Listing.deleteMany({ seller: user._id });
    await Favorite.deleteMany({
      $or: [{ user: user._id }, { listing: { $in: listingIds } }],
    });
    await user.deleteOne();

    return res.json({ message: "User and their listings deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not delete user", error: err.message });
  }
}

// GET /api/admin/listings?status=&category=&q=&page=&limit=  (any status, any seller)
async function getAllListings(req, res) {
  try {
    const { status, category, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (q) filter.title = { $regex: q, $options: "i" };

    const pageNum = Math.max(Number(page), 1);
    const limitNum = Math.min(Number(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("seller", "name email isBanned")
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
    return res
      .status(500)
      .json({ message: "Could not load listings", error: err.message });
  }
}

// PUT /api/admin/listings/:id/status   body: { status: 'active'|'sold'|'inactive' }
async function setListingStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["active", "sold", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    return res.json(listing);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not update listing", error: err.message });
  }
}

// DELETE /api/admin/listings/:id  (any listing, any owner)
async function deleteAnyListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    await listing.deleteOne();
    await Favorite.deleteMany({ listing: listing._id });
    return res.json({ message: "Listing deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Could not delete listing", error: err.message });
  }
}

module.exports = {
  getStats,
  getUsers,
  getUserDetail,
  updateUserRole,
  setUserBanned,
  deleteUser,
  getAllListings,
  setListingStatus,
  deleteAnyListing,
};
