import formidable from "formidable";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { writeJson } from "../utility/writeJson.js";
import { readJson } from "../utility/readJson.js";
import {
  normalizeFormidableFields,
  validateAndSanitizeBlogData,
} from "./blogsSanitization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const displayImagesFolder = path.resolve(__dirname, "./displayImages");
const postImagesFolder = path.resolve(__dirname, "./postImages");
const blogsFile = path.join(__dirname, process.env.BLOGS_JSON_PATH);
import { ensureDirExists } from "../utility/MiddleWare.js";

export const handleBlogPosts = async (req, res) => {
  await ensureDirExists(displayImagesFolder);
  await ensureDirExists(postImagesFolder);

  const form = formidable({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (error, fields, files) => {
    if (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "File upload error" }));
    }

    try {
      const displayImage = Array.isArray(files.image)
        ? files.image[0]
        : files.image;

      const postImages = files.postImages
        ? Array.isArray(files.postImages)
          ? files.postImages
          : [files.postImages]
        : [];

      // Process fields
      const blogs = await readJson(blogsFile);
      const normalized = normalizeFormidableFields(fields);
      const safeInputs = validateAndSanitizeBlogData(normalized);
      const blogTags = Array.isArray(safeInputs.tags) ? safeInputs.tags : [];
      const metaKeywords = Array.isArray(safeInputs.meta.keywords)
        ? safeInputs.meta.keywords
        : [];

      let displayImageUrl;
      if (displayImage) {
        const displayImagePath = path.join(
          displayImagesFolder,
          displayImage.originalFilename
        );
        displayImageUrl = `/displayImages/${displayImage.originalFilename}`;

        await fs.rename(displayImage.filepath, displayImagePath);
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "no display image provided" }));
      }

      if (postImages.length > 0) {
        for (const postImage of postImages) {
          const postImagePath = path.join(
            postImagesFolder,
            postImage.originalFilename
          );
          await fs.rename(postImage.filepath, postImagePath);
        }
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "no post images provided" }));
      }

      const newBlog = {
        id: safeInputs.id,
        title: safeInputs.title,
        slug: safeInputs.slug,
        author: safeInputs.author,
        category: safeInputs.category,
        subCategory: safeInputs.subCategory || "",
        imageDisplay: displayImageUrl,
        excerpt: safeInputs.excerpt,
        content: safeInputs.content,
        publishedDate: new Date().toISOString().split("T")[0],
        updatedDate: new Date().toISOString().split("T")[0],
        tags: blogTags,
        meta: {
          title: safeInputs.title || "",
          description: safeInputs.description || "",
          keywords: metaKeywords,
          ogImage: displayImageUrl,
        },
      };

      // Update JSON
      blogs.push(newBlog);
      await writeJson(blogs, blogsFile);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, blog: newBlog }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
};
