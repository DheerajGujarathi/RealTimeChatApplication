import React, { useState } from 'react';
import api from '../../utils/api';

const Sidebar = ({ 
  rooms, 
  currentRoom, 
  onSelectRoom, 
  onCreateRoom, 
  onStartPrivateChat,
  onLogout,
  onOpenSettings,
  user,
  onlineUsers,
  isOpen,
  onClose
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    onCreateRoom({ name: roomName, description: roomDescription, type: roomType });
    setRoomName('');
    setRoomDescription('');
    setRoomType('public');
    setShowCreateModal(false);
  };

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      setShowUsersModal(true);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleStartChat = (userId) => {
    onStartPrivateChat(userId);
    setShowUsersModal(false);
  };

  const searchUsers = async (query) => {
    if (!query) {
      loadUsers();
      return;
    }
    
    try {
      const response = await api.get(`/users/search/${query}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const getRoomDisplayName = (room) => {
    if (room.isPrivateChat) {
      const otherUser = room.participants?.find(p => p._id !== user._id);
      return otherUser?.username || 'Unknown User';
    }
    return room.name;
  };

  const getRoomAvatar = (room) => {
    if (room.isPrivateChat) {
      const otherUser = room.participants?.find(p => p._id !== user._id);
      return otherUser?.avatar || 'https://via.placeholder.com/40';
    }
    return 'https://via.placeholder.com/40';
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const filteredRooms = rooms.filter(room =>
    getRoomDisplayName(room).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <img src={user.avatar} alt={user.username} className="user-avatar" />
            <div className="user-info">
              <h3>{user.username}</h3>
              <span className="status online">Online</span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={onOpenSettings} className="settings-btn" title="Settings">
              <span>⚙️</span>
            </button>
            <button onClick={onLogout} className="logout-btn" title="Logout">
              <span>🚪</span>
            </button>
          </div>
        </div>

        <div className="sidebar-actions">
          <button onClick={() => setShowCreateModal(true)} className="action-btn">
            ➕ New Room
          </button>
          <button onClick={loadUsers} className="action-btn">
            💬 New Chat
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="rooms-list">
          <h4>Rooms & Chats</h4>
          {filteredRooms.length === 0 ? (
            <p className="empty-message">No rooms found</p>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room._id}
                className={`room-item ${currentRoom?._id === room._id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room)}
              >
                <div className="room-avatar-container">
                  <img src={getRoomAvatar(room)} alt={getRoomDisplayName(room)} />
                  {room.isPrivateChat && isUserOnline(room.participants?.find(p => p._id !== user._id)?._id) && (
                    <span className="online-indicator"></span>
                  )}
                </div>
                <div className="room-info">
                  <div className="room-header">
                    <h5>{getRoomDisplayName(room)}</h5>
                    <span className="room-type">{room.isPrivateChat ? '🔒' : room.type === 'private' ? '🔐' : '🌐'}</span>
                  </div>
                  <p className="room-last-message">
                    {room.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="close-sidebar-btn" onClick={onClose}>✕</button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUsersModal && (
        <div className="modal-overlay" onClick={() => setShowUsersModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Start a Conversation</h3>
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                onChange={(e) => searchUsers(e.target.value)}
              />
            </div>
            <div className="users-list">
              {users.map(u => (
                <div key={u._id} className="user-item" onClick={() => handleStartChat(u._id)}>
                  <img src={u.avatar} alt={u.username} />
                  <div className="user-details">
                    <h5>{u.username}</h5>
                    <span className={`status ${u.status}`}>{u.status}</span>
                  </div>
                  {isUserOnline(u._id) && <span className="online-indicator"></span>}
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowUsersModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
