import { writeJSON } from "../utility/writeJsonData.js";
import { validateAndSanitizeFormData } from "./ContactFormValidation.js";
import { parseRequestBody } from "../utility/MiddleWare.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the path to formData.json
const filePath = path.resolve(__dirname, "formData.json");

export const handleContactUsPost = async (req, res) => {
  try {
    const formData = await parseRequestBody(req);
    validateAndSanitizeFormData(formData);

    const newEntry = { ...formData, date: new Date().toISOString() };

    await writeJSON(filePath, newEntry);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: "Form submitted successfully" }));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};
