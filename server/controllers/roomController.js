const Room = require('../models/Room');
const Message = require('../models/Message');

// @desc    Get all rooms for user
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { type: 'public' },
        { members: req.user._id },
        { participants: req.user._id }
      ]
    })
    .populate('creator', 'username avatar')
    .populate('members', 'username avatar status')
    .populate('participants', 'username avatar status')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'username' }
    })
    .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private
const createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a room name' });
    }

    const room = await Room.create({
      name,
      description,
      type: type || 'public',
      creator: req.user._id,
      members: [req.user._id],
      admins: [req.user._id]
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status');

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Private
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status')
      .populate('participants', 'username avatar status')
      .populate('admins', 'username avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user has access
    const hasAccess = room.type === 'public' || 
                      room.members.some(m => m._id.toString() === req.user._id.toString()) ||
                      room.participants.some(p => p._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join room
// @route   POST /api/rooms/:id/join
// @access  Private
const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.type === 'private') {
      return res.status(403).json({ message: 'Cannot join private room' });
    }

    // Check if already a member
    if (room.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    room.members.push(req.user._id);
    await room.save();

    const updatedRoom = await Room.findById(room._id)
      .populate('creator', 'username avatar')
      .populate('members', 'username avatar status');

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave room
// @route   POST /api/rooms/:id/leave
// @access  Private
const leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.members = room.members.filter(m => m.toString() !== req.user._id.toString());
    await room.save();

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or get private chat
// @route   POST /api/rooms/private
// @access  Private
const createPrivateChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Please provide user ID' });
    }

    // Check if private chat already exists
    const existingChat = await Room.findOne({
      isPrivateChat: true,
      participants: { $all: [req.user._id, userId] }
    })
    .populate('participants', 'username avatar status')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'username' }
    });

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new private chat
    const privateChat = await Room.create({
      name: 'Private Chat',
      type: 'private',
      isPrivateChat: true,
      creator: req.user._id,
      participants: [req.user._id, userId],
      members: [req.user._id, userId]
    });

    const populatedChat = await Room.findById(privateChat._id)
      .populate('participants', 'username avatar status');

    res.status(201).json(populatedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  createRoom,
  getRoomById,
  joinRoom,
  leaveRoom,
  createPrivateChat
};
