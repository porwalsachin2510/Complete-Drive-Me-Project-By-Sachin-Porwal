import api from "../utils/api";

// Commuter search for available trips/routes
export const searchRoutes = async (params) => {
  const { source, destination, date, passengers } = params;
  try {
    const response = await api.get("/commute/search", {
      params: { source, destination, date, passengers }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error searching routes:", error);
    throw error;
  }
};

// Get commuter's booking history
export const getMyBookings = async () => {
  try {
    const response = await api.get("/commute/my-bookings");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching bookings:", error);
    throw error;
  }
};

// Book a trip
export const bookTrip = async (tripId, bookingData) => {
  try {
    const response = await api.post(`/commute/book/${tripId}`, bookingData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error booking trip:", error);
    throw error;
  }
};

// Get trip details with live tracking
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip details:", error);
    throw error;
  }
};

// Get commuter wallet and balance
export const getWalletInfo = async () => {
  try {
    const response = await api.get("/wallet/balance");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching wallet info:", error);
    throw error;
  }
};

// Add money to wallet via payment session
export const addWalletMoney = async (amount, paymentMethod) => {
  try {
    const response = await api.post("/wallet/create-payment-session", {
      amount,
      paymentMethod,
      currency: "KWD"
    });
    return response.data;
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId, reason) => {
  try {
    const response = await api.post(`/commute/cancel-booking/${bookingId}`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error cancelling booking:", error);
    throw error;
  }
};

// Get user profile
export const getCommuterProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching profile:", error);
    throw error;
  }
};

// Update profile
export const updateCommuterProfile = async (profileData) => {
  try {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating profile:", error);
    throw error;
  }
};

// Get travel history/ratings
export const getTravelHistory = async () => {
  try {
    const response = await api.get("/commute/travel-history");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching travel history:", error);
    throw error;
  }
};

// Rate a trip
export const rateTrip = async (tripId, rating, review) => {
  try {
    const response = await api.post(`/commute/rate-trip/${tripId}`, {
      rating,
      review
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error rating trip:", error);
    throw error;
  }
};

// Get notifications
export const getNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await api.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error);
    throw error;
  }
};

// Get saved favorites/routes
export const getSavedRoutes = async () => {
  try {
    const response = await api.get("/commute/saved-routes");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching saved routes:", error);
    throw error;
  }
};

// Save a route
export const saveRoute = async (source, destination) => {
  try {
    const response = await api.post("/commute/save-route", {
      source,
      destination
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error saving route:", error);
    throw error;
  }
};

export default {
  searchRoutes,
  getMyBookings,
  bookTrip,
  getTripDetails,
  getWalletInfo,
  addWalletMoney,
  cancelBooking,
  getCommuterProfile,
  updateCommuterProfile,
  getTravelHistory,
  rateTrip,
  getNotifications,
  markNotificationRead,
  getSavedRoutes,
  saveRoute
};
