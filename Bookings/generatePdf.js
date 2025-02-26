import puppeteer from "puppeteer";

export const generateBookingPDF = async (bookingDetails) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // ✅ Move function to the top before it's used in the template
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
       <img src="http://localhost:3000/hero-images/about-hero-image.jpg" alt="Salon Image" />
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
