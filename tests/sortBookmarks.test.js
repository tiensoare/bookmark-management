import { sortBookmarks } from "../src/utils/sortBookmarks";

describe("sortBookmarks", () => {
    const bookmarks = [
        {
            title: "Google",
            url: "https://www.google.com",
            created_at: "2023-01-01T10:00:00Z",
            updated_at: "2023-01-02T10:00:00Z",
        },
        {
            title: "Apple",
            url: "https://www.apple.com",
            created_at: "2023-01-03T10:00:00Z",
            updated_at: "2023-01-04T10:00:00Z",
        },
        {
            title: "Microsoft",
            url: "https://www.microsoft.com",
            created_at: "2023-01-02T10:00:00Z",
            updated_at: null,
        },
    ];

    test("sort by title ascending", () => {
        const sorted = sortBookmarks(bookmarks, "title", "asc");
        expect(sorted[0].title).toBe("Apple");
        expect(sorted[1].title).toBe("Google");
        expect(sorted[2].title).toBe("Microsoft");
    });
    
    test("sort by title descending", () => {
        const sorted = sortBookmarks(bookmarks, "title", "desc");
        expect(sorted[0].title).toBe("Microsoft");
        expect(sorted[1].title).toBe("Google");
        expect(sorted[2].title).toBe("Apple");
    });

    test("sort by date_added ascending", () => {
        const sorted = sortBookmarks(bookmarks, "date_added", "asc");
        expect(sorted[0].title).toBe("Google");
        expect(sorted[1].title).toBe("Microsoft");
        expect(sorted[2].title).toBe("Apple");
    });

    test("sort by date_added descending", () => {
        const sorted = sortBookmarks(bookmarks, "date_added", "desc");
        expect(sorted[0].title).toBe("Apple");
        expect(sorted[1].title).toBe("Microsoft");
        expect(sorted[2].title).toBe("Google");
    });

    test("sort by date_modified ascending", () => {
        const sorted = sortBookmarks(bookmarks, "date_modified", "asc");
        expect(sorted[0].title).toBe("Google");
        expect(sorted[1].title).toBe("Microsoft");
        expect(sorted[2].title).toBe("Apple");
    });

    test("sort by date_modified descending", () => {
        const sorted = sortBookmarks(bookmarks, "date_modified", "desc");
        expect(sorted[0].title).toBe("Apple");
        expect(sorted[1].title).toBe("Google");
        expect(sorted[2].title).toBe("Microsoft");
    });
});