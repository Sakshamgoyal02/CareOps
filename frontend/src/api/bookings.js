import api from "./axios.js";

export const getBookings = () => api.get("/bookings").then((r) => r.data);
export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status }).then((r) => r.data);
