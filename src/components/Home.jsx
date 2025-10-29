// src/pages/Home.jsx
import BookmarkList from '../components/BookmarkList';
import BookmarkTable from '../components/BookmarkTable';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Bookie</h1>
      <p>Manage all your bookmarks easily in one place.</p>
      
      <BookmarkTable />
    </div>
  );
}
