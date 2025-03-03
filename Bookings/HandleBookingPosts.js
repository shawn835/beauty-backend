import { writeBookings } from "./bookingsFormHandler.js";
import { generateBookingId } from "../generateId.js";
import { checkBookingOverlap } from "./checkingOverlap.js";
import { validateAndSanitizeBookingData } from "./bookingFormValidation.js";

export const handleBookingsPosts = async (req, res) => {
  try {
    const body = await getRequestBody(req);
    const fields = JSON.parse(body);

    // Validate and sanitize input
    const sanitizedData = validateAndSanitizeBookingData(fields);

    // Extract gallery and sample images (already URLs)
    const finalImagePaths = [
      ...(fields.galleryImages || []),
      ...(fields.samples || []),
    ];

    // Ensure services are an array
    const servicesArray = Array.isArray(fields.services) ? fields.services : [];

    // Check for booking overlap
    const hasOverlap = await checkBookingOverlap(
      sanitizedData.date,
      sanitizedData.time,
      sanitizedData.duration,
      sanitizedData.technician
    );

    if (hasOverlap) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error:
            hasOverlap === true
              ? `Pick another time or technician, ${sanitizedData.technician} is booked at this time`
              : hasOverlap, // the time restriction message
        })
      );
    }
    // Create new booking object
    const newBooking = {
      id: generateBookingId(),
      name: sanitizedData.name,
      phone: sanitizedData.phone,
      date: sanitizedData.date,
      time: sanitizedData.time,
      services: servicesArray,
      technician: sanitizedData.technician,
      duration: sanitizedData.duration,
      imagePaths: finalImagePaths, // ✅ Only URLs now
    };

    // Store the booking
    await writeBookings(newBooking);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: "Booking received!", booking: newBooking })
    );
  } catch (error) {
    console.error("Error handling booking:", error.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};

// Helper function to get request body
const getRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
