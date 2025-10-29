// src/components/BookmarkList.jsx
import { useState, useEffect } from 'react';
import { bookmarkAPI, userAPI } from '../services/api';

function BookmarkList() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // New bookmark form state
  const [newBookmark, setNewBookmark] = useState({
    url: '',
    title: '',
    notes: '',
  });

  // Fetch demo user and their bookmarks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get demo user
        const user = await userAPI.getByEmail('demo@bookmarks.local');
        setUserId(user.id);

        // Get their bookmarks
        const bookmarksData = await bookmarkAPI.getAll(user.id, false);
        setBookmarks(bookmarksData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle create bookmark
  const handleCreateBookmark = async (e) => {
    e.preventDefault();
    if (!newBookmark.url || !userId) return;

    try {
      const created = await bookmarkAPI.create({
        user_id: userId,
        url: newBookmark.url,
        title: newBookmark.title,
        notes: newBookmark.notes,
      });

      setBookmarks([created, ...bookmarks]);
      setNewBookmark({ url: '', title: '', notes: '' });
    } catch (err) {
      alert('Error creating bookmark: ' + err.message);
    }
  };

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

  // Handle archive toggle
  const handleToggleArchive = async (bookmarkId) => {
    try {
      const updated = await bookmarkAPI.toggleArchive(bookmarkId);
      setBookmarks(bookmarks.map((b) => (b.id === bookmarkId ? updated : b)));
    } catch (err) {
      alert('Error toggling archive: ' + err.message);
    }
  };

  if (loading) return <div>Loading bookmarks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📚 My Bookmarks</h1>

      {/* Create Bookmark Form */}
      <form onSubmit={handleCreateBookmark} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>Add New Bookmark</h2>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="url"
            placeholder="URL (required)"
            value={newBookmark.url}
            onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Title"
            value={newBookmark.title}
            onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <textarea
            placeholder="Notes"
            value={newBookmark.notes}
            onChange={(e) => setNewBookmark({ ...newBookmark, notes: e.target.value })}
            rows="3"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Add Bookmark
        </button>
      </form>

      {/* Bookmarks List */}
      <div>
        <h2>Your Bookmarks ({bookmarks.length})</h2>
        {bookmarks.length === 0 ? (
          <p>No bookmarks yet. Add one above!</p>
        ) : (
          bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                padding: '15px',
                marginBottom: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: bookmark.is_archived ? '#f5f5f5' : 'white',
              }}
            >
              <h3>
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                  {bookmark.title || bookmark.url}
                </a>
              </h3>
              <p style={{ fontSize: '12px', color: '#666' }}>{bookmark.url}</p>
              {bookmark.notes && <p style={{ marginTop: '10px' }}>{bookmark.notes}</p>}
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={() => handleToggleArchive(bookmark.id)}
                  style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer' }}
                >
                  {bookmark.is_archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Delete
                </button>
                <span style={{ marginLeft: '15px', fontSize: '12px', color: '#999' }}>
                  {bookmark.images_count} image(s)
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookmarkList;