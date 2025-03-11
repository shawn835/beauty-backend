export const generateBookingId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let bookingId = "";
  for (let i = 0; i < 6; i++) {
    bookingId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return bookingId;
};
