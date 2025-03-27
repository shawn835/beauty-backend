import fs from "fs/promises";
import path from "path";

export const serveStaticOrPreRendered = async (req, res, folderPath) => {
  try {
    const fileName = req.url.split("/").pop(); // Get the last part of the URL
    const ext = path.extname(fileName).toLowerCase(); // Get file extension
    let filePath = path.join(folderPath, fileName);

    // If no extension is found, assume it's an HTML pre-rendered page
    if (!ext) {
      filePath += ".html";
    }

    const data = await fs.readFile(filePath); // Read the file

    // Set appropriate Content-Type
    const contentType = ext
      ? getContentType(ext) // If it's a static file (image, etc.)
      : "text/html"; // If it's an HTML pre-rendered page

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);

    console.log(`Served file: ${filePath}`);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>Page Not Found</h1>");
    console.error(`Error serving file: ${err.message}`);
  }
};

// Helper function to determine Content-Type
const getContentType = (ext) => {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".css":
      return "text/css";
    case ".js":
      return "application/javascript";
    default:
      return "application/octet-stream";
  }
};
