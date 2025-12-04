import { bookmarkAPI, userAPI, imageAPI } from "./api";

export const fetchBookmarksData = async (setBookmarks, setBookmarkImages, setUserId, setLoading, setError) => {
  setLoading(true);
  try {
    const user = await userAPI.getByEmail("demo@bookmarks.local");
    setUserId(user.id);

    const bookmarksData = await bookmarkAPI.getAll(user.id, false);
    setBookmarks(bookmarksData);

    const imagesMap = {};
    for (const bookmark of bookmarksData) {
      try {
        const images = await imageAPI.getAll(bookmark.id);
        if (images?.length > 0) imagesMap[bookmark.id] = images[0];
      } catch (err) {
        console.error(`Failed to fetch images for bookmark ${bookmark.id}:`, err);
      }
    }
    setBookmarkImages(imagesMap);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
