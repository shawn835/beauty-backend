import http from "http";
const PORT = process.env.PORT;
import { handleCORS } from "./utility/MiddleWare.js";
import { handlePreflight } from "./utility/MiddleWare.js";
import { handleRouteNotFound } from "./utility/HandleRouteNotFound.js";
import { handleMethodNotAllowed } from "./utility/HandleMethodNotAllowed.js";
import { handleBookingsPosts } from "./Bookings/HandleBookingPosts.js";
import { handleContactUsPost } from "./ContactForm/HandleContactUSPost.js";
import { retrieveBookingDetails } from "./Bookings/GetBookingDetails.js";
import { downloadBookings } from "./Bookings/downloadBooking.js";
import { handleBookingReschedule } from "./Bookings/handleReschedule.js";
import { handleCancelBooking } from "./Bookings/handleCancelBooking.js";
import { adminAuth } from "./Bookings/renderBookingDetails.js";
import { renderBookings } from "./Bookings/renderBookingDetails.js";
import { convertFiles } from "./Bookings/fileUpload.js";
import { sendTelegramMessage } from "./Bookings/Telegram.js";

// Main server logic
const server = http.createServer(async (req, res) => {
  handleCORS(req, res);

  if (handlePreflight(req, res)) {
    return; // Stop further processing if it's a preflight request
  }

  if (req.method === "POST") {
    // await sendTelegramMessage("New booking received!");
    if (req.url === "/online-bookings") {
      await handleBookingsPosts(req, res);
    } else if (req.url === "/contact-us") {
      await handleContactUsPost(req, res);
    } else if (req.url === "/admin/login") {
      await adminAuth(req, res);
    } else if (req.url === "/upload") {
      await convertFiles(req, res);
    } else {
      handleRouteNotFound(req, res);
    }
  } else if (req.method === "GET") {
    if (req.url.startsWith("/booking-details")) {
      await retrieveBookingDetails(req, res);
    } else if (req.url.startsWith("/download-booking")) {
      await downloadBookings(req, res);
    } else if (req.url === "/admin/bookings") {
      renderBookings(req, res);
    } else {
      handleRouteNotFound(req, res);
    }
  } else if (req.method === "PUT") {
    if (req.url.startsWith("/reschedule-booking")) {
      await handleBookingReschedule(req, res);
    }
  } else if (req.method === "DELETE") {
    if (req.url.startsWith("/cancel-booking")) {
      await handleCancelBooking(req, res);
    }
  } else {
    handleMethodNotAllowed(req, res);
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
