import { sanitizeInput, isValidEmail } from "../utility/sanitization.js";

export const validateAndSanitizeFormData = (data) => {
  data.name = sanitizeInput(data.name);
  data.message = sanitizeInput(data.message);
  data.email = data.email.trim();

  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }
};
