import React, { useState, useEffect, useRef } from 'react';
import socketService from '../../utils/socket';
import api from '../../utils/api';

const ChatWindow = ({ room, messages, onSendMessage, user, onToggleSidebar }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (room) {
      socketService.on('user_typing', handleUserTyping);
      socketService.on('user_stop_typing', handleUserStopTyping);

      return () => {
        socketService.off('user_typing', handleUserTyping);
        socketService.off('user_stop_typing', handleUserStopTyping);
      };
    }
  }, [room]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUserTyping = ({ username, roomId }) => {
    if (room && roomId === room._id && username !== user.username) {
      setTypingUsers(prev => [...new Set([...prev, username])]);
    }
  };

  const handleUserStopTyping = ({ username, roomId }) => {
    if (room && roomId === room._id) {
      setTypingUsers(prev => prev.filter(u => u !== username));
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socketService.typing({ roomId: room._id, username: user.username });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.stopTyping({ roomId: room._id, username: user.username });
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !room) return;

    onSendMessage(messageInput.trim());
    setMessageInput('');
    setIsTyping(false);
    socketService.stopTyping({ roomId: room._id, username: user.username });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { fileUrl, fileName, fileSize } = response.data;
      const type = file.type.startsWith('image/') ? 'image' : 'file';

      onSendMessage(fileName, type, { fileUrl, fileName, fileSize });
      setShowFileUpload(false);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!room) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h2>Welcome to RealTime Chat!</h2>
          <p>Select a room or start a new conversation to begin chatting</p>
        </div>
      </div>
    );
  }

  const roomName = room.isPrivateChat
    ? room.participants?.find(p => p._id !== user._id)?.username || 'Unknown User'
    : room.name;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <button className="menu-btn" onClick={onToggleSidebar}>☰</button>
        <div className="chat-header-info">
          <h3>{roomName}</h3>
          {room.description && <p>{room.description}</p>}
          <span className="members-count">
            {room.members?.length || room.participants?.length || 0} members
          </span>
        </div>
      </div>

      <div className="messages-container">
        {messages.map((message) => {
          const isOwnMessage = message.sender._id === user._id;
          
          return (
            <div
              key={message._id}
              className={`message ${isOwnMessage ? 'own' : 'other'}`}
            >
              {!isOwnMessage && (
                <img
                  src={message.sender.avatar}
                  alt={message.sender.username}
                  className="message-avatar"
                />
              )}
              <div className="message-content">
                {!isOwnMessage && (
                  <span className="message-sender">{message.sender.username}</span>
                )}
                
                {message.type === 'text' && (
                  <div className="message-text">{message.content}</div>
                )}
                
                {message.type === 'image' && (
                  <div className="message-image">
                    <img src={`http://localhost:5000${message.fileUrl}`} alt={message.fileName} />
                    <p className="file-name">{message.fileName}</p>
                  </div>
                )}
                
                {message.type === 'file' && (
                  <div className="message-file">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <p className="file-name">{message.fileName}</p>
                      <p className="file-size">{formatFileSize(message.fileSize)}</p>
                    </div>
                    <a
                      href={`http://localhost:5000${message.fileUrl}`}
                      download={message.fileName}
                      className="download-btn"
                    >
                      ⬇
                    </a>
                  </div>
                )}
                
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          );
        })}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleSubmit}>
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          title="Attach file"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
