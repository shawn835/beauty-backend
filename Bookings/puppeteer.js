import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, "prerendered");
import { readJson } from "../utility/readJson.js";

const BACKEND_URL = process.env.BACKEND_URL;
const imageUrl = `${BACKEND_URL}/images/card-image-bg.jpg`;
const BASE_URL = "http://localhost:3000";
const BLOG_LIST_PAGE = "/blogposts";

const launchBrowser = async () => {
  return await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
};

export const generateBookingPDF = async (bookingDetails) => {
  const browser = await launchBrowser();

  const page = await browser.newPage();

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours} hrs ${mins} min`;
    if (hours > 0) return `${hours} hrs`;
    return `${mins} min`;
  };

  // HTML content
  const htmlContent = `
  <html>
  <head>
  <style>
 .card-info {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 650px;
  margin: auto;
  z-index: 1000;
}

.image {
  position: relative;
  width: 100%;
height:180px
}

img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.booking-details {
  padding: 20px;
}
.booking-details h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}
.booking-details p {
  margin: 8px 0;
  color: #666;
}

.confirm-text-id {
  text-align: center;
}
.confirm-text-id h2 {
  color: rgb(18, 202, 18);
}
.booking-info {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  gap: 20px;
}
.booking-info div {
  margin-bottom: 8px;
}
.confirmation-code {
  font-weight: bold;
  color: #007bff;
}

.footer {
  padding: 10px 20px;
  font-size: 14px;
  color: #888;
  border-top: 1px solid #eee;
  font-style: oblique;
  text-align: center;
}
  </style>
  </head>

  <body>
      <div class="card-info">
        <div class="image">
       <img src="${imageUrl}" alt="Salon Image" />
        </div>
        <div class="booking-details">
          <div class="confirm-text-id">
            <h2>Your Appointment is Confirmed!</h2>
            <p>
              Confirmation Code:
              <span class="confirmation-code">${
                bookingDetails?.id || "N/A"
              }</span>
            </p>
          </div>
          <div class="booking-info">
            <div class="booking-info-card-1">
              <div>
                <strong>Services:</strong>
                ${
                  Array.isArray(bookingDetails?.services)
                    ? bookingDetails.services.join(", ")
                    : "N/A"
                }
              </div>
              <div>
                <strong>Technician:</strong>
                ${bookingDetails?.technician || "N/A"}
              </div>
              <div>
                <strong>Date:</strong> ${bookingDetails?.date || "N/A"}
              </div>
            </div>
            <div class="booking-info-card-2">
              <div>
                <strong>Name:</strong> ${bookingDetails?.name || "N/A"}
              </div>
              <div>
                <strong>Time:</strong> ${bookingDetails?.time || "N/A"}
              </div>
              <div>
                <strong>Location:</strong> Symos Nail Tech, 123 CBD, Nakuru
              </div>
              <div>
                <strong>Duration:</strong>
                ${formatDuration(bookingDetails?.duration || 0)}
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>
            Please arrive 5 minutes early. Thank you for choosing Symos Nail
            Tech.
          </p>
        </div>
      </div>
  </body>
  </html>
  `;

  try {
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: "A6",
      printBackground: true,
    });

    return pdfBuffer;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("PDF generation failed");
  } finally {
    await browser.close();
  }
};

const getSlugs = async () => {
  const blogsPath = path.join(
    __dirname,
    "../Blogs",
    process.env.BLOGS_JSON_PATH
  );
  const blogSlug = await readJson(blogsPath);
  return blogSlug.map((sl) => sl.slug);
};

export const preRenderBlog = async () => {
  const BLOG_SLUGS = await getSlugs();
  const browser = await launchBrowser();
  const page = await browser.newPage();

  const preRenderPage = async (url, outputPath) => {
    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.content();
    fs.writeFileSync(outputPath, content);
    console.log(`Pre-rendered: ${url} -> ${outputPath}`);
  };

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await preRenderPage(
    `${BASE_URL}${BLOG_LIST_PAGE}`,
    path.join(OUTPUT_DIR, "blogposts.html")
  );
  for (const slug of BLOG_SLUGS) {
    await preRenderPage(
      `${BASE_URL}/blogPosts/${slug}`,
      path.join(OUTPUT_DIR, `${slug}.html`)
    );
  }

  await browser.close();
  console.log("Pre-rendering complete.");
};
