import fs from "fs/promises";
import path from "path";

export const serveStaticOrPreRendered = async (req, res, folderPath) => {
  try {
    const fileName = req.url.split("/").pop();
    const ext = path.extname(fileName).toLowerCase();

    let filePath = path.join(folderPath, fileName);

    if (!ext) {
      filePath += ".html";
    }

    const data = await fs.readFile(filePath);
    const contentType = ext ? getContentType(ext) : "text/html";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>Page Not Found</h1>");
    console.error(`Error serving file: ${err.message}`);
  }
};

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
