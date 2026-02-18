import api from "../utils/api";

// B2B Partner API Service - Real backend integration

export const b2bPartnerAPI = {
  /**
   * Get all active contracts for B2B partner
   * @returns {Promise} - List of contracts
   */
  getContracts: async () => {
    try {
      const response = await api.get("/contracts/fleet/all");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching contracts:", error.message);
      throw error;
    }
  },

  /**
   * Get daily operations trips
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} - Daily trips
   */
  getDailyTrips: async (date) => {
    try {
      const response = await api.get(`/b2b-operations/daily-trips?date=${date}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching daily trips:", error.message);
      throw error;
    }
  },

  /**
   * Get driver assignments for a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise} - Driver assignment details
   */
  getTripDriverAssignments: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}/driver-assignments`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching driver assignments:", error.message);
      throw error;
    }
  },

  /**
   * Get vehicle assignments for contract
   * @param {string} contractId - Contract ID
   * @returns {Promise} - Vehicle assignments
   */
  getVehicleAssignments: async (contractId) => {
    try {
      const response = await api.get(
        `/vehicle-assignments?contractId=${contractId}`
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching vehicle assignments:", error.message);
      throw error;
    }
  },

  /**
   * Get earnings/settlements for partner
   * @param {string} period - Period (monthly, quarterly, yearly)
   * @returns {Promise} - Earnings data
   */
  getEarnings: async (period = "monthly") => {
    try {
      const response = await api.get(`/settlement?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching earnings:", error.message);
      throw error;
    }
  },

  /**
   * Get vehicle fleet list
   * @returns {Promise} - Vehicles list
   */
  getFleet: async () => {
    try {
      const response = await api.get("/vehicles/my/vehicles");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching fleet:", error.message);
      throw error;
    }
  },

  /**
   * Get driver list
   * @returns {Promise} - Drivers list
   */
  getDrivers: async () => {
    try {
      const response = await api.get("/b2b/drivers");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching drivers:", error.message);
      throw error;
    }
  },

  /**
   * Get route list for contract
   * @param {string} contractId - Contract ID
   * @returns {Promise} - Routes list
   */
  getRoutes: async (contractId) => {
    try {
      const response = await api.get(`/contracts/routes/${contractId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching routes:", error.message);
      throw error;
    }
  },

  /**
   * Update trip status
   * @param {string} tripId - Trip ID
   * @param {string} status - New status
   * @returns {Promise} - Updated trip
   */
  updateTripStatus: async (tripId, status) => {
    try {
      const response = await api.patch(`/trips/${tripId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("[v0] Error updating trip status:", error.message);
      throw error;
    }
  },

  /**
   * Complete trip
   * @param {string} tripId - Trip ID
   * @param {object} completionData - Completion details
   * @returns {Promise} - Completed trip
   */
  completeTrip: async (tripId, completionData) => {
    try {
      const response = await api.post(`/trips/${tripId}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error("[v0] Error completing trip:", error.message);
      throw error;
    }
  },

  /**
   * Get trip details with passengers
   * @param {string} tripId - Trip ID
   * @returns {Promise} - Full trip details
   */
  getTripDetails: async (tripId) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching trip details:", error.message);
      throw error;
    }
  },

  /**
   * Get contract details
   * @param {string} contractId - Contract ID
   * @returns {Promise} - Contract details
   */
  getContractDetails: async (contractId) => {
    try {
      const response = await api.get(`/contracts/${contractId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching contract details:", error.message);
      throw error;
    }
  },

  /**
   * Generate reports
   * @param {string} reportType - Type of report
   * @param {object} filters - Report filters
   * @returns {Promise} - Report data
   */
  generateReport: async (reportType, filters = {}) => {
    try {
      const response = await api.post(`/reports/generate`, {
        type: reportType,
        filters
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error generating report:", error.message);
      throw error;
    }
  }
};

export default b2bPartnerAPI;
