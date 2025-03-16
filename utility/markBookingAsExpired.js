import { getCollection } from "./readDB.js";
import cron from "node-cron";

const markExpiredBookings = async () => {
  const bookingsCollection = await getCollection("bookings");
  const now = new Date().toISOString().split("T")[0];

  await bookingsCollection.updateMany(
    { date: { $lt: now }, status: "active" },
    { $set: { status: "expired" } }
  );
};

cron.schedule("0 0 * * *", async () => {
  console.log("running markingExpiredBookings");

  await markExpiredBookings();
});
