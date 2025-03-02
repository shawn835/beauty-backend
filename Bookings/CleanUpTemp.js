import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempUploadDir = process.env.TEMP_DIR
  ? path.resolve(__dirname, process.env.TEMP_DIR)
  : path.resolve(__dirname, "TemporaryDir");

const deleteAfter = Number(process.env.DELETE_AFTER) || 5;

export const cleanUpTempFolder = async () => {
  try {
    const files = await fs.readdir(tempUploadDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(tempUploadDir, file);
      const stats = await fs.stat(filePath);

      const fileAgeMinutes = (now - stats.mtimeMs) / (1000 * 60);

      if (fileAgeMinutes > deleteAfter) {
        await fs.unlink(filePath);
      }
    }
  } catch (error) {
    console.error("Error cleaning temp folder:", error);
  }
};
