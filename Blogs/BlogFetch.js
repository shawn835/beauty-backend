import path from "path";
import { fileURLToPath } from "url";
import { readJson } from "../utility/readJson.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, process.env.BLOGS_JSON_PATH);

export const fetchBlogs = async (req, res) => {
  try {
    const blogs = await readJson(filePath);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(blogs));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Failed to fetch blogs" }));
  }
};
