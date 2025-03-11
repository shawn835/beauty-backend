import { getCollection } from "../utility/readDB.js";
export const retrieveBookingDetails = async (req, res) => {
  if (req.method !== "GET") return;
  const urlParams = new URL(req.url, `http://${req.headers.host}`);
  const bookingId = urlParams.searchParams.get("id");

  if (!bookingId) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Booking ID is required" }));
    return;
  }

  try {
    const bookingsCollection = await getCollection("bookings");

    const booking = await bookingsCollection.findOne({ id: bookingId });

    if (booking) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(booking));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Booking not found, check your code again" })
      );
    }
  } catch (error) {
    console.error("Error reading bookings file:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
};
