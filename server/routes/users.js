const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  searchUsers,
  updateStatus,
  updateProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getUsers);
router.put('/status', protect, updateStatus);
router.put('/profile', protect, updateProfile);
router.get('/search/:query', protect, searchUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
