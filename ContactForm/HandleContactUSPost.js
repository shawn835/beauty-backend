import { getCollection } from "../utility/readDB.js";
import { validateAndSanitizeFormData } from "./ContactFormValidation.js";
import { parseRequestBody } from "../utility/MiddleWare.js";

export const handleContactUsPost = async (req, res) => {
  try {
    const contactCollection = await getCollection("contacts");
    const formData = await parseRequestBody(req);
    validateAndSanitizeFormData(formData);

    const newEntry = { ...formData, date: new Date().toISOString() };

    await contactCollection.insertOne(newEntry);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: "Form submitted successfully" }));
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};
