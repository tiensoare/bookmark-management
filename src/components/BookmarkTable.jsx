import { useEffect, useState } from "react";
import { bookmarkAPI, userAPI } from "../services/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

import "../styles/BookmarkTable.css";

const BookmarkTable = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // or "desc"
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [newBookmark, setNewBookmark] = useState({ title: "", url: "", notes: "", image: null });
  const [userId, setUserId] = useState(null);

  const fetchData = async () => {
    try {
      const user = await userAPI.getByEmail("demo@bookmarks.local");
      setUserId(user.id);
      const bookmarksData = await bookmarkAPI.getAll(user.id, false);
      setBookmarks(bookmarksData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle delete bookmark
  const handleDelete = async (bookmarkId) => {
    if (!confirm('Delete this bookmark?')) 
      return;
    try {
      await bookmarkAPI.delete(bookmarkId);
      setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
    } catch (err) {
      alert('Error deleting bookmark: ' + err.message);
    }
  };

  // Handle create bookmark
  const handleAddBookmark = async (e) => {
    e.preventDefault();
    if (!newBookmark.url || !userId) return;

    try {
      const created = await bookmarkAPI.create({
        user_id: userId,
        url: newBookmark.url.trim(),
        title: newBookmark.title.trim(),
        notes: newBookmark.notes.trim(),
        image: newBookmark.image,
      });

      setBookmarks([created, ...bookmarks]);
      setNewBookmark({ title: "", url: "", notes: "", image: null });
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
      const savedBookmark = await bookmarkAPI.update(updatedBookmark.id, updatedBookmark);
      setBookmarks(bookmarks.map((b) => (b.id === savedBookmark.id ? savedBookmark : b)));
      setEditingBookmark(null);
    } catch (err) {
      alert('Error saving bookmark: ' + err.message);
    }
  };

  // Sort bookmarks based on sortOrder
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    // always sort by title first, fallback to url if title missing
    const valA = (a.title?.trim() || a.url || "").toLowerCase();
    const valB = (b.title?.trim() || b.url || "").toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (bookmarks.length === 0) return <p>No bookmarks found.</p>;

  return (
    <>
      <div className="table-container">
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
              <label htmlFor="add-url">URL</label>
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
              />
            </div>
          </form>
          <div className="form-actions">
              <button type="submit" className="add-button">Add</button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setNewBookmark({ title: "", url: "", notes: "" })}
              >
                  Cancel
              </button>
          </div>
        </div>


        {/* Sort controls */}
        <div className="table-sort-controls">
          <label htmlFor="sort-order">Sort by</label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Table */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>URL</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookmarks.map((bookmark, index) => {
              const { id, title, url, notes } = bookmark;
              return (
                <tr key={id}>
                  <td>{index + 1}</td>
                  <td>{title || <em style={{ color: "#888" }}>Untitled</em>}</td>
                  <td>{url}</td>
                  <td>{notes}</td>
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
      </div>

      {/* Edit Form Modal */}
      {editingBookmark && (
        <div className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains("modal-backdrop")) {
              setEditingBookmark(null);
            }}
          }
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
                <label htmlFor="edit-title">Title:</label>
                <input id="edit-title" name="title" defaultValue={editingBookmark.title} />
              </div>
              <div className="form-row">
                <label htmlFor="edit-url">URL:</label>
                <input id="edit-url" name="url" defaultValue={editingBookmark.url} required />
              </div>
              <div className="form-row">
                <label htmlFor="edit-notes">Notes:</label>
                <input id="edit-notes" name="notes" defaultValue={editingBookmark.notes} />
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


    </>

  );
};

export default BookmarkTable;
