import { bookmarkAPI, imageAPI } from "./api";
import { replaceBookmarkImage } from "../utils/imageUtils";

export const addBookmark = async (newBookmark, userId, resetNewBookmark, fetchData) => {
  if (!newBookmark.url || !/^https?:\/\/.+/i.test(newBookmark.url.trim())) {
    throw new Error("Please enter a valid URL starting with http:// or https://");
  }

  await bookmarkAPI.create({
    user_id: userId,
    url: newBookmark.url.trim(),
    title: newBookmark.title.trim(),
    notes: newBookmark.notes.trim(),
    image: newBookmark.image,
  });

  await fetchData();

  // Reset new bookmark state
  resetNewBookmark({ title: "", url: "", notes: "", image: null });

  // Reset file input
  const fileInput = document.getElementById('add-image');
  if (fileInput) fileInput.value = '';
};

/**
 * Save updated bookmark details and optionally replace image
 *
 * @param {object} updatedBookmark - Bookmark object with possible newImageFile
 * @param {object} bookmarkImages - Current bookmarkImages state
 * @param {function} setBookmarkImages - React state setter for bookmarkImages
 * @param {function} fetchData - Function to refresh bookmark data
 */
export const saveBookmark = async (
  updatedBookmark,
  bookmarkImages,
  setBookmarkImages,
  fetchData
) => {
  const url = updatedBookmark.url?.trim();

  if (!url) throw new Error("URL is required.");
  if (!/^https?:\/\/.+/i.test(url)) throw new Error("Please enter a valid URL starting with http:// or https://");

  // Update bookmark details
  await bookmarkAPI.update(updatedBookmark.id, {
    url: updatedBookmark.url,
    title: updatedBookmark.title,
    notes: updatedBookmark.notes,
  });

  // Handle image replacement if a new file is provided
  if (updatedBookmark.newImageFile && updatedBookmark.newImageFile instanceof File) {
    const existingImage = bookmarkImages[updatedBookmark.id] || null;
    const uploadedImage = await replaceBookmarkImage(
      updatedBookmark.id,
      updatedBookmark.newImageFile,
      existingImage,
      imageAPI
    );

    setBookmarkImages(prev => ({
      ...prev,
      [updatedBookmark.id]: uploadedImage
    }));
  }

  await fetchData();
}; 


/**
 * Cancel adding a new bookmark
 * @param {function} resetNewBookmark - Function to reset newBookmark state
 */
export const cancelAddBookmark = (resetNewBookmark) => {
  resetNewBookmark({ title: "", url: "", notes: "", image: null });
  const fileInput = document.getElementById('add-image');
  if (fileInput) fileInput.value = '';
};

/**
 * Delete a bookmark
 * @param {number} bookmarkId
 * @param {function} fetchData - function to refresh bookmarks after deletion
 */
export const deleteBookmark = async (bookmarkId, fetchData) => {
  if (!confirm("Delete this bookmark?")) return;
  try {
    await bookmarkAPI.delete(bookmarkId);
    await fetchData();
  } catch (err) {
    alert("Error deleting bookmark: " + err.message);
  }
};