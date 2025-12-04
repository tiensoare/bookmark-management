import { useEffect, useState } from "react";
import { bookmarkAPI, userAPI, imageAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { sortBookmarks } from "../utils/sortBookmarks"; 
import { formatDate } from "../utils/formatDate";
import { replaceBookmarkImage } from "../utils/imageUtils";
import { fetchBookmarksData } from "../services/bookmarkService";
import { addBookmark, saveBookmark, cancelAddBookmark } from "../services/bookmarkHandlers";

import "../styles/BookmarkTable.css";

const BookmarkTable = ({ initialBookmarks = null}) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkImages, setBookmarkImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("title"); // Changed from sortOrder to sortBy
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [newBookmark, setNewBookmark] = useState({ title: "", url: "", notes: "", image: null });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (initialBookmarks) {
      setBookmarks(initialBookmarks);
      setLoading(false);
      return; // Skip fetchData if initialBookmarks provided
    }
    fetchBookmarksData(setBookmarks, setBookmarkImages, setUserId, setLoading, setError);
  }, [initialBookmarks]);


  // Handle delete bookmark
  const handleDelete = async (bookmarkId) => {
    if (!confirm('Delete this bookmark?')) 
      return;
    try {
      await bookmarkAPI.delete(bookmarkId);
      await fetchBookmarksData(setBookmarks, setBookmarkImages, setUserId, setLoading, setError);
    } catch (err) {
      alert('Error deleting bookmark: ' + err.message);
    }
  };

  // Handle add bookmark
  const handleAddBookmark = async (e) => {
    e.preventDefault();
    try {
      await addBookmark(newBookmark, userId, setNewBookmark, () => fetchBookmarksData(setBookmarks, setBookmarkImages, setUserId, setLoading, setError));
    } catch (err) {
      alert("Error creating bookmark: " + err.message);
    }
  };

  // Handle edit bookmark
  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
  };

  // Handle save bookmark after editing
  const handleSave = async (updatedBookmark) => {
      try {
      await saveBookmark(
        updatedBookmark, 
        bookmarkImages, 
        setBookmarkImages, 
        () => fetchBookmarksData(
          setBookmarks, 
          setBookmarkImages, 
          setUserId, 
          setLoading, 
          setError)
      );
      setEditingBookmark(null);
    } catch (err) {
      console.error("Error saving bookmark:", err);
      alert("Error saving bookmark: " + err.message);
    }
  };

  // Handle cancel add
  const handleCancelAdd = () => {
    cancelAddBookmark(setNewBookmark);
  };

  // Handle delete image
  const handleDeleteImage = async (imageId, bookmarkId) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      await imageAPI.delete(imageId);
      
      // Remove image from state
      setBookmarkImages(prev => {
        const updated = { ...prev };
        delete updated[bookmarkId];
        return updated;
      });
      
      // Close the modal
      setViewingImage(null);
      
      alert('Image deleted successfully');
    } catch (err) {
      alert('Error deleting image: ' + err.message);
    }
  };


  // Sort bookmarks based on sortBy and sortOrder
  const sortedBookmarks = sortBookmarks(bookmarks, sortBy, sortOrder);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="table-container">
        
        {/* Add Bookmark Form */}
        <div className="add-bookmark-card">
          <div className="card-label"><h3>Add Bookmark</h3></div>
          <form className="add-bookmark-form" onSubmit={handleAddBookmark}>
            <div className="form-row">
              <label htmlFor="add-title">Title</label>
              <input
                id="add-title"
                type="text"
                placeholder="Example"
                value={newBookmark.title}
                onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <label htmlFor="add-url">
                URL <span style={{ color: "red" }}>*</span>
              </label>
              <input
                id="add-url"
                type="url"
                placeholder="https://example.com"
                required
                value={newBookmark.url}
                onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <label htmlFor="add-notes">Notes</label>
              <input
                id="add-notes"
                type="text"
                placeholder="Optional notes"
                value={newBookmark.notes}
                onChange={(e) => setNewBookmark({ ...newBookmark, notes: e.target.value })}
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <label htmlFor="add-image">Image</label>
              {/* <div className="file-input-wrapper"> */}
                <input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewBookmark({ ...newBookmark, image: file });
                    }
                  }}
                  style={{ display: 'none', width: '100%' }}
                />
                <label 
                  htmlFor="add-image" 
                  className={`file-input-label ${newBookmark.image ? 'has-file' : ''}`}
                >
                  {newBookmark.image ? `📎 ${newBookmark.image.name}` : '📁 Choose Image'}
                </label>
              {/* </div> */}
            </div>

            <div className="form-actions">
              <button type="submit" className="add-button">Add</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={handleCancelAdd}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Sort controls */}
        <div className="table-header">
          <div className="table-title">
            <span>My Bookmarks</span>
            <span className="bookmark-count">({bookmarks.length})</span>
          </div>

          <div className="table-sort-controls">
            <label htmlFor="sort-by">Sort by</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="date_added">Date Added</option>
              <option value="date_modified">Date Modified</option>
            </select>
            
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">
                {sortBy === 'title' ? 'A → Z' : 'Oldest First'}
              </option>
              <option value="desc">
                {sortBy === 'title' ? 'Z → A' : 'Newest First'}
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        {bookmarks.length === 0 ? (
          <p>No bookmarks found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>URL</th>
                <th>Notes</th>
                <th>Date Added</th>
                <th>Date Modified</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBookmarks.map((bookmark, index) => {
                const { id, title, url, notes, created_at, updated_at } = bookmark;
                const image = bookmarkImages[id];
                return (
                  <tr key={id}>
                    <td>{index + 1}</td>

                    <td>{title || <em style={{ color: "#888" }}>Untitled</em>}</td>
                    <td>{url}</td>
                    <td>{notes}</td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formatDate(created_at)}
                    </td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {formatDate(updated_at || created_at)}
                    </td>
                    <td>
                      {image ? (
                        <button 
                          className="view-image-button"
                          onClick={() => setViewingImage(image)}
                        >
                          View Image
                        </button>
                      ) : (
                        <span style={{ color: '#888', fontSize: '12px' }}>No image</span>
                      )}
                    </td>
                    <td className="actions">
                      <button className="icon-button edit" onClick={() => handleEdit(bookmark)}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                      <button className="icon-button delete" onClick={() => handleDelete(id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Form Modal */}
      {editingBookmark && (
        <div className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains("modal-backdrop")) {
              setEditingBookmark(null);
            }
          }}
        >
          <div className="modal">
            <h3>Edit Bookmark</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated = {
                  ...editingBookmark,
                  title: e.target.title.value,
                  url: e.target.url.value,
                  notes: e.target.notes.value,
                };
                handleSave(updated);
              }}
            >
              <div className="form-row">
                <label htmlFor="edit-title">Title</label>
                <input id="edit-title" name="title" defaultValue={editingBookmark.title} />
              </div>
              <div className="form-row">
                <label htmlFor="edit-url">URL<span style={{ color: "red" }}>*</span></label>
                <input id="edit-url" name="url" type="url" defaultValue={editingBookmark.url} required />
              </div>
              <div className="form-row">
                <label htmlFor="edit-notes">Notes</label>
                <input id="edit-notes" name="notes" defaultValue={editingBookmark.notes} />
              </div>
              <div className="form-row">
                <label htmlFor="edit-image">Image</label>
                <div className="file-input-wrapper">
                  <input
                    id="edit-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditingBookmark({
                          ...editingBookmark,
                          newImageFile: file,
                          preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="edit-image" 
                    className={`file-input-label ${editingBookmark.newImageFile ? 'has-file' : ''}`}
                    style={{ color: '#000', width: '100%' }}
                  >
                    {editingBookmark.newImageFile ? `📎 ${editingBookmark.newImageFile.name}` : '📁 Choose New'}
                  </label>
                  
                  {/* Show existing image if available and no new preview */}
                  {!editingBookmark.preview && bookmarkImages[editingBookmark.id] && (
                    <div className="image-preview">
                      {/* <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Current image:</p> */}
                      <img
                        src={bookmarkImages[editingBookmark.id].image_url}
                        alt="Current bookmark"
                        style={{ maxWidth: "150px", maxHeight: "100px", borderRadius: "6px" }}
                      />
                    </div>
                  )}

                  {/* Show new preview if user selected a new file */}
                  {editingBookmark.preview && (
                    <div className="image-preview">
                      {/* <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>New image preview:</p> */}
                      <img
                        src={editingBookmark.preview}
                        alt="New preview"
                        style={{ maxWidth: "150px", maxHeight: "100px", borderRadius: "6px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBookmark({
                            ...editingBookmark,
                            newImageFile: null,
                            preview: null,
                          });
                          document.getElementById('edit-image').value = '';
                        }}
                        style={{ 
                          fontSize: '12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          marginTop: '4px',}}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-button">Save</button>
                <button 
                  type="button" 
                  className="cancel-button" 
                  onClick={() => setEditingBookmark(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      
      {viewingImage && (
        <div 
          className="modal-backdrop image-viewer-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains("image-viewer-backdrop")) {
              setViewingImage(null);
            }
          }}
        >
          <div className="image-viewer-modal">
            <button 
              className="close-image-button"
              onClick={() => setViewingImage(null)}
              aria-label="Close image"
            >
              ✕
            </button>
            <img 
              src={viewingImage.image_url} 
              alt={viewingImage.caption || 'Bookmark image'} 
              className="viewed-image"
            />
            {/* {viewingImage.caption && (
              <p className="image-caption">{viewingImage.caption}</p>
            )} */}
            <button 
              className="delete-image-button"
              onClick={() => handleDeleteImage(viewingImage.id, viewingImage.bookmark_id)}
            >
              <FontAwesomeIcon icon={faTrash} /> Delete Image
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default BookmarkTable;