import { getCollection } from "../utility/readDB.js";
import { rescheduleOverlap } from "./rescheduleCheckBookingOverlap.js";
import { validateAndSanitizeRescheduleData } from "./bookingFormValidation.js";
import { parseRequestBody } from "../utility/MiddleWare.js";
import { isBookingExpired } from "../utility/checkBookingExpiry.js";

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

    const bookingsCollection = await getCollection("bookings");

    const booking = await bookingsCollection.findOne({ id: String(bookingId) });

    if (!booking) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Booking not found" }));
    }

    if (isBookingExpired(booking)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "cannot reschedule past bookings" })
      );
    }

    const {
      duration: oldDuration,
      date: oldDate,
      time: oldTime,
      rescheduleCount = 0,
    } = booking;

    const now = new Date();
    const originalStartTime = new Date(`${oldDate}T${oldTime}`);
    const newStartTime = new Date(`${date}T${time}`);

    //Rescheduling must be at least 4 hours before
    if (originalStartTime - now < 4 * 60 * 60 * 1000) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error:
            "Rescheduling must be done at least 4 hours before the appointment.",
        })
      );
    }

    //Cannot reschedule more than twice
    if (rescheduleCount >= 2) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "You cannot reschedule more than twice within a week.",
        })
      );
    }

    // Reschedule must be within 14 days
    const maxAllowedDate = new Date(oldDate);
    maxAllowedDate.setDate(maxAllowedDate.getDate() + 14);
    if (newStartTime > maxAllowedDate) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Rescheduling is only allowed within the next 14 days.",
        })
      );
    }

    //Check for technician availability (excluding current booking)
    const hasOverlap = await rescheduleOverlap(
      date,
      time,
      duration,
      technician,
      bookingId
    );

    if (hasOverlap) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: `Pick another time or technician, ${technician} is booked at this time`,
        })
      );
    }

    // Update booking details using `$set`
    await bookingsCollection.updateOne(
      { id: bookingId },
      {
        $set: {
          date,
          time,
          services: Array.isArray(services) ? services : [services],
          phone,
          technician,
          duration,
          rescheduleCount: rescheduleCount + 1,
        },
      }
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Booking rescheduled successfully" }));
  } catch (error) {
    console.error("Error in rescheduling:", error.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
