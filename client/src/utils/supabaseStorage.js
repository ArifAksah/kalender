/**
 * Supabase Storage Utilities
 * Handle file uploads to Supabase Storage via API endpoint
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload profile photo to Supabase Storage via backend API
 * @param {File|Blob} file - Image file to upload
 * @param {string} userId - User ID
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadProfilePhoto = async (file, userId) => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Upload via backend API endpoint using axios (handles FormData headers correctly)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', 'profile-photo');

    const response = await axios.post(`${API_URL}/storage/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeader()
      }
    });

    if (!response.data.url) {
      throw new Error('No URL returned from server');
    }
    
    return response.data.url;
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    
    // Extract error message from axios error
    if (error.response) {
      const errorData = error.response.data || {};
      const errorMessage = errorData.message || errorData.error || error.message || `HTTP ${error.response.status}: ${error.response.statusText}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'Upload failed');
    }
  }
};

/**
 * Delete profile photo from Supabase Storage via backend API
 * @param {string} photoUrl - URL of photo to delete
 * @returns {Promise<void>}
 */
export const deleteProfilePhoto = async (photoUrl) => {
  if (!photoUrl) {
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No authentication token found for delete');
      return;
    }

    // Delete via backend API endpoint using axios
    await axios.post(
      `${API_URL}/storage/delete`,
      { url: photoUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        }
      }
    );
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    // Don't throw error, just log it (file might already be deleted)
  }
};

