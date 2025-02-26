import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { writeJSON } from "../utility/writeJsonData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const bookingsFile = path.join(__dirname, "BookingsData.json");

// Resolve the path to bookingdata.json
const bookingsFile = path.join(__dirname, process.env.BOOKINGS_DATA_PATH);
// Read bookings data
export const readBookings = async () => {
  try {
    const data = await fs.readFile(bookingsFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return []; // If the file doesn't exist or is empty, start with an empty array
  }
};

// Write bookings data (using the reusable writeJSON function)
export const writeBookings = async (newBooking) => {
  await writeJSON(bookingsFile, newBooking);
};
