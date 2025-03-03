import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, process.env.SAMPLE_IMAGES_PATH);

export const serveStaticFiles = async (req, res) => {
  try {
    const filePath = path.join(
      uploadDir,
      req.url.replace("/BookingSamplesImages/", "")
    );

    const data = await fs.readFile(filePath); // ✅ Await readFile

    // Handling MIME type
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".png"
        ? "image/png"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "File not found" }));
  }
};
