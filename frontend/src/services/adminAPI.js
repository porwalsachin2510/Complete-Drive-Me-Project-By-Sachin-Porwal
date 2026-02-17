import api from "../utils/api";

// Admin Dashboard Overview
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching dashboard stats:", error);
    throw error;
  }
};

// B2C Management
export const getB2CPartners = async (filters = {}) => {
  try {
    const response = await api.get("/admin/b2c-partners", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching B2C partners:", error);
    throw error;
  }
};

export const getB2CPartnerDetails = async (partnerId) => {
  try {
    const response = await api.get(`/admin/b2c-partners/${partnerId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching B2C partner details:", error);
    throw error;
  }
};

export const approveB2CPartner = async (partnerId) => {
  try {
    const response = await api.post(`/admin/b2c-partners/${partnerId}/approve`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error approving B2C partner:", error);
    throw error;
  }
};

export const rejectB2CPartner = async (partnerId, reason) => {
  try {
    const response = await api.post(
      `/admin/b2c-partners/${partnerId}/reject`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error rejecting B2C partner:", error);
    throw error;
  }
};

// B2B Management
export const getB2BClients = async (filters = {}) => {
  try {
    const response = await api.get("/admin/b2b-clients", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching B2B clients:", error);
    throw error;
  }
};

export const getB2BClientDetails = async (clientId) => {
  try {
    const response = await api.get(`/admin/b2b-clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching B2B client details:", error);
    throw error;
  }
};

export const approveB2BClient = async (clientId) => {
  try {
    const response = await api.post(`/admin/b2b-clients/${clientId}/approve`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error approving B2B client:", error);
    throw error;
  }
};

// Users Management
export const getAllUsers = async (filters = {}) => {
  try {
    const response = await api.get("/admin/users", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching users:", error);
    throw error;
  }
};

export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching user details:", error);
    throw error;
  }
};

export const blockUser = async (userId, reason) => {
  try {
    const response = await api.post(`/admin/users/${userId}/block`, {
      reason
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error blocking user:", error);
    throw error;
  }
};

export const unblockUser = async (userId) => {
  try {
    const response = await api.post(`/admin/users/${userId}/unblock`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error unblocking user:", error);
    throw error;
  }
};

// Payment Verification
export const getPendingPayments = async () => {
  try {
    const response = await api.get("/admin/pending-payments");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching pending payments:", error);
    throw error;
  }
};

export const verifyPayment = async (paymentId) => {
  try {
    const response = await api.post(
      `/admin/payments/${paymentId}/verify`
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error verifying payment:", error);
    throw error;
  }
};

export const rejectPayment = async (paymentId, reason) => {
  try {
    const response = await api.post(
      `/admin/payments/${paymentId}/reject`,
      { reason }
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error rejecting payment:", error);
    throw error;
  }
};

// Finance & Reports
export const getFinanceSummary = async (dateRange = {}) => {
  try {
    const response = await api.get("/admin/finance/summary", {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching finance summary:", error);
    throw error;
  }
};

export const getTransactionHistory = async (filters = {}) => {
  try {
    const response = await api.get("/admin/transactions", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error);
    throw error;
  }
};

export const getReports = async (reportType, filters = {}) => {
  try {
    const response = await api.get(`/admin/reports/${reportType}`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching reports:", error);
    throw error;
  }
};

// Analytics
export const getAnalytics = async (period = "monthly") => {
  try {
    const response = await api.get("/admin/analytics", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error);
    throw error;
  }
};

// Ride Pooling Management
export const getRidePoolingStats = async () => {
  try {
    const response = await api.get("/admin/ride-pooling/stats");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching ride pooling stats:", error);
    throw error;
  }
};

export const getRidePoolingTrips = async (filters = {}) => {
  try {
    const response = await api.get("/admin/ride-pooling/trips", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching ride pooling trips:", error);
    throw error;
  }
};

// Communications
export const getComplaints = async (filters = {}) => {
  try {
    const response = await api.get("/admin/complaints", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching complaints:", error);
    throw error;
  }
};

export const resolveComplaint = async (complaintId, resolution) => {
  try {
    const response = await api.post(
      `/admin/complaints/${complaintId}/resolve`,
      { resolution }
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error resolving complaint:", error);
    throw error;
  }
};

// Advertisements
export const getAdvertisements = async () => {
  try {
    const response = await api.get("/admin/advertisements");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching advertisements:", error);
    throw error;
  }
};

export const createAdvertisement = async (adData) => {
  try {
    const response = await api.post("/admin/advertisements", adData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error creating advertisement:", error);
    throw error;
  }
};

export const updateAdvertisement = async (adId, adData) => {
  try {
    const response = await api.put(`/admin/advertisements/${adId}`, adData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating advertisement:", error);
    throw error;
  }
};

export const deleteAdvertisement = async (adId) => {
  try {
    const response = await api.delete(`/admin/advertisements/${adId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error deleting advertisement:", error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getB2CPartners,
  getB2CPartnerDetails,
  approveB2CPartner,
  rejectB2CPartner,
  getB2BClients,
  getB2BClientDetails,
  approveB2BClient,
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  getPendingPayments,
  verifyPayment,
  rejectPayment,
  getFinanceSummary,
  getTransactionHistory,
  getReports,
  getAnalytics,
  getRidePoolingStats,
  getRidePoolingTrips,
  getComplaints,
  resolveComplaint,
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement
};
