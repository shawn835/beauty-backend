import fs from "fs/promises";

export const readJson = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const parsedData = JSON.parse(data);
    return Array.isArray(parsedData) ? parsedData : []; // Ensure it's an array
  } catch (error) {
    return []; // Return empty array if file is missing or invalid
  }
};
