import { formatDate } from "../src/utils/formatDate";

describe("formatDate", () => {
  test("returns N/A for null or empty", () => {
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate("")).toBe("N/A");
  });

  test("formats ISO string", () => {
    const result = formatDate("2024-01-01T10:30:00Z");
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4} \d{2}:\d{2}/);
  });
});
