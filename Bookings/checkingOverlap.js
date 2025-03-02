import { readBookings } from "./bookingsFormHandler.js";

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

    // Ensure booking is within operating hours (6:00 AM - 8:30 PM)
    if (
      startTime.getHours() < 6 ||
      startTime.getHours() > 20 ||
      (startTime.getHours() === 20 && startTime.getMinutes() > 30) ||
      endTime.getHours() >= 21
    ) {
      return "Services are offered from 6:00 AM to 8:30 PM"; // ✅ Return a message instead of throwing an error
    }

    // Read existing bookings
    const existingBookings = await readBookings();

    // Check for overlaps
    const hasOverlap = existingBookings.some((booking) => {
      if (booking.date !== date || booking.technician !== technician) {
        return false; // Only check bookings for the same day and same technician
      }

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

    return hasOverlap || false; // ✅ Return true if overlap, false if available
  } catch (error) {
    console.error("Error in checkBookingOverlap:", error.message);
    throw new Error("Failed to check booking overlaps");
  }
};
