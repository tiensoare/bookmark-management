// utils/imageUtils.js
import { imageAPI } from "../services/api";

/**
 * Replaces the existing bookmark image with a new one.
 *
 * @param {number} bookmarkId - ID of the bookmark
 * @param {File} newFile - New image file
 * @param {object|null} existingImage - Existing image object to delete
 * @returns {Promise<object>} - Uploaded image object
 */
export const replaceBookmarkImage = async (
  bookmarkId,
  newFile,
  existingImage = null,
  api = imageAPI
) => {

  // Delete old image if it exists
  if (existingImage) {
    try {
      await api.delete(existingImage.id);
    } catch (err) {
      console.error('Failed to delete existing image:', err);
    }
  }

  // Convert new file to base64
  const base64Image = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(newFile);
  });

  // Extract content type
  const contentTypeMatch = base64Image.match(/data:([^;]+);base64,/);
  const content_type = contentTypeMatch ? contentTypeMatch[1] : "image/jpeg";

  // Upload new image
  const uploadedImage = await api.create(bookmarkId, {
    image_url: base64Image,
    content_type,
    caption: null,
  });

  return uploadedImage;
};


/**
 * Delete a bookmark image
 * @param {number} imageId
 * @param {number} bookmarkId
 * @param {function} setBookmarkImages - state setter to remove image from state
 * @param {function} setViewingImage - state setter to close image modal
 */
export const deleteBookmarkImage = async (imageId, bookmarkId, setBookmarkImages, setViewingImage) => {
  if (!confirm("Delete this image?")) return;
  try {
    await imageAPI.delete(imageId);

    setBookmarkImages(prev => {
      const updated = { ...prev };
      delete updated[bookmarkId];
      return updated;
    });

    setViewingImage(null);
    alert("Image deleted successfully");
  } catch (err) {
    alert("Error deleting image: " + err.message);
  }
};