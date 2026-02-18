import api from "../utils/api";

// Get today's trips for driver
export const getTodaysTrips = async () => {
  try {
    const response = await api.get("/driver/todays-trips");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching today's trips:", error);
    throw error;
  }
};

// Get trip details
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/driver/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip details:", error);
    throw error;
  }
};

// Start trip
export const startTrip = async (tripId) => {
  try {
    const response = await api.post(`/driver/trips/${tripId}/start`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error starting trip:", error);
    throw error;
  }
};

// Reach pickup point
export const reachPickupPoint = async (tripId) => {
  try {
    const response = await api.post(`/driver/trips/${tripId}/reach-pickup`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error reaching pickup point:", error);
    throw error;
  }
};

// Pickup passenger
export const pickupPassenger = async (tripId, passengerId) => {
  try {
    const response = await api.post(`/driver/trips/${tripId}/pickup`, {
      passengerId
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error picking up passenger:", error);
    throw error;
  }
};

// Drop off passenger
export const dropoffPassenger = async (tripId, passengerId) => {
  try {
    const response = await api.post(`/driver/trips/${tripId}/dropoff`, {
      passengerId
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error dropping off passenger:", error);
    throw error;
  }
};

// Complete trip
export const completeTrip = async (tripId, completionData) => {
  try {
    const response = await api.post(
      `/driver/trips/${tripId}/complete`,
      completionData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error completing trip:", error);
    throw error;
  }
};

// Update location (real-time tracking)
export const updateLocation = async (latitude, longitude) => {
  try {
    const response = await api.post("/driver/update-location", {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating location:", error);
    throw error;
  }
};

// Get vehicle details
export const getVehicleDetails = async () => {
  try {
    const response = await api.get("/driver/vehicle");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicle details:", error);
    throw error;
  }
};

// Get driver profile
export const getProfile = async () => {
  try {
    const response = await api.get("/driver/profile");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching driver profile:", error);
    throw error;
  }
};

// Update driver profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/driver/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating driver profile:", error);
    throw error;
  }
};

// Get earnings
export const getEarnings = async (period = "monthly") => {
  try {
    const response = await api.get("/driver/earnings", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching earnings:", error);
    throw error;
  }
};

// Get trip history
export const getTripHistory = async (filters = {}) => {
  try {
    const response = await api.get("/driver/trip-history", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip history:", error);
    throw error;
  }
};

// Get performance metrics
export const getPerformanceMetrics = async () => {
  try {
    const response = await api.get("/driver/performance");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching performance metrics:", error);
    throw error;
  }
};

// Get ratings and reviews
export const getRatingsAndReviews = async () => {
  try {
    const response = await api.get("/driver/ratings");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching ratings:", error);
    throw error;
  }
};

// Report emergency
export const reportEmergency = async (emergencyData) => {
  try {
    const response = await api.post("/driver/emergency", emergencyData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error reporting emergency:", error);
    throw error;
  }
};

// Get notifications
export const getNotifications = async () => {
  try {
    const response = await api.get("/driver/notifications");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await api.put(
      `/driver/notifications/${notificationId}/read`
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error marking notification as read:", error);
    throw error;
  }
};

// Get attendance
export const getAttendance = async (filters = {}) => {
  try {
    const response = await api.get("/driver/attendance", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching attendance:", error);
    throw error;
  }
};

// Mark attendance
export const markAttendance = async (attendanceData) => {
  try {
    const response = await api.post("/driver/attendance", attendanceData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error marking attendance:", error);
    throw error;
  }
};

export default {
  getTodaysTrips,
  getTripDetails,
  startTrip,
  reachPickupPoint,
  pickupPassenger,
  dropoffPassenger,
  completeTrip,
  updateLocation,
  getVehicleDetails,
  getProfile,
  updateProfile,
  getEarnings,
  getTripHistory,
  getPerformanceMetrics,
  getRatingsAndReviews,
  reportEmergency,
  getNotifications,
  markNotificationRead,
  getAttendance,
  markAttendance
};
