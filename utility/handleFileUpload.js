import fs from "fs/promises";
import path from "path";

// Allowed file types (images only)
const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

export const handleFileUploads = async (files, uploadDir, clientName) => {
  if (!files || files.length === 0) {
    throw new Error("No files uploaded.");
  }

  const uploadedFileNames = [];

  for (const file of files) {
    try {
      // Validate BEFORE moving the file
      if (!allowedMimeTypes.includes(file.mimetype)) {
        await fs.unlink(file.filepath); // Delete invalid file
        throw new Error(`Invalid file type: ${file.mimetype}`);
      }

      if (file.size > maxFileSize) {
        await fs.unlink(file.filepath); // Delete large file
        throw new Error(`File too large: ${file.originalFilename}`);
      }

      // Generate a unique filename with client name
      const uniqueFileName = `${clientName.replace(
        /\s+/g,
        "_"
      )}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}${path.extname(file.originalFilename)}`;

      const newFilePath = path.join(uploadDir, uniqueFileName);

      // Move file to final directory only if it passed validation
      await fs.rename(file.filepath, newFilePath);

      // ✅ Store only the relative path, excluding system directory
      uploadedFileNames.push(uniqueFileName);
    } catch (error) {
      console.error("Error processing file:", file.originalFilename, error);
    }
  }

  return uploadedFileNames; // ✅ Returns filenames with client name + unique ID
};
