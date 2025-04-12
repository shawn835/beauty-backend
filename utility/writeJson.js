import fs from "fs/promises";

export const writeJson = async (data, filePath) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error writing JSON file:", error);
    return { success: false, error: "Failed to write JSON file" };
  }
};
