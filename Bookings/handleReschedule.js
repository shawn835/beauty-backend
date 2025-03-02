import path from "path";
import { fileURLToPath } from "url";
import { rescheduleOverlap } from "./rescheduleCheckBookingOverlap.js";
import { readBookings } from "./bookingsFormHandler.js";
import { overwriteJSON } from "./overWriteJson.js";
import { validateAndSanitizeRescheduleData } from "./bookingFormValidation.js";
import { parseRequestBody } from "../utility/MiddleWare.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bookingsJson = path.resolve(__dirname, process.env.BOOKINGS_DATA_PATH);

export const handleBookingReschedule = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const bookingId = url.searchParams.get("id");

  if (!bookingId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Booking ID is required" }));
  }

  try {
    const rescheduleData = await parseRequestBody(req);
    validateAndSanitizeRescheduleData(rescheduleData);

    const { date, time, services, phone, technician, duration } =
      rescheduleData;

    if (!date || !time || !services || !phone || !technician) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "All fields are required" }));
    }

    const bookings = await readBookings();
    const bookingIndex = bookings.findIndex((b) => b.id === bookingId);

    if (bookingIndex === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Booking not found" }));
    }

    const booking = bookings[bookingIndex];

    const {
      duration: oldDuration,
      date: oldDate,
      time: oldTime,
      rescheduleCount = 0,
    } = booking;

    const now = new Date();
    const originalStartTime = new Date(`${oldDate}T${oldTime}`);
    const newStartTime = new Date(`${date}T${time}`);

    // Rescheduling must be at least 4 hours before the appointment
    if (originalStartTime - now < 4 * 60 * 60 * 1000) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error:
            "Rescheduling must be done at least 4 hours before the appointment.",
        })
      );
    }

    // Rule 2: Reschedule time must be within business hours (6:00 AM - 8:30 PM)
    if (
      newStartTime.getHours() < 6 ||
      (newStartTime.getHours() === 20 && newStartTime.getMinutes() > 30) ||
      newStartTime.getHours() >= 21
    ) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error:
            "Rescheduling must be within business hours (6:00 AM - 8:30 PM).",
        })
      );
    }

    // Rule 3: Cannot reschedule more than twice within a week
    if (rescheduleCount >= 2) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "You cannot reschedule more than twice within a week.",
        })
      );
    }

    // Rule 4: Reschedule must be within 14 days
    const maxAllowedDate = new Date();
    maxAllowedDate.setDate(maxAllowedDate.getDate() + 14);
    if (newStartTime > maxAllowedDate) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Rescheduling is only allowed within the next 14 days.",
        })
      );
    }

    // Rule 5: Check for technician availability (excluding the current booking)
    const hasOverlap = await rescheduleOverlap(
      date,
      time,
      duration,
      technician,
      bookingId // Exclude the booking being rescheduled
    );
    if (hasOverlap) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: `Pick another time or technician, ${technician} is booked at this time`,
        })
      );
    }

    // Update booking details
    bookings[bookingIndex] = {
      ...booking,
      date,
      time,
      services: Array.isArray(services) ? services : [services],
      phone,
      technician,
      duration,
      rescheduleCount: rescheduleCount + 1,
    };

    // Save updates
    await overwriteJSON(bookingsJson, bookings);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Booking rescheduled successfully" }));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};
