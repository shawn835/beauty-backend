import fs from "fs/promises";
export const readJson = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};
