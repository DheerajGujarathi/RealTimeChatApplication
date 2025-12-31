import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    avatar: user?.avatar || '',
    about: user?.about || 'Hey there! I am using RealTimeChat'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (e) => {
    setMessage({ type: '', text: '' });
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a valid image (JPEG, PNG, or GIF)' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return;
    }

    setUploadingImage(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const response = await api.post('/upload', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const imageUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000'}${response.data.fileUrl}`;
      setFormData({ ...formData, avatar: imageUrl });
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/users/profile', formData);
      
      // Update user context with new data
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-container" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Profile Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="profile-photo-section">
            <div className="photo-preview">
              <img src={formData.avatar} alt="Profile" />
            </div>
            <div className="photo-upload">
              <label htmlFor="avatar-upload" className="upload-btn">
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
              <p className="upload-hint">JPEG, PNG, or GIF (Max 5MB)</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="avatar">Profile Photo URL</label>
            <input
              type="url"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="about">About</label>
            <textarea
              id="about"
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="200"
            />
            <span className="char-count">{formData.about.length}/200</span>
          </div>

          <div className="form-group readonly">
            <label>Username</label>
            <input type="text" value={user?.username || ''} disabled />
          </div>

          <div className="form-group readonly">
            <label>Email</label>
            <input type="email" value={user?.email || ''} disabled />
          </div>

          <div className="settings-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
