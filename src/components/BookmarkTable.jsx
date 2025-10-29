// // src/pages/Home.jsx
// import { use, useEffect, useState } from "react";
// import {bookmarkAPI, userAPI} from '../services/api';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

// import '../styles/BookmarkTable.css';

// // const API = "https://jsonplaceholder.typicode.com/users";

// const BookmarkTable = () =>
// {
//   const [bookmarks, setBookmarks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [sortField, setSortField] = useState('title');
//   const [sortOrder, setSortOrder] = useState('asc');
  

//   const fetchData = async () => {
//     try {
//       // Get demo user
//       const user = await userAPI.getByEmail('demo@bookmarks.local');
//         setUserId(user.id);
//         // Get their bookmarks
//         const bookmarksData = await bookmarkAPI.getAll(user.id, false);
//         setBookmarks(bookmarksData);
//         setLoading(false);
//     } catch (err) {
//         setError(err.message);
//         setLoading(false);
//     }
//   }

//   useEffect(() => {
//       fetchData();
//       }, []);

//   const handleEdit = (id) => {
//     console.log("Edit bookmark:", id);
//     // TODO: open edit modal or navigate to edit page
//   };

//   const handleDelete = (id) => {
//     console.log("Delete bookmark:", id);
//     // TODO: confirm and delete
//   };

//   const handleSortFieldChange = (e) => {
//     setSortField(e.target.value);
//   };

//   const handleSortOrderToggle = () => {
//     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//   };

//   const sortedBookmarks = [...bookmarks].sort((a, b) => {
//     let valA = a[sortField].toLowerCase() || '';
//     let valB = b[sortField].toLowerCase() || '';

//     // If sorting by title and it's empty, fallback to URL
//     if (sortField === "title") {
//       valA = valA.trim() || a.url || "";
//       valB = valB.trim() || b.url || "";
//     }

//     valA = valA.toString().toLowerCase();
//     valB = valB.toString().toLowerCase();

//     if (valA < valB) return sortOrder === "asc" ? -1 : 1;
//     if (valA > valB) return sortOrder === "asc" ? 1 : -1;
//     return 0;
//   });

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;
//   if (bookmarks.length === 0) return <p>No bookmarks found.</p>;
// //   return(
// //     <table>
// //       <thead>
// //         <tr>
// //           <th>#</th>
// //           <th>Title</th>
// //           <th>URL</th>
// //           <th>Notes</th>
// //           <th>Actions</th>
// //         </tr>
// //       </thead>
// //       <tbody>
// //         {
// //           bookmarks.map((bookmark, index) => {
// //             const {id,title, url, notes} = bookmark;
// //             return (
// //             <tr key={id}>
// //               <td>{index + 1}</td>
// //               <td>{title}</td>
// //               <td>{url}</td>
// //               <td>{notes}</td>
// //               <td className="actions">
// //                 <button
// //                   className="icon-button edit"
// //                   onClick={() => handleEdit(id)}
// //                 >
// //                   <FontAwesomeIcon icon={faPenToSquare} />
// //                 </button>
// //                 <button
// //                   className="icon-button delete"
// //                   onClick={() => handleDelete(id)}
// //                 >
// //                   <FontAwesomeIcon icon={faTrash} />
// //                 </button>
// //               </td>
// //             </tr>
// //             )
// //           })}
// //       </tbody>
// //     </table>)
// // }
//   return (
//     <>
//       {/* Header with Sort Controls */}
//       <div className="table-header">
//         <h2>My Bookmarks</h2>
//         <div className="sort-controls">
//           <label>Sort by:</label>
//           <select value={sortField} onChange={handleSortFieldChange}>
//             <option value="title">Title</option>
//             <option value="url">URL</option>
//             <option value="notes">Notes</option>
//           </select>
//           <button className="sort-button" onClick={handleSortOrderToggle}>
//             {sortOrder === "asc" ? (
//               <>
//                 <FontAwesomeIcon icon={faArrowUp} /> Asc
//               </>
//             ) : (
//               <>
//                 <FontAwesomeIcon icon={faArrowDown} /> Desc
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <table>
//         <thead>
//           <tr>
//             <th>#</th>
//             <th>Title</th>
//             <th>URL</th>
//             <th>Notes</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {sortedBookmarks.map((bookmark, index) => {
//             const { id, title, url, notes } = bookmark;
//             return (
//               <tr key={id}>
//                 <td>{index + 1}</td>
//                 <td>{title || <em style={{ color: "#888" }}>Untitled</em>}</td>
//                 <td>{url}</td>
//                 <td>{notes}</td>
//                 <td className="actions">
//                   <button
//                     className="icon-button edit"
//                     onClick={() => handleEdit(id)}
//                   >
//                     <FontAwesomeIcon icon={faPenToSquare} />
//                   </button>
//                   <button
//                     className="icon-button delete"
//                     onClick={() => handleDelete(id)}
//                   >
//                     <FontAwesomeIcon icon={faTrash} />
//                   </button>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </>
//   );
// }


// export default BookmarkTable;

// src/pages/Home.jsx
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

  const fetchData = async () => {
    try {
      const user = await userAPI.getByEmail("demo@bookmarks.local");
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

  const handleEdit = (bookmark) => {
    setEditingBookmark(bookmark);
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

  const handleSave = async (updatedBookmark) => {
    try {
      const savedBookmark = await bookmarkAPI.update(updatedBookmark.id, updatedBookmark);
      setBookmarks(bookmarks.map((b) => (b.id === savedBookmark.id ? savedBookmark : b)));
      setEditingBookmark(null);
    } catch (err) {
      alert('Error saving bookmark: ' + err.message);
    }
  };

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
        {/* Sort controls */}
        <div className="table-sort-controls">
          <label>Sort by</label>
          <select
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
        <div className="modal-backdrop">
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
                <label>Title:</label>
                <input name="title" defaultValue={editingBookmark.title} />
              </div>
              <div className="form-row">
                <label>URL:</label>
                <input name="url" defaultValue={editingBookmark.url} required />
              </div>
              <div className="form-row">
                <label>Notes:</label>
                <input name="notes" defaultValue={editingBookmark.notes} />
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-button">Save</button>
                <button type="button" className="cancel-button" onClick={() => setEditingBookmark(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </>

  );
};

export default BookmarkTable;
