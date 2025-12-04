// src/pages/Home.jsx
// import BookmarkList from '../components/BookmarkList';
import BookmarkTable from '../components/BookmarkTable';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Bookie</h1>
      <p>Manage all your bookmarks easily in one place.</p>

      {/* <BookmarkList /> */}
      <BookmarkTable />
    </div>
  );
}

export default Home;