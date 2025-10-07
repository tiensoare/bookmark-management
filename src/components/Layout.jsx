function Layout({ children }) {
  return (
    <div>
      <header
        style={{
          background: "#f6c3cfff",
          color: "black",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Bookmark Manager</h2>
        <nav>
          <a href="/" style={{ color: "white", marginLeft: "1rem", textDecoration: "none" }}>
            Home
          </a>
          <a href="/add" style={{ color: "white", marginLeft: "1rem", textDecoration: "none" }}>
            Add Bookmark
          </a>
        </nav>
      </header>

      <main style={{ padding: "2rem" }}>{children}</main>

      <footer
        style={{
          background: "#ecf0f1",
          textAlign: "center",
          padding: "1rem",
          marginTop: "2rem",
        }}
      >
        <small>© {new Date().getFullYear()} Bookmark Management App</small>
      </footer>
    </div>
  );
}

export default Layout;
