import { getCollection } from "../utility/readDB.js";
import { generateBookingId } from "../generateId.js";
import { checkBookingOverlap } from "./checkingOverlap.js";
import { validateAndSanitizeBookingData } from "./bookingFormValidation.js";

const RATE_LIMIT_TIME = 60000;
const MAX_BOOKINGS_PER_MINUTE = 2;

export const handleBookingsPosts = async (req, res) => {
  try {
    const bookingsCollection = await getCollection("bookings");
    const rateLimitsCollection = await getCollection("rate_limits");

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const now = Date.now();

    // Fetch rate limit data from MongoDB
    const rateLimitEntry = await rateLimitsCollection.findOne({ ip });

    // Initialize/ filter timestamps
    let timestamps = (rateLimitEntry?.timestamps || []).filter(
      (timestamp) => now - timestamp < RATE_LIMIT_TIME
    );

    if (timestamps.length >= MAX_BOOKINGS_PER_MINUTE) {
      res.writeHead(429, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Too many requests, slow down!" })
      );
    }

    // Extract request data
    const body = await getRequestBody(req);
    const fields = JSON.parse(body);
    const sanitizedData = validateAndSanitizeBookingData(fields);

    const finalImagePaths = [
      ...(fields.galleryImages || []),
      ...(fields.samples || []),
    ];
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
              : hasOverlap,
        })
      );
    }

    // Create and store booking
    const newBooking = {
      id: generateBookingId(),
      name: sanitizedData.name,
      phone: sanitizedData.phone,
      date: sanitizedData.date,
      time: sanitizedData.time,
      services: servicesArray,
      technician: sanitizedData.technician,
      duration: sanitizedData.duration,
      imagePaths: finalImagePaths,
    };

    await bookingsCollection.insertOne(newBooking);

    // Add new timestamp and update rate limit in MongoDB
    timestamps.push(now);
    await rateLimitsCollection.updateOne(
      { ip },
      { $set: { timestamps } },
      { upsert: true }
    );

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

//function to get request body
const getRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
