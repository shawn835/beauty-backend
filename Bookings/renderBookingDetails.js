import { getCollection } from "../utility/readDB.js";
import "dotenv/config";
import { sanitizeInput } from "../utility/sanitization.js";
import { parseRequestBody } from "../utility/MiddleWare.js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export const adminAuth = async (req, res) => {
  try {
    const passToken = await parseRequestBody(req);
    sanitizeInput(passToken);
    const { password } = passToken;
    if (password === ADMIN_PASSWORD) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Incorrect password" }));
    }
  } catch (error) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: "Invalid request body" }));
  }
};

export const renderBookings = async (req, res) => {
  try {
    const bookingsCollection = await getCollection("bookings");
    const bookings = await bookingsCollection.find().toArray();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(bookings));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ success: false, error: "Failed to fetch bookings" })
    );
  }
};
