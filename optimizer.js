import sharp from "sharp";
import { glob } from "glob";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// Input and output directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Input and output directories
const inputDir = path.join(__dirname, "../beautyFrontend/public/gallery");
const outputDir = path.join(__dirname, "../beautyFrontend/public/optimized");

// Function to format file size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

(async () => {
  try {
    // Create output directory if it doesn't exist
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
    }

    // Find images that are NOT already WebP
    const files = (await glob(`${inputDir}/**/*`)).filter(
      (file) => !file.endsWith(".webp")
    );
    if (files.length === 0) {
      console.log("No images found for optimization.");
      return;
    }

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    // Process images
    for (const file of files) {
      const outputFilePath = path.join(
        outputDir,
        path.basename(file, path.extname(file)) + ".webp"
      );

      try {
        // Get file size before optimization
        const { size: originalSize } = await fs.stat(file);
        totalOriginalSize += originalSize;

        // Skip files under 500KB
        if (originalSize < 500 * 1024) {
          console.log(`${path.basename(file)} skipped (under 500KB)`);
          continue;
        }

        // Convert to WebP
        await sharp(file)
          .sharpen()
          .webp({ quality: 95 }) // Adjust quality as needed
          .toFile(outputFilePath);

        // Get file size after optimization
        const { size: optimizedSize } = await fs.stat(outputFilePath);
        totalOptimizedSize += optimizedSize;

        console.log(
          `${path.basename(file)} optimized: ${formatBytes(
            originalSize
          )} -> ${formatBytes(optimizedSize)}`
        );
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    // Final stats
    const savings = totalOriginalSize - totalOptimizedSize;
    console.log("\nOptimization complete!");
    console.log(`Original total size: ${formatBytes(totalOriginalSize)}`);
    console.log(`Optimized total size: ${formatBytes(totalOptimizedSize)}`);
    console.log(
      `Total savings: ${formatBytes(savings)} (${(
        (savings / totalOriginalSize) *
        100
      ).toFixed(2)}%)`
    );
  } catch (error) {
    console.error("Error during optimization:", error);
  }
})();
