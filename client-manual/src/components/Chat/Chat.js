import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import socketService from '../../utils/socket';
import api from '../../utils/api';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import Settings from '../Settings/Settings';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadRooms();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom._id);
      socketService.joinRoom(currentRoom._id);
    }

    return () => {
      if (currentRoom) {
        socketService.leaveRoom(currentRoom._id);
      }
    };
  }, [currentRoom]);

  const loadRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await api.get(`/messages/${roomId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('online_users', handleOnlineUsers);
    socketService.on('user_joined', handleUserJoined);
    socketService.on('user_left', handleUserLeft);
  };

  const cleanupSocketListeners = () => {
    socketService.off('receive_message', handleReceiveMessage);
    socketService.off('online_users', handleOnlineUsers);
    socketService.off('user_joined', handleUserJoined);
    socketService.off('user_left', handleUserLeft);
  };

  const handleReceiveMessage = (message) => {
    setMessages(prev => [...prev, message]);
    
    // Update room's last message
    setRooms(prev => prev.map(room => 
      room._id === message.room ? { ...room, lastMessage: message, updatedAt: new Date() } : room
    ));
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  const handleUserJoined = ({ userId, roomId }) => {
    console.log(`User ${userId} joined room ${roomId}`);
  };

  const handleUserLeft = ({ userId, roomId }) => {
    console.log(`User ${userId} left room ${roomId}`);
  };

  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData);
      setRooms(prev => [response.data, ...prev]);
      setCurrentRoom(response.data);
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error.response?.data?.message || 'Failed to create room');
    }
  };

  const handleStartPrivateChat = async (userId) => {
    try {
      const response = await api.post('/rooms/private', { userId });
      
      // Check if room already exists in list
      const existingRoom = rooms.find(r => r._id === response.data._id);
      if (!existingRoom) {
        setRooms(prev => [response.data, ...prev]);
      }
      
      setCurrentRoom(response.data);
    } catch (error) {
      console.error('Error starting private chat:', error);
      alert(error.response?.data?.message || 'Failed to start chat');
    }
  };

  const handleSendMessage = async (content, type = 'text', fileData = null) => {
    if (!currentRoom) return;

    const messageData = {
      roomId: currentRoom._id,
      content,
      type,
      ...fileData
    };

    socketService.sendMessage(messageData);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
        onStartPrivateChat={handleStartPrivateChat}
        onLogout={logout}
        onOpenSettings={() => setShowSettings(true)}
        user={user}
        onlineUsers={onlineUsers}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <ChatWindow
        room={currentRoom}
        messages={messages}
        onSendMessage={handleSendMessage}
        user={user}
        onToggleSidebar={toggleSidebar}
      />

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

export default Chat;
