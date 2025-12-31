const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

const socketHandler = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication
    socket.on('authenticate', async (userId) => {
      try {
        socket.userId = userId;
        onlineUsers.set(userId, socket.id);

        // Update user status
        await User.findByIdAndUpdate(userId, {
          status: 'online',
          lastSeen: Date.now()
        });

        // Broadcast online users
        io.emit('online_users', Array.from(onlineUsers.keys()));
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Join room
    socket.on('join_room', async (roomId) => {
      try {
        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          roomId
        });
      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Leave room
    socket.on('leave_room', async (roomId) => {
      try {
        socket.leave(roomId);
        console.log(`User ${socket.userId} left room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit('user_left', {
          userId: socket.userId,
          roomId
        });
      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type, fileUrl, fileName, fileSize } = data;

        // Create message
        const message = await Message.create({
          room: roomId,
          sender: socket.userId,
          content,
          type: type || 'text',
          fileUrl,
          fileName,
          fileSize
        });

        // Update room's last message
        await Room.findByIdAndUpdate(roomId, {
          lastMessage: message._id,
          updatedAt: Date.now()
        });

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Broadcast to room
        io.to(roomId).emit('receive_message', populatedMessage);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { roomId, username } = data;
      socket.to(roomId).emit('user_typing', { username, roomId });
    });

    // Stop typing
    socket.on('stop_typing', (data) => {
      const { roomId, username } = data;
      socket.to(roomId).emit('user_stop_typing', { username, roomId });
    });

    // Mark message as read
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);

        if (message) {
          const alreadyRead = message.readBy.some(
            r => r.user.toString() === socket.userId
          );

          if (!alreadyRead) {
            message.readBy.push({ user: socket.userId });
            await message.save();

            // Notify sender
            io.to(message.room.toString()).emit('message_read', {
              messageId,
              userId: socket.userId
            });
          }
        }
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          onlineUsers.delete(socket.userId);

          // Update user status
          await User.findByIdAndUpdate(socket.userId, {
            status: 'offline',
            lastSeen: Date.now()
          });

          // Broadcast online users
          io.emit('online_users', Array.from(onlineUsers.keys()));
        }

        console.log('Client disconnected:', socket.id);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
};

module.exports = socketHandler;
