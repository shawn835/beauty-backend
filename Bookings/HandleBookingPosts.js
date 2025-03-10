import { getCollection } from "../utility/readDB.js";
import { generateBookingId } from "../generateId.js";
import { checkBookingOverlap } from "./checkingOverlap.js";
import { validateAndSanitizeBookingData } from "./bookingFormValidation.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rateLimitFile = path.resolve(__dirname, process.env.RATE_LIMIT_PATH);

const RATE_LIMIT_TIME = 60000;
const MAX_BOOKINGS_PER_MINUTE = 2; //2 successful booking
let submissionRecords = {};

// Load rate limits from file when server starts
if (fs.existsSync(rateLimitFile)) {
  const rawData = fs.readFileSync(rateLimitFile);
  submissionRecords = JSON.parse(rawData);
}

// Function to save rate limits to file
const saveRateLimitData = () => {
  fs.writeFileSync(rateLimitFile, JSON.stringify(submissionRecords, null, 2));
};

export const handleBookingsPosts = async (req, res) => {
  try {
    const bookingsCollection = await getCollection("bookings");

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const now = Date.now();

    //initialize current ip track
    if (!submissionRecords[ip]) {
      submissionRecords[ip] = [];
    }

    //remove older timestamps
    submissionRecords[ip] = submissionRecords[ip].filter(
      (timestamp) => now - timestamp < RATE_LIMIT_TIME
    );

    if (submissionRecords[ip].length >= MAX_BOOKINGS_PER_MINUTE) {
      res.writeHead(429, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Too many requests, slow down!" })
      );
    }

    if (submissionRecords[ip].length === 0) {
      delete submissionRecords[ip];
    }

    if (!submissionRecords[ip]) {
      submissionRecords[ip] = [];
    }
    // Extract request data
    const body = await getRequestBody(req);
    const fields = JSON.parse(body);

    // Validate and sanitize input
    const sanitizedData = validateAndSanitizeBookingData(fields);

    // Extract gallery and sample images (if present)
    const finalImagePaths = [
      ...(fields.galleryImages || []),
      ...(fields.samples || []),
    ];

    // Ensure services is always an array
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
      imagePaths: finalImagePaths,
    };

    await bookingsCollection.insertOne(newBooking);

    //Only add to rate limit if booking was successful
    submissionRecords[ip].push(now);
    saveRateLimitData();

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
