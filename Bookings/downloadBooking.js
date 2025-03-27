import { generateBookingPDF } from "./puppeteer.js";
import url from "url";

export const downloadBookings = async (req, res) => {
  const query = url.parse(req.url, true).query;

  if (!query.id || !query.name) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Missing booking details" }));
    return;
  }

  const bookingDetails = {
    id: query.id,
    services: query.services ? query.services.split(",") : [],
    technician: query.technician || "N/A",
    date: query.date || "N/A",
    time: query.time || "N/A",
    name: query.name,
    duration: query.duration || "N/A",
  };

  try {
    const pdfBuffer = await generateBookingPDF(bookingDetails);
    const safeName = query.name.replace(/[^a-zA-Z0-9_-]/g, ""); // Remove special characters

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="booking_${safeName}.pdf"`,
    });

    res.end(pdfBuffer);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Failed to generate PDF" }));
  }
};
