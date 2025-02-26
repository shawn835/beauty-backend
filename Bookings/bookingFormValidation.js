import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// utils/validationUtils.js
import { sanitizeInput, isValidEmail } from "../utility/sanitization.js";
import { validatePhoneNumber } from "../utility/sanitization.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const teamFilePath = path.resolve(__dirname, process.env.TEAM_PATH);
const servicesFilePath = path.resolve(__dirname, process.env.SERVICES_PATH);

const teamData = JSON.parse(fs.readFileSync(teamFilePath, "utf-8"));
const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, "utf-8"));
const validTechnicians = teamData.map((tech) => tech.name.toLowerCase());
const validServices = servicesData.map((service) =>
  service.service.toLowerCase()
);

export const validateAndSanitizeBookingData = (fields) => {
  if (
    !fields.name ||
    !fields.date ||
    !fields.time ||
    !fields.technician ||
    !fields.phone ||
    !fields.email
  ) {
    throw new Error(
      "Name, date, time, phone, email and technician are required."
    );
  }

  const sanitizedFields = {
    name: sanitizeInput(fields.name[0]),
    phone: sanitizeInput(fields.phone[0]),
    email: fields.email[0].trim(),
    date: fields.date[0],
    time: fields.time[0],
    services: sanitizeInput(
      Array.isArray(fields.services) ? JSON.parse(fields.services[0]) : []
    ),
    technician: sanitizeInput(fields.technician[0]),
    duration: parseInt(fields.duration[0], 10) || 0,
  };

  // Validate email
  if (!isValidEmail(sanitizedFields.email)) {
    throw new Error("Invalid email format");
  }

  //validate technician
  if (!validTechnicians.includes(sanitizedFields.technician.toLowerCase())) {
    throw new Error(
      `Invalid technician. Choose from: ${validTechnicians.join(", ")}`
    );
  }

  if (!validatePhoneNumber(sanitizedFields.phone)) {
    throw new Error(
      "Invalid phone number. Use a Kenyan format like 07xxxxxxxx or +2547xxxxxxxx."
    );
  }

  sanitizedFields.services.forEach((service) => {
    if (!validServices.includes(service.toLowerCase())) {
      throw new Error(`invalid service selected. Select from valid services`);
    }
  });

  return sanitizedFields;
};
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

  // Validate services if provided
  if (sanitizedFields.services.length) {
    sanitizedFields.services.forEach((service) => {
      if (!validServices.includes(service.toLowerCase())) {
        throw new Error(
          `Invalid service selected. Select from valid services.`
        );
      }
    });
  }

  //validate technician
  if (!validTechnicians.includes(sanitizedFields.technician.toLowerCase())) {
    throw new Error(
      `Invalid technician. Choose from: ${validTechnicians.join(", ")}` ||
        "invalid technicians"
    );
  }

  return sanitizedFields;
};
