// src/pages/Home.jsx
import BookmarkList from '../components/BookmarkList';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Bookmark Management</h1>
      <p>Manage all your bookmarks easily in one place.</p>
      
      <BookmarkList />
    </div>
  );
}
