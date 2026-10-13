const User = require('../models/User');
const Listing = require('../models/Listing');

// GET /api/users/:id  (public profile, e.g. viewing a seller)
async function getPublicProfile(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const listings = await Listing.find({ seller: user._id, status: 'active' }).sort({ createdAt: -1 });

    return res.json({ user, listings });
  } catch (err) {
    return res.status(500).json({ message: 'Could not load profile', error: err.message });
  }
}

// PUT /api/users/me
async function updateMyProfile(req, res) {
  try {
    const { name, phone, location, bio, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    const { password, ...safeUser } = user.toObject();
    return res.json(safeUser);
  } catch (err) {
    return res.status(500).json({ message: 'Could not update profile', error: err.message });
  }
}

module.exports = { getPublicProfile, updateMyProfile };
