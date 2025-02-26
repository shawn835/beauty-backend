export const handleMethodNotAllowed = (req, res) => {
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "method not allowed" }));
};
