import { sanitizeInput } from "../utility/sanitization.js";

export const normalizeFormidableFields = (fields) => {
  const normalized = {};

  for (const [key, value] of Object.entries(fields)) {
    // Ensure value is always treated as an array
    const fieldValue = Array.isArray(value) ? value : [value];

    if (fieldValue.length === 0) {
      normalized[key] = ""; // Empty array becomes empty string
    } else if (fieldValue.length === 1) {
      let singleValue = fieldValue[0];

      // Unwrap deeply nested arrays (e.g., [[]] → [])
      while (Array.isArray(singleValue) && singleValue.length === 1) {
        singleValue = singleValue[0];
      }

      // Check if it's a valid JSON object or array
      if (
        typeof singleValue === "string" &&
        (singleValue.startsWith("{") || singleValue.startsWith("["))
      ) {
        try {
          normalized[key] = JSON.parse(singleValue);
          continue; // Move to the next field
        } catch (e) {
          // If JSON parsing fails, treat as a string
        }
      }

      // Convert "true" and "false" strings to boolean
      if (singleValue === "true") {
        normalized[key] = true;
      } else if (singleValue === "false") {
        normalized[key] = false;
      }
      // Convert numeric strings to actual numbers
      else if (!isNaN(singleValue) && singleValue.trim() !== "") {
        normalized[key] = Number(singleValue);
      }
      // Otherwise, keep as a normal string
      else {
        normalized[key] = singleValue;
      }
    } else {
      // Multi-value field, keep as array
      normalized[key] = fieldValue.map((item) => {
        if (
          typeof item === "string" &&
          (item.startsWith("{") || item.startsWith("["))
        ) {
          try {
            return JSON.parse(item);
          } catch (e) {
            return item;
          }
        }
        return item;
      });
    }
  }

  return normalized;
};

export const validateAndSanitizeBlogData = (fields) => {
  if (
    !fields.title ||
    !fields.slug ||
    !fields.author ||
    !fields.category ||
    !fields.content ||
    !fields.excerpt ||
    !fields.subCategory
  ) {
    throw new Error("all fields are required");
  }

  const sanitizedFields = {
    title: sanitizeInput(fields.title),
    author: sanitizeInput(fields.author),
    category: sanitizeInput(fields.category),
    slug: sanitizeInput(fields.slug),
    subCategory: sanitizeInput(fields.subCategory),
    excerpt: sanitizeInput(fields.excerpt),
    content: sanitizeInput(fields.content),
    tags: Array.isArray(fields.tags)
      ? fields.tags.map((tag) => sanitizeInput(tag))
      : [],
    meta: {
      title: sanitizeInput(fields.meta.title),
      description: sanitizeInput(fields.meta.description),
      keywords: Array.isArray(fields.meta.keywords)
        ? fields.meta.keywords.map((kw) => sanitizeInput(kw))
        : [],
    },
  };

  return sanitizedFields;
};
