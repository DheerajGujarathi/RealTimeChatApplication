const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  getRoomById,
  joinRoom,
  leaveRoom,
  createPrivateChat
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getRooms)
  .post(protect, createRoom);

router.post('/private', protect, createPrivateChat);

router.route('/:id')
  .get(protect, getRoomById);

router.post('/:id/join', protect, joinRoom);
router.post('/:id/leave', protect, leaveRoom);

module.exports = router;
