import path from "path";
import { fileURLToPath } from "url";
import { readJson } from "../utility/readJson.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname, process.env.BLOGS_JSON_PATH);

export const getBlogBySlug = async (req, res) => {
  const slug = req.url.split("/").pop();
  try {
    const blogsData = await readJson(filePath);

    const blog = blogsData.find((b) => b.slug === slug);

    if (blog) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(blog));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Blog not found" }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
