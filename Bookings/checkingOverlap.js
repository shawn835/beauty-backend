import { getCollection } from "../utility/readDB.js";
import { isWithinBusinessHours } from "../utility/MiddleWare.js";

export const parseDateTime = (date, time) => {
  // Ensure date is in YYYY-MM-DD format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    date = `${year}-${month}-${day}`;
  }

  // Validate date and time format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `Invalid date format: ${date}. Expected format: YYYY-MM-DD`
    );
  }

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Invalid time format: ${time}. Expected format: HH:MM`);
  }

  const normalizedDate = new Date(date);
  if (isNaN(normalizedDate)) {
    throw new Error(`Invalid date value: ${date}`);
  }

  return new Date(`${date}T${time}`);
};

const isTimeOverlap = (startTime1, endTime1, startTime2, endTime2) => {
  return startTime1 < endTime2 && startTime2 < endTime1;
};

export const checkBookingOverlap = async (
  date,
  time,
  serviceDuration,
  technician
) => {
  try {
    // Parse the proposed booking's start and end time
    const startTime = parseDateTime(date, time);
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

    if (!isWithinBusinessHours(startTime)) {
      return "Services are offered from 6:00 AM to 9:00 PM";
    }

    // ✅ Fetch only relevant bookings (same date and technician)
    const bookingsCollection = await getCollection("bookings");
    const existingBookings = await bookingsCollection
      .find({ date, technician })
      .toArray();

    //Exclude the booking being rescheduled
    const filteredBookings = existingBookings.filter(
      (booking) => booking.id !== bookingIdToIgnore
    );

    // Check for overlaps
    const hasOverlap = existingBookings.some((booking) => {
      const existingStartTime = parseDateTime(booking.date, booking.time);
      const existingEndTime = new Date(
        existingStartTime.getTime() + booking.duration * 60000
      );

      return isTimeOverlap(
        startTime,
        endTime,
        existingStartTime,
        existingEndTime
      );
    });

    return hasOverlap || false; // Return true if overlap, false if available
  } catch (error) {
    console.error("Error in checkBookingOverlap:", error.message);
    throw new Error("Failed to check booking overlaps");
  }
};
