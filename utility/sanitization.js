// Sanitization Function
export const sanitizeInput = (input) => {
  if (Array.isArray(input)) {
    // Sanitize each element without converting quotes
    return input.map((item) => sanitizeInput(item));
  }

  if (typeof input !== "string") return ""; // Ensure it's a string
  return input
    .trim() // Remove spaces
    .replace(/</g, "&lt;") // Prevent HTML tags
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&#39;"); // Prevent injection attacks but keep double quotes
};

export const validatePhoneNumber = (phone) => {
  //remove spaces
  const cleanedPhone = phone.replace(/\s+/g, "");

  //format and length
  const regex = /^(?:\+254|0)(1\d{8}|7\d{8})$/;
  if (!regex.test(cleanedPhone)) return false;

  //length
  if (
    (cleanedPhone.startsWith("+254") && cleanedPhone.length !== 13) ||
    (!cleanedPhone.startsWith("+254") && cleanedPhone.length !== 10)
  ) {
    return false;
  }

  return true;
};
