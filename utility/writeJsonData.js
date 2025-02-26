// Write JSON file */
import fs from "fs/promises";

export const writeJSON = async (filepath, newEntry) => {
  try {
    let existingData = [];

    try {
      const fileContent = await fs.readFile(filepath, "utf-8");

      // Check if the file has content before parsing
      existingData = fileContent.trim() ? JSON.parse(fileContent) : [];
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("File not found, creating a new one.");
        existingData = [];
      } else {
        throw error;
      }
    }

    // Append new data
    existingData.push(newEntry);

    // Write the updated data back to file
    await fs.writeFile(filepath, JSON.stringify(existingData, null, 2));
  } catch (error) {
    console.error("Error writing to JSON file:", error);
    throw error;
  }
};
