// Middleware to handle CORS
export const handleCORS = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow requests from anywhere
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

// Middleware to handle preflight (OPTIONS) requests
export const handlePreflight = (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*", // Allow all origins
      "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true; // Stop further processing
  }
  return false; // Continue with the actual request
};

// Middleware to parse request body
export const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON format"));
      }
    });
  });
};

//uptime reboot
export const uptimeReboot = (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify({ status: "ok" }));
};

//within hours check
export const isWithinBusinessHours = (startTime) => {
  return startTime.getHours() >= 6 && startTime.getHours() < 21;
};
