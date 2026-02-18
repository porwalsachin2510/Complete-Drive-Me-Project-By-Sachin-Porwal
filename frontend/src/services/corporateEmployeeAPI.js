import api from "../utils/api";

// Corporate Employee API Service - Real backend integration

export const corporateEmployeeAPI = {
  /**
   * Get employee's assigned trips for a specific date
   * @param {string} employeeId - Employee ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise} - List of assigned trips
   */
  getEmployeeTrips: async (employeeId, date) => {
    try {
      const response = await api.get(
        `/corporate-employees/${employeeId}/trips?date=${date}`
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching employee trips:", error.message);
      throw error;
    }
  },

  /**
   * Get employee's assigned route information
   * @param {string} employeeId - Employee ID
   * @returns {Promise} - Route and bus details
   */
  getEmployeeAssignedRoute: async (employeeId) => {
    try {
      const response = await api.get(
        `/corporate-employees/${employeeId}/assigned-route`
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching assigned route:", error.message);
      throw error;
    }
  },

  /**
   * Get trip details with driver info and live location
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
   * Check in for a trip
   * @param {string} tripId - Trip ID
   * @returns {Promise} - Check-in confirmation
   */
  checkInTrip: async (tripId) => {
    try {
      const response = await api.post(`/trips/${tripId}/check-in`, {});
      return response.data;
    } catch (error) {
      console.error("[v0] Error checking in:", error.message);
      throw error;
    }
  },

  /**
   * Cancel trip assignment
   * @param {string} tripId - Trip ID
   * @returns {Promise} - Cancellation confirmation
   */
  cancelTrip: async (tripId) => {
    try {
      const response = await api.delete(`/trips/${tripId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error cancelling trip:", error.message);
      throw error;
    }
  },

  /**
   * Get employee's no-show history
   * @returns {Promise} - No-show records
   */
  getNoShowHistory: async () => {
    try {
      const response = await api.get(`/no-show/my-no-shows`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching no-show history:", error.message);
      throw error;
    }
  },

  /**
   * Get all notifications for employee
   * @param {string} userId - User ID
   * @returns {Promise} - List of notifications
   */
  getNotifications: async (userId) => {
    try {
      const response = await api.get(`/notifications/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error.message);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Update confirmation
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error.message);
      throw error;
    }
  },

  /**
   * Get daily corporate trips (for corporate admin view)
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} contractId - Optional contract ID filter
   * @returns {Promise} - Daily trips
   */
  getDailyTrips: async (date, contractId = null) => {
    try {
      let url = `/corporate/daily-trips?date=${date}`;
      if (contractId) {
        url += `&contractId=${contractId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching daily trips:", error.message);
      throw error;
    }
  },

  /**
   * Assign route to vehicle
   * @param {object} assignmentData - {contractId, routeId, vehicleId, driverId}
   * @returns {Promise} - Assignment confirmation
   */
  assignRouteToVehicle: async (assignmentData) => {
    try {
      const response = await api.post(
        `/corporate/assign-route-to-vehicle`,
        assignmentData
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error assigning route to vehicle:", error.message);
      throw error;
    }
  },

  /**
   * Bulk assign employees to trips
   * @param {array} assignments - Array of {tripId, employeeIds, pickupPoint}
   * @returns {Promise} - Batch assignment result
   */
  bulkAssignEmployees: async (assignments) => {
    try {
      const response = await api.post(
        `/corporate/trips/bulk-assign-employees`,
        { assignments }
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error bulk assigning employees:", error.message);
      throw error;
    }
  },

  /**
   * Generate daily trips from active routes
   * @param {object} data - {contractId, date}
   * @returns {Promise} - Generated trips
   */
  generateDailyTrips: async (data) => {
    try {
      const response = await api.post(
        `/corporate/generate-daily-trips`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("[v0] Error generating daily trips:", error.message);
      throw error;
    }
  },

  /**
   * Get route assignment status
   * @param {string} routeId - Route ID
   * @returns {Promise} - Assignment status
   */
  getRouteAssignmentStatus: async (routeId = null) => {
    try {
      let url = `/corporate/assigned-routes-status`;
      if (routeId) {
        url += `?routeId=${routeId}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching route status:", error.message);
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
  }
};

export default corporateEmployeeAPI;
