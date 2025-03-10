import { getCollection } from "../utility/readDB.js";
import { parseDateTime } from "./checkingOverlap.js";
import { isWithinBusinessHours } from "../utility/MiddleWare.js";

const isTimeOverlap = (startTime1, endTime1, startTime2, endTime2) => {
  return startTime1 < endTime2 && startTime2 < endTime1;
};

export const rescheduleOverlap = async (
  date,
  time,
  serviceDuration,
  technician,
  bookingIdToIgnore
) => {
  try {
    const startTime = parseDateTime(date, time);
    const endTime = new Date(startTime.getTime() + serviceDuration * 60000);

    // Ensure booking is within operating hours (6:00 AM - 9:00 PM)
    if (!isWithinBusinessHours(startTime)) {
      return "Services are offered from 6:00 AM to 9:00 PM";
    }

    const bookingsCollection = await getCollection("bookings");
    const existingBookings = await bookingsCollection.find().toArray();

    // Exclude the booking being rescheduled
    const filteredBookings = existingBookings.filter(
      (booking) => booking.id !== bookingIdToIgnore
    );

    const hasOverlap = filteredBookings.some((booking) => {
      if (booking.date !== date || booking.technician !== technician) {
        return false;
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

    return hasOverlap;
  } catch (error) {
    throw new Error(error.message || "Failed to check booking overlaps");
  }
};
