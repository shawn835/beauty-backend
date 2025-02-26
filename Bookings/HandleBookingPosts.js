// controllers/bookingsController.js
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { handleFileUploads } from "../utility/handleFileUpload.js";
import { validateAndSanitizeBookingData } from "./bookingFormValidation.js";
import { writeBookings } from "./bookingsFormHandler.js";
import { checkBookingOverlap } from "./checkingOverlap.js";
import { generateBookingId } from "../generateId.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, process.env.SAMPLE_IMAGES_PATH);
const tempUploadDir = path.resolve(__dirname, process.env.TEMP_DIR);

//
// Ensure directories exist
const ensureDirExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};
export const handleBookingsPosts = async (req, res) => {
  await ensureDirExists(uploadDir);
  await ensureDirExists(tempUploadDir);

  const form = formidable({
    multiples: true,
    uploadDir: tempUploadDir, // Store in temp directory first
    keepExtensions: true,
  });

  form.parse(req, async (error, fields, files) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Error parsing the form data" }));
    }

    try {
      // Validate form fields
      const sanitizedFields = validateAndSanitizeBookingData(fields);

      //gallery images>string to array
      const galleryImages = fields.galleryImages
        ? JSON.parse(fields.galleryImages)
        : [];

      //uploaded images
      const uploadedImages = files.samples
        ? Array.isArray(files.samples)
          ? files.samples
          : [files.samples]
        : [];

      // check for booking overlaps
      const hasOverlap = await checkBookingOverlap(
        sanitizedFields.date,
        sanitizedFields.time,
        sanitizedFields.duration,
        sanitizedFields.technician
      );

      if (hasOverlap) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: `Pick another time or technician, ${sanitizedFields.technician} is booked at this time`,
          })
        );
      }

      // ✅ Step 3: Move validated images to final upload directory
      const imagePaths = uploadedImages.length
        ? await handleFileUploads(
            uploadedImages,
            uploadDir,
            sanitizedFields.name
          )
        : [];

      console.log(`gallery images${galleryImages}`);
      console.log(`uploaded images:${uploadedImages}`);
      //merge uploaded and gallery images
      const finalImagePaths = [...galleryImages, ...imagePaths];
      console.log(`final image paths${finalImagePaths}`);

      // ✅ Step 4: Create new booking entry
      const newBooking = {
        id: generateBookingId(),
        ...sanitizedFields,
        imagePaths: finalImagePaths,
      };

      await writeBookings(newBooking);

      // Send success response
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: "Booking received successfully!",
          booking: newBooking,
        })
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
};
