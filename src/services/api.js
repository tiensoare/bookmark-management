// src/services/api.js
// API service layer for bookmark management

const API_BASE = '/api'; // Proxy handles localhost:3001

// ==================== BOOKMARKS ====================

export const bookmarkAPI = {
  // Get all bookmarks for a user
  getAll: async (userId, isArchived = null) => {
    let url = `${API_BASE}/bookmarks?user_id=${userId}`;
    if (isArchived !== null) {
      url += `&is_archived=${isArchived}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    return response.json();
  },

  // Get single bookmark by ID
  getById: async (bookmarkId) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}`);
    if (!response.ok) throw new Error('Failed to fetch bookmark');
    return response.json();
  },

  // Create new bookmark
  create: async (bookmarkData) => {
    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmarkData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bookmark');
    }
    return response.json();
  },

  // Update bookmark
  update: async (bookmarkId, updates) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update bookmark');
    return response.json();
  },

  // Delete bookmark
  delete: async (bookmarkId) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete bookmark');
    return response.json();
  },

  // Toggle archive status
  toggleArchive: async (bookmarkId) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}/archive`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to toggle archive');
    return response.json();
  },
};

// ==================== IMAGES ====================

export const imageAPI = {
  // Get all images for a bookmark
  getAll: async (bookmarkId) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}/images`);
    if (!response.ok) throw new Error('Failed to fetch images');
    return response.json();
  },

  // Add image to bookmark
  create: async (bookmarkId, imageData) => {
    const response = await fetch(`${API_BASE}/bookmarks/${bookmarkId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imageData),
    });
    if (!response.ok) throw new Error('Failed to add image');
    return response.json();
  },

  // Delete image
  delete: async (imageId) => {
    const response = await fetch(`${API_BASE}/images/${imageId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete image');
    return response.json();
  },
};

// ==================== USERS ====================

export const userAPI = {
  // Get user by ID
  getById: async (userId) => {
    const response = await fetch(`${API_BASE}/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  // Get user by email
  getByEmail: async (email) => {
    const response = await fetch(`${API_BASE}/users/email/${email}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
};

// ==================== HEALTH CHECK ====================

export const checkHealth = async () => {
  const response = await fetch('/health');
  if (!response.ok) throw new Error('API health check failed');
  return response.json();
};