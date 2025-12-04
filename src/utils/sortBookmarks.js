export function sortBookmarks(bookmarks, sortBy, sortOrder) {
  return [...bookmarks].sort((a, b) => {
    let valA, valB

    switch (sortBy) {
      case "title":
        valA = (a.title?.trim() || a.url || "").toLowerCase()
        valB = (b.title?.trim() || b.url || "").toLowerCase()
        break

      case "date_added":
        valA = new Date(a.created_at).getTime()
        valB = new Date(b.created_at).getTime()
        break

      case "date_modified":
        valA = new Date(a.updated_at || a.created_at).getTime()
        valB = new Date(b.updated_at || b.created_at).getTime()
        break

      default:
        valA = (a.title?.trim() || a.url || "").toLowerCase()
        valB = (b.title?.trim() || b.url || "").toLowerCase()
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1
    if (valA > valB) return sortOrder === "asc" ? 1 : -1
    return 0
  })
}