import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// utils/validationUtils.js
import { sanitizeInput } from "../utility/sanitization.js";
import { validatePhoneNumber } from "../utility/sanitization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamFilePath = path.resolve(__dirname, process.env.TEAM_PATH);
const servicesFilePath = path.resolve(__dirname, process.env.SERVICES_PATH);

const teamData = JSON.parse(fs.readFileSync(teamFilePath, "utf-8"));
const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf-8"));
const validTechnicians = new Set(
  teamData.map((tech) => tech.name.toLowerCase())
);
const validServices = new Set(
  servicesData.map((service) => service.service.toLowerCase())
);

export const validateAndSanitizeRescheduleData = (fields) => {
  if (!fields.date || !fields.time || !fields.phone || !fields.technician) {
    throw new Error("Date, time, phone, and technician are required.");
  }

  const sanitizedFields = {
    phone: sanitizeInput(fields.phone),
    date: fields.date,
    time: fields.time,
    services: Array.isArray(fields.services)
      ? fields.services.map((service) => sanitizeInput(service))
      : [],
    technician: sanitizeInput(fields.technician),
    duration: parseInt(fields.duration, 10) || 0,
  };

  // Validate phone number
  if (!validatePhoneNumber(sanitizedFields.phone)) {
    throw new Error(
      "Invalid phone number. Use a Kenyan format like 07xxxxxxxx or +2547xxxxxxxx."
    );
  }

  // Validate services
  sanitizedFields.services.forEach((service) => {
    if (!validServices.has(service.toLowerCase())) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });

  // Validate technician
  if (!validTechnicians.has(sanitizedFields.technician.toLowerCase())) {
    throw new Error(
      `Invalid technician. Choose from: ${[...validTechnicians].join(", ")}`
    );
  }

  return sanitizedFields;
};

export const validateAndSanitizeBookingData = (fields) => {
  if (!fields.date || !fields.time || !fields.phone || !fields.technician) {
    throw new Error("Date, time, phone, and technician are required.");
  }

  const sanitizedFields = {
    name: fields.name,
    phone: sanitizeInput(fields.phone),
    date: fields.date,
    time: fields.time,
    services: Array.isArray(fields.services)
      ? fields.services.map((service) => sanitizeInput(service))
      : [],
    technician: sanitizeInput(fields.technician),
    duration: parseInt(fields.duration, 10) || 0,
    galleryImages: Array.isArray(fields.galleryImages)
      ? fields.galleryImages
      : [],
    samples: Array.isArray(fields.samples) ? fields.samples : [],
  };

  // Validate phone number
  if (!validatePhoneNumber(sanitizedFields.phone)) {
    throw new Error(
      "Invalid phone number. Use a Kenyan format like 07xxxxxxxx or +2547xxxxxxxx."
    );
  }

  // Validate services
  sanitizedFields.services.forEach((service) => {
    if (!validServices.has(service.toLowerCase())) {
      throw new Error(`Invalid service selected. Select from valid services.`);
    }
  });

  // Validate technician
  if (!validTechnicians.has(sanitizedFields.technician.toLowerCase())) {
    throw new Error(
      `Invalid technician. Choose from: ${[...validTechnicians].join(", ")}`
    );
  }

  return sanitizedFields;
};
