import api from "../utils/api";

// Get daily trips for B2C partner
export const getDailyTrips = async (date) => {
  try {
    const response = await api.get("/b2c-operations/daily-trips", {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching daily trips:", error);
    throw error;
  }
};

// Get trip details
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/b2c-operations/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip details:", error);
    throw error;
  }
};

// Start trip
export const startTrip = async (tripId) => {
  try {
    const response = await api.post(`/b2c-operations/trips/${tripId}/start`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error starting trip:", error);
    throw error;
  }
};

// Complete trip
export const completeTrip = async (tripId, completionData) => {
  try {
    const response = await api.post(
      `/b2c-operations/trips/${tripId}/complete`,
      completionData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error completing trip:", error);
    throw error;
  }
};

// Get drivers
export const getDrivers = async () => {
  try {
    const response = await api.get("/b2c-operations/drivers");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching drivers:", error);
    throw error;
  }
};

// Get driver details
export const getDriverDetails = async (driverId) => {
  try {
    const response = await api.get(`/b2c-operations/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching driver details:", error);
    throw error;
  }
};

// Get vehicles
export const getVehicles = async () => {
  try {
    const response = await api.get("/b2c-operations/vehicles");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicles:", error);
    throw error;
  }
};

// Get vehicle details
export const getVehicleDetails = async (vehicleId) => {
  try {
    const response = await api.get(`/b2c-operations/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicle details:", error);
    throw error;
  }
};

// Get routes
export const getRoutes = async (filters = {}) => {
  try {
    const response = await api.get("/b2c-operations/routes", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching routes:", error);
    throw error;
  }
};

// Create route
export const createRoute = async (routeData) => {
  try {
    const response = await api.post("/b2c-operations/routes", routeData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error creating route:", error);
    throw error;
  }
};

// Update route
export const updateRoute = async (routeId, routeData) => {
  try {
    const response = await api.put(
      `/b2c-operations/routes/${routeId}`,
      routeData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating route:", error);
    throw error;
  }
};

// Delete route
export const deleteRoute = async (routeId) => {
  try {
    const response = await api.delete(`/b2c-operations/routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error deleting route:", error);
    throw error;
  }
};

// Get monthly pass subscriptions
export const getMonthlyPassSubscriptions = async () => {
  try {
    const response = await api.get("/b2c-operations/monthly-passes");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching monthly passes:", error);
    throw error;
  }
};

// Get route bookings
export const getRouteBookings = async (routeId, dateRange = {}) => {
  try {
    const response = await api.get(`/b2c-operations/routes/${routeId}/bookings`, {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching route bookings:", error);
    throw error;
  }
};

// Get earnings
export const getEarnings = async (period = "monthly") => {
  try {
    const response = await api.get("/b2c-operations/earnings", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching earnings:", error);
    throw error;
  }
};

// Get earnings breakdown
export const getEarningsBreakdown = async (dateRange = {}) => {
  try {
    const response = await api.get("/b2c-operations/earnings-breakdown", {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching earnings breakdown:", error);
    throw error;
  }
};

// Get analytics
export const getAnalytics = async (period = "monthly") => {
  try {
    const response = await api.get("/b2c-operations/analytics", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error);
    throw error;
  }
};

// Get B2C partner profile
export const getProfile = async () => {
  try {
    const response = await api.get("/b2c-operations/profile");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching profile:", error);
    throw error;
  }
};

// Update B2C partner profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/b2c-operations/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating profile:", error);
    throw error;
  }
};

// Get account details
export const getAccountDetails = async () => {
  try {
    const response = await api.get("/b2c-operations/account");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching account details:", error);
    throw error;
  }
};

// Get settlement details
export const getSettlement = async (period = "monthly") => {
  try {
    const response = await api.get("/b2c-operations/settlement", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching settlement:", error);
    throw error;
  }
};

// Get transaction history
export const getTransactionHistory = async (filters = {}) => {
  try {
    const response = await api.get("/b2c-operations/transactions", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching transaction history:", error);
    throw error;
  }
};

export default {
  getDailyTrips,
  getTripDetails,
  startTrip,
  completeTrip,
  getDrivers,
  getDriverDetails,
  getVehicles,
  getVehicleDetails,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getMonthlyPassSubscriptions,
  getRouteBookings,
  getEarnings,
  getEarningsBreakdown,
  getAnalytics,
  getProfile,
  updateProfile,
  getAccountDetails,
  getSettlement,
  getTransactionHistory
};
