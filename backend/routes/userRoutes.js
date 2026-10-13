const express = require('express');
const { getPublicProfile, updateMyProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/me', protect, updateMyProfile);
router.get('/:id', getPublicProfile);

module.exports = router;
