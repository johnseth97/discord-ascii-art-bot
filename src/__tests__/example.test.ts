import { convertGIF } from "../services/ascii-converter";
import { convertPNG } from "../services/ascii-converter";
import { convertText } from "../services/ascii-converter";

//TODO: Add tests for the GIF conversion
describe("convertGIF()", () => {
  it("should throw on a non-existent file", async () => {
    await expect(
      convertGIF("no-such-file.gif", { flags: [] }),
    ).rejects.toThrow();
  });
});

//TODO: Add tests for the PNG conversion
describe("convertIMG()", () => {
  it("should throw on a non-existent file", async () => {
    await expect(
      convertPNG("no-such-file.png", { flags: [] }),
    ).rejects.toThrow();
  });
});

//TODO: Add tests for the TXT conversion
describe("convertTXT()", () => {
  it("should throw on a non-existent file", async () => {
    await expect(
      convertText("no-such-file.txt", { flags: [] }),
    ).rejects.toThrow();
  });
});
