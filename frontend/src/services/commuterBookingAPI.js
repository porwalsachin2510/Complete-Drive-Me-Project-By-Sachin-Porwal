import api from "../utils/api";

// Commuter Booking API Service - Real backend integration

export const commuterBookingAPI = {
  /**
   * Get available trips for booking
   * @param {object} filters - {date, fromLocation, toLocation}
   * @returns {Promise} - Available trips
   */
  getAvailableTrips: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/b2c-trips/available?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching available trips:", error.message);
      throw error;
    }
  },

  /**
   * Book a trip seat
   * @param {string} tripId - Trip ID
   * @param {object} bookingData - {seatNumber, pickupPoint, phoneNumber}
   * @returns {Promise} - Booking confirmation
   */
  bookTrip: async (tripId, bookingData) => {
    try {
      const response = await api.post(`/b2c-bookings`, {
        tripId,
        ...bookingData
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error booking trip:", error.message);
      throw error;
    }
  },

  /**
   * Cancel booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - Cancellation confirmation
   */
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.delete(`/b2c-bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error cancelling booking:", error.message);
      throw error;
    }
  },

  /**
   * Get my bookings
   * @param {string} status - Filter by status
   * @returns {Promise} - User's bookings
   */
  getMyBookings: async (status = null) => {
    try {
      let url = `/b2c-bookings/my-bookings`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching my bookings:", error.message);
      throw error;
    }
  },

  /**
   * Get booking details
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - Full booking details
   */
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/b2c-bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching booking details:", error.message);
      throw error;
    }
  },

  /**
   * Get trip live tracking
   * @param {string} tripId - Trip ID
   * @returns {Promise} - Live trip data with driver location
   */
  getTripLiveTracking: async (tripId) => {
    try {
      const response = await api.get(`/b2c-trips/${tripId}/tracking`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching live tracking:", error.message);
      throw error;
    }
  },

  /**
   * Get available routes (for route selection)
   * @param {object} filters - {fromLocation, toLocation, date}
   * @returns {Promise} - Available routes
   */
  getAvailableRoutes: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/b2c-routes?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching available routes:", error.message);
      throw error;
    }
  },

  /**
   * Get monthly passes
   * @returns {Promise} - Available monthly passes
   */
  getMonthlyPasses: async () => {
    try {
      const response = await api.get(`/monthly-pass`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching monthly passes:", error.message);
      throw error;
    }
  },

  /**
   * Buy monthly pass
   * @param {object} passData - {passType, paymentMethod}
   * @returns {Promise} - Purchase confirmation
   */
  buyMonthlyPass: async (passData) => {
    try {
      const response = await api.post(`/monthly-pass/buy`, passData);
      return response.data;
    } catch (error) {
      console.error("[v0] Error buying monthly pass:", error.message);
      throw error;
    }
  },

  /**
   * Get my monthly passes
   * @returns {Promise} - User's monthly passes
   */
  getMyMonthlyPasses: async () => {
    try {
      const response = await api.get(`/monthly-pass/my-passes`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching my monthly passes:", error.message);
      throw error;
    }
  },

  /**
   * Rate trip
   * @param {string} tripId - Trip ID
   * @param {object} ratingData - {rating, review, driverId}
   * @returns {Promise} - Rating confirmation
   */
  rateTrip: async (tripId, ratingData) => {
    try {
      const response = await api.post(`/trips/${tripId}/rate`, ratingData);
      return response.data;
    } catch (error) {
      console.error("[v0] Error rating trip:", error.message);
      throw error;
    }
  },

  /**
   * Get wallet balance
   * @returns {Promise} - Wallet information
   */
  getWallet: async () => {
    try {
      const response = await api.get(`/wallet/balance`);
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet:", error.message);
      throw error;
    }
  },

  /**
   * Add funds to wallet via payment session
   * @param {object} data - {amount, paymentMethod}
   * @returns {Promise} - Payment session with redirect URL
   */
  addFundsToWallet: async (data) => {
    try {
      const response = await api.post(`/wallet/create-payment-session`, {
        ...data,
        currency: data.currency || "KWD"
      });
      return response.data;
    } catch (error) {
      console.error("Error adding funds:", error.message);
      throw error;
    }
  }
};

export default commuterBookingAPI;
