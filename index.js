import http from "http";
const PORT = process.env.PORT;
import path from "path";
import { fileURLToPath } from "url";
import { handleCORS } from "./utility/MiddleWare.js";
import { handlePreflight } from "./utility/MiddleWare.js";
import { uptimeReboot } from "./utility/MiddleWare.js";
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
import { serveStaticFiles } from "./staticFiles.js";
import { sendTelegramMessage } from "./Bookings/Telegram.js";
import { fetchBlogs } from "./Blogs/BlogFetch.js";
import { getBlogBySlug } from "./Blogs/GetBlogBySlug.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(
  __dirname,
  "Bookings",
  process.env.SAMPLE_IMAGES_PATH
);
const postsImagesDir = path.resolve(
  __dirname,
  "Blogs",
  process.env.POSTS_IMAGES_PATH
);
const displayImagesDir = path.resolve(
  __dirname,
  "Blogs",
  process.env.DISPLAY_IMAGES_PATH
);

const cardImagePath = path.resolve(__dirname, "public/images");

// Main server logic
const server = http.createServer(async (req, res) => {
  handleCORS(req, res);

  if (handlePreflight(req, res)) {
    return; // Stop further processing if it's a preflight request
  }

  if (req.method === "POST") {
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
    } else if (req.url.startsWith("/ping")) {
      uptimeReboot(req, res);
    } else if (req.url.startsWith("/download-booking")) {
      await downloadBookings(req, res);
    } else if (req.url === "/admin/bookings") {
      renderBookings(req, res);
    } else if (req.url.startsWith("/BookingSamplesImages")) {
      await serveStaticFiles(req, res, uploadDir);
    } else if (req.url.startsWith("/postsImages")) {
      await serveStaticFiles(req, res, postsImagesDir);
    } else if (req.url.startsWith("/displayImage")) {
      await serveStaticFiles(req, res, displayImagesDir);
    } else if (req.url.startsWith("/images")) {
      await serveStaticFiles(req, res, cardImagePath);
    } else if (req.url === "/blogs") {
      await fetchBlogs(req, res);
    } else if (req.url.startsWith("/blogPost")) {
      await getBlogBySlug(req, res);
    } else {
      handleRouteNotFound(req, res);
    }
  } else if (req.method === "PUT") {
    if (req.url.startsWith("/reschedule-booking")) {
      await handleBookingReschedule(req, res);
    } else {
      handleMethodNotAllowed(req, res);
    }
  } else if (req.method === "DELETE") {
    if (req.url.startsWith("/cancel-booking")) {
      await handleCancelBooking(req, res);
    } else {
      handleMethodNotAllowed(req, res);
    }
  } else {
    handleMethodNotAllowed(req, res);
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
