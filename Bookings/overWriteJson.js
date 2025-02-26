import fs from "fs/promises";

export const overwriteJSON = async (filepath, newData) => {
  try {
    await fs.writeFile(filepath, JSON.stringify(newData, null, 2));
  } catch (error) {
    console.error("Error overwriting JSON file:", error);
    throw error;
  }
};
