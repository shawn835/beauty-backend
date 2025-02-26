// Middleware to handle CORS
export const handleCORS = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, GET, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

// Middleware to handle preflight (OPTIONS) requests
export const handlePreflight = (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true; // carry on with the actual request
  }
  return false; // Indicates that the request was not handled
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
