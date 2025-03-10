import { getCollection } from "../utility/readDB.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleImages = path.resolve(__dirname, process.env.SAMPLE_IMAGES_PATH);

export const handleCancelBooking = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const bookingId = url.searchParams.get("id");

  try {
    if (!bookingId) {
      throw new Error("Booking code is required for cancellation");
    }

    const bookingsCollection = await getCollection("bookings");
    const existingBooking = await bookingsCollection.findOne({ id: bookingId });

    if (!existingBooking) {
      throw new Error("No booking found with the provided code");
    }

    //delete associated image if any
    if (existingBooking.imagePaths && existingBooking.imagePaths.length > 0) {
      for (const imagePath of existingBooking.imagePaths) {
        const absolutePath = path.join(sampleImages, imagePath);

        try {
          await fs.unlink(absolutePath);
        } catch (error) {
          console.warn(`filed to delete image: ${absolutePath}`, error);
        }
      }
    }

    // Remove booking
    await bookingsCollection.deleteOne({ id: bookingId });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Booking canceled successfully" }));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};
