import api from "../utils/api";

// Admin Dashboard API Service - Real backend integration

export const adminDashboardAPI = {
  /**
   * Get dashboard overview statistics
   * @returns {Promise} - Dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get("/admin/dashboard/overview");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching dashboard stats:", error.message);
      throw error;
    }
  },

  /**
   * Get all users with filters
   * @param {object} filters - {role, status, search}
   * @returns {Promise} - Users list
   */
  getUsers: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching users:", error.message);
      throw error;
    }
  },

  /**
   * Get user details
   * @param {string} userId - User ID
   * @returns {Promise} - User details
   */
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching user details:", error.message);
      throw error;
    }
  },

  /**
   * Update user status
   * @param {string} userId - User ID
   * @param {string} status - New status
   * @returns {Promise} - Update confirmation
   */
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error updating user status:", error.message);
      throw error;
    }
  },

  /**
   * Get all B2C partners
   * @returns {Promise} - B2C partners list
   */
  getB2CPartners: async () => {
    try {
      const response = await api.get("/admin/b2c-partners");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching B2C partners:", error.message);
      throw error;
    }
  },

  /**
   * Get all B2B clients
   * @returns {Promise} - B2B clients list
   */
  getB2BClients: async () => {
    try {
      const response = await api.get("/admin/b2b-clients");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching B2B clients:", error.message);
      throw error;
    }
  },

  /**
   * Get pending payments for verification
   * @returns {Promise} - Pending payments
   */
  getPendingPayments: async () => {
    try {
      const response = await api.get("/admin/payments/pending");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching pending payments:", error.message);
      throw error;
    }
  },

  /**
   * Verify payment
   * @param {string} paymentId - Payment ID
   * @param {string} status - verified or rejected
   * @param {string} notes - Admin notes
   * @returns {Promise} - Verification confirmation
   */
  verifyPayment: async (paymentId, status, notes = "") => {
    try {
      const response = await api.patch(`/admin/payments/${paymentId}/verify`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error verifying payment:", error.message);
      throw error;
    }
  },

  /**
   * Get financial summary
   * @param {object} filters - {startDate, endDate, type}
   * @returns {Promise} - Financial data
   */
  getFinancialSummary: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/finance/summary?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching financial summary:", error.message);
      throw error;
    }
  },

  /**
   * Get all transactions
   * @param {object} filters - {startDate, endDate, type, status}
   * @returns {Promise} - Transactions list
   */
  getTransactions: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching transactions:", error.message);
      throw error;
    }
  },

  /**
   * Get trip reports
   * @param {object} filters - {startDate, endDate, status}
   * @returns {Promise} - Trip reports
   */
  getTripReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/reports/trips?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching trip reports:", error.message);
      throw error;
    }
  },

  /**
   * Get ride pooling analytics
   * @returns {Promise} - Ride pooling data
   */
  getRidePoolingAnalytics: async () => {
    try {
      const response = await api.get("/admin/analytics/ride-pooling");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching ride pooling analytics:", error.message);
      throw error;
    }
  },

  /**
   * Get communication logs
   * @param {object} filters - {type, user, date}
   * @returns {Promise} - Communication logs
   */
  getCommunicationLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/communications?${params}`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching communication logs:", error.message);
      throw error;
    }
  },

  /**
   * Get advertisement data
   * @returns {Promise} - Ad campaigns
   */
  getAds: async () => {
    try {
      const response = await api.get("/admin/ads");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching ads:", error.message);
      throw error;
    }
  },

  /**
   * Create new advertisement
   * @param {object} adData - Ad information
   * @returns {Promise} - Created ad
   */
  createAd: async (adData) => {
    try {
      const response = await api.post("/admin/ads", adData);
      return response.data;
    } catch (error) {
      console.error("[v0] Error creating ad:", error.message);
      throw error;
    }
  },

  /**
   * Get requirements (from corporates/b2b)
   * @param {string} status - Filter by status
   * @returns {Promise} - Requirements list
   */
  getRequirements: async (status = null) => {
    try {
      let url = "/admin/requirements";
      if (status) {
        url += `?status=${status}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching requirements:", error.message);
      throw error;
    }
  },

  /**
   * Get quotations pending approval
   * @returns {Promise} - Quotations list
   */
  getPendingQuotations: async () => {
    try {
      const response = await api.get("/admin/quotations?status=PENDING");
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching quotations:", error.message);
      throw error;
    }
  },

  /**
   * Approve quotation
   * @param {string} quotationId - Quotation ID
   * @returns {Promise} - Approval confirmation
   */
  approveQuotation: async (quotationId) => {
    try {
      const response = await api.patch(`/admin/quotations/${quotationId}/approve`);
      return response.data;
    } catch (error) {
      console.error("[v0] Error approving quotation:", error.message);
      throw error;
    }
  },

  /**
   * Reject quotation
   * @param {string} quotationId - Quotation ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} - Rejection confirmation
   */
  rejectQuotation: async (quotationId, reason) => {
    try {
      const response = await api.patch(`/admin/quotations/${quotationId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error rejecting quotation:", error.message);
      throw error;
    }
  },

  /**
   * Export data to CSV
   * @param {string} reportType - Type of report to export
   * @param {object} filters - Export filters
   * @returns {Promise} - Export download
   */
  exportReport: async (reportType, filters = {}) => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...filters
      }).toString();
      const response = await api.get(`/admin/export?${params}`, {
        responseType: "blob"
      });
      return response.data;
    } catch (error) {
      console.error("[v0] Error exporting report:", error.message);
      throw error;
    }
  }
};

export default adminDashboardAPI;
