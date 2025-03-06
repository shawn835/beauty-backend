import fs from "fs/promises";
import path from "path";

export const serveStaticFiles = async (req, res, folderPath) => {
  try {
    const fileName = req.url.split("/").pop();

    const filePath = path.join(folderPath, fileName);

    const data = await fs.readFile(filePath);

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
