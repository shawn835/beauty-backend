import fs from "fs/promises";
import formidable from "formidable";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, process.env.SAMPLE_IMAGES_PATH);
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ensureDirExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

export const convertFiles = async (req, res) => {
  await ensureDirExists(uploadDir);

  const form = formidable({ uploadDir, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "File upload failed" }));
    }

    const uploadedFile = files.file[0]; // Ensure file exists
    if (!uploadedFile) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "No file uploaded" }));
    }

    // Validate MIME type
    if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
      await fs.unlink(uploadedFile.filepath);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: `Invalid file type: ${uploadedFile.mimetype}` })
      );
    }

    // Validate file size
    if (uploadedFile.size > MAX_FILE_SIZE) {
      await fs.unlink(uploadedFile.filepath);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "File size exceeds 5MB limit." }));
    }

    //validate number
    const newPath = path.join(uploadDir, uploadedFile.originalFilename);
    await fs.rename(uploadedFile.filepath, newPath);

    const fileUrl = `/BookingSamplesImages/${uploadedFile.originalFilename}`;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ url: fileUrl }));
  });
};
