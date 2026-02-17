import api from "../utils/api";

// Get daily trips for B2B partner
export const getDailyTrips = async (date) => {
  try {
    const response = await api.get("/b2b-operations/daily-trips", {
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
    const response = await api.get(`/b2b-operations/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip details:", error);
    throw error;
  }
};

// Start trip
export const startTrip = async (tripId) => {
  try {
    const response = await api.post(`/b2b-operations/trips/${tripId}/start`);
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
      `/b2b-operations/trips/${tripId}/complete`,
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
    const response = await api.get("/b2b-operations/drivers");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching drivers:", error);
    throw error;
  }
};

// Get driver details
export const getDriverDetails = async (driverId) => {
  try {
    const response = await api.get(`/b2b-operations/drivers/${driverId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching driver details:", error);
    throw error;
  }
};

// Assign driver to trip
export const assignDriverToTrip = async (tripId, driverId) => {
  try {
    const response = await api.post(
      `/b2b-operations/trips/${tripId}/assign-driver`,
      { driverId }
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error assigning driver:", error);
    throw error;
  }
};

// Get vehicles
export const getVehicles = async () => {
  try {
    const response = await api.get("/b2b-operations/vehicles");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicles:", error);
    throw error;
  }
};

// Get vehicle details
export const getVehicleDetails = async (vehicleId) => {
  try {
    const response = await api.get(`/b2b-operations/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicle details:", error);
    throw error;
  }
};

// Get routes
export const getRoutes = async (filters = {}) => {
  try {
    const response = await api.get("/b2b-operations/routes", {
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
    const response = await api.post("/b2b-operations/routes", routeData);
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
      `/b2b-operations/routes/${routeId}`,
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
    const response = await api.delete(`/b2b-operations/routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error deleting route:", error);
    throw error;
  }
};

// Get contracts
export const getContracts = async (status = "") => {
  try {
    const response = await api.get("/b2b-operations/contracts", {
      params: { status }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching contracts:", error);
    throw error;
  }
};

// Get contract details
export const getContractDetails = async (contractId) => {
  try {
    const response = await api.get(`/b2b-operations/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching contract details:", error);
    throw error;
  }
};

// Assign vehicle to contract
export const assignVehicleToContract = async (contractId, vehicleData) => {
  try {
    const response = await api.post(
      `/b2b-operations/contracts/${contractId}/assign-vehicle`,
      vehicleData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error assigning vehicle:", error);
    throw error;
  }
};

// Get quotations sent
export const getQuotationsSent = async () => {
  try {
    const response = await api.get("/b2b-operations/quotations-sent");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching quotations:", error);
    throw error;
  }
};

// Send quotation
export const sendQuotation = async (requirementId, quotationData) => {
  try {
    const response = await api.post(
      `/b2b-operations/requirements/${requirementId}/quotation`,
      quotationData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error sending quotation:", error);
    throw error;
  }
};

// Get earnings
export const getEarnings = async (period = "monthly") => {
  try {
    const response = await api.get("/b2b-operations/earnings", {
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
    const response = await api.get("/b2b-operations/earnings-breakdown", {
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
    const response = await api.get("/b2b-operations/analytics", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error);
    throw error;
  }
};

// Get B2B partner profile
export const getProfile = async () => {
  try {
    const response = await api.get("/b2b-operations/profile");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching profile:", error);
    throw error;
  }
};

// Update B2B partner profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/b2b-operations/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating profile:", error);
    throw error;
  }
};

// Get requirements from corporate
export const getRequirements = async () => {
  try {
    const response = await api.get("/b2b-operations/requirements");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching requirements:", error);
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
  assignDriverToTrip,
  getVehicles,
  getVehicleDetails,
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  getContracts,
  getContractDetails,
  assignVehicleToContract,
  getQuotationsSent,
  sendQuotation,
  getEarnings,
  getEarningsBreakdown,
  getAnalytics,
  getProfile,
  updateProfile,
  getRequirements
};
