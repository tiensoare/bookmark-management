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

  // Create new bookmark (with image support)
  create: async (bookmarkData) => {
    // First, create the bookmark without the image
    const response = await fetch(`${API_BASE}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: bookmarkData.user_id,
        url: bookmarkData.url,
        title: bookmarkData.title,
        notes: bookmarkData.notes,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create bookmark');
    }
    
    const createdBookmark = await response.json();
    console.log('Created bookmark:', createdBookmark);
    
    // If there's an image, add it to the bookmark using the imageAPI
    if (bookmarkData.image && bookmarkData.image instanceof File) {
      try {
        // Convert image to base64
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(bookmarkData.image);
        });

        // Extract content type from base64 data URL
        // Format: data:image/jpeg;base64,/9j/4AAQ...
        const contentTypeMatch = base64Image.match(/data:([^;]+);base64,/);
        const content_type = contentTypeMatch ? contentTypeMatch[1] : 'image/jpeg';

        const payload = {
          image_url: base64Image,
          content_type: content_type,
          caption: bookmarkData.title || null,
        };

        console.log('Uploading image to bookmark:', createdBookmark.id);
        console.log('Content type:', content_type);
        console.log('Image URL length:', base64Image.length);
        console.log('Image URL prefix:', base64Image.substring(0, 50));
        console.log('Payload keys:', Object.keys(payload));

        // Add image to the bookmark with correct field names
        const imageResponse = await fetch(`${API_BASE}/bookmarks/${createdBookmark.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const responseText = await imageResponse.text();
        console.log('Image response status:', imageResponse.status);
        console.log('Image response body:', responseText);

        if (!imageResponse.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch (e) {
            errorData = { error: responseText };
          }
          console.error('Image upload failed:', errorData);
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const imageResult = JSON.parse(responseText);
        console.log('Image uploaded successfully:', imageResult);
      } catch (imageError) {
        console.error('Failed to upload image:', imageError);
        throw imageError;
      }
    }
    
    return createdBookmark;
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