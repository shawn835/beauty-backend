import fs from "fs/promises";
import path from "path";
import { readBookings } from "./bookingsFormHandler.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bookingsFilePath = path.resolve(
  __dirname,
  process.env.BOOKINGS_DATA_PATH
);

export const handleCancelBooking = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const bookingId = url.searchParams.get("id");

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      if (!bookingId) {
        throw new Error("Booking code is required for cancellation");
      }

      const bookingsData = await readBookings();
      const existingIndex = bookingsData.findIndex(
        (booking) => booking.id === bookingId
      );

      if (existingIndex === -1) {
        throw new Error("No booking found with the provided code");
      }

      // Remove booking
      bookingsData.splice(existingIndex, 1);

      // Write the updated data back to file
      await fs.writeFile(
        bookingsFilePath,
        JSON.stringify(bookingsData, null, 2)
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Booking canceled successfully" }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
};
