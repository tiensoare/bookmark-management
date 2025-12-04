import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark } from '@fortawesome/free-solid-svg-icons';

function Layout({ children }) {
  return (
    <div>
      <header
        style={{
          background: "#630031",
          color: "white",
          padding: "0rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* <FontAwesomeIcon icon={byPrefixAndName.fas['bookmark']}  /> */}
        <h2><FontAwesomeIcon icon={faBookmark} style={{marginRight: "0.3rem"}} />Bookie</h2>
        {/* <nav>
          <a href="/" style={{ color: "white", marginLeft: "1rem", textDecoration: "none" }}>
            Home
          </a>
          <a href="/add" style={{ color: "white", marginLeft: "1rem", textDecoration: "none" }}>
            Add Bookmark
          </a>
        </nav> */}
      </header>

      <main style={{ padding: "0rem" }}>{children}</main>

      <footer
        style={{
          background: "#ecf0f1",
          textAlign: "center",
          padding: "1rem",
          color: "#7f8c8d",
        }}
      >
        <small>© {new Date().getFullYear()} Bookie</small>
      </footer>
    </div>
  );
}

export default Layout;
