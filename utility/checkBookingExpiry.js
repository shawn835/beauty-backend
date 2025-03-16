export const isBookingExpired = (booking) => {
  const bookingDate = new Date(`${booking.date}T${booking.time}`);

  const now = new Date();
  console.log("this booking is expired:", bookingDate);

  return now > bookingDate;
};
