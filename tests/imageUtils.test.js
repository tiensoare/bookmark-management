import { replaceBookmarkImage } from "../src/utils/imageUtils.js";

describe("replaceBookmarkImage", () => {
  const calls = { delete: 0, create: 0 };
  const fakeApi = {
    delete: async (id) => { calls.delete++; return { success: true }; },
    create: async (bookmarkId, data) => { calls.create++; return { id: 301, image_url: data.image_url }; },
  };

  const bookmarkId = 1;
  const oldImage = { id: 201 };
  const newFile = new File([new Blob(["abc"])], "abc.png", { type: "image/png" });

  it("replaces existing image", async () => {
    calls.delete = 0;
    calls.create = 0;

    const uploaded = await replaceBookmarkImage(bookmarkId, newFile, oldImage, fakeApi);

    if (calls.delete !== 1) throw new Error("delete not called");
    if (calls.create !== 1) throw new Error("create not called");
    if (uploaded.id !== 301) throw new Error("Upload failed");
  });

  it("uploads new image when no existing image", async () => {
    calls.delete = 0;
    calls.create = 0;

    const uploaded = await replaceBookmarkImage(bookmarkId, newFile, null, fakeApi);

    if (calls.delete !== 0) throw new Error("delete should not be called");
    if (calls.create !== 1) throw new Error("create not called");
    if (uploaded.id !== 301) throw new Error("Upload failed");
  });
});
