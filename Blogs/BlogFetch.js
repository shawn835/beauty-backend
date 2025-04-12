import path from "path";
import { fileURLToPath } from "url";
import { readJson } from "../utility/readJson.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, process.env.BLOGS_JSON_PATH);

export const fetchBlogs = async (req, res) => {
  try {
    const blogs = await readJson(filePath);
    const fullApiUrl = `${process.env.BACKEND_URL}/displayImages`; // Ensure BACKEND_URL is set

    // Map through blogs and update `imageDisplay`
    const updatedBlogs = blogs.map((blog) => ({
      ...blog,
      imageDisplay: `${fullApiUrl}/${blog.imageDisplay.split("/").pop()}`, // Convert to full URL
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(updatedBlogs));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Failed to fetch blogs" }));
  }
};
