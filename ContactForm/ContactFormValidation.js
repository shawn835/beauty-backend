import { sanitizeInput, validatePhoneNumber } from "../utility/sanitization.js";

export const validateAndSanitizeFormData = (data) => {
  data.name = sanitizeInput(data.name);
  data.message = sanitizeInput(data.message);
  data.phone = sanitizeInput(data.phone);

  if (!validatePhoneNumber(sanitizeInput(data.phone))) {
    throw new Error(
      "Invalid phone number. Use a Kenyan format like 07xxxxxxxx or +2547xxxxxxxx."
    );
  }
};
