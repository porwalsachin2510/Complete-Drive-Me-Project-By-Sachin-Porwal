import api from "../utils/api";

// Daily trips for corporate
export const getDailyTrips = async (date) => {
  try {
    const response = await api.get("/corporate-operations/daily-trips", {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching daily trips:", error);
    throw error;
  }
};

// Get trip details with passengers
export const getTripDetails = async (tripId) => {
  try {
    const response = await api.get(`/corporate-operations/trips/${tripId}/details`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching trip details:", error);
    throw error;
  }
};

// Get assigned vehicles
export const getAssignedVehicles = async () => {
  try {
    const response = await api.get("/corporate-operations/assigned-routes-status");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching assigned vehicles:", error);
    throw error;
  }
};

// Get vehicle details
export const getVehicleDetails = async (vehicleId) => {
  try {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching vehicle details:", error);
    throw error;
  }
};

// Get employee routes
export const getEmployeeRoutes = async () => {
  try {
    const response = await api.get("/corporate-operations/assigned-routes-status");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching employee routes:", error);
    throw error;
  }
};

// Create new route
export const createRoute = async (routeData) => {
  try {
    const response = await api.post("/corporate/routes", routeData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error creating route:", error);
    throw error;
  }
};

// Update route
export const updateRoute = async (routeId, routeData) => {
  try {
    const response = await api.put(`/corporate/routes/${routeId}`, routeData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating route:", error);
    throw error;
  }
};

// Delete route
export const deleteRoute = async (routeId) => {
  try {
    const response = await api.delete(`/corporate/routes/${routeId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error deleting route:", error);
    throw error;
  }
};

// Bulk upload employees
export const bulkUploadEmployees = async (employees) => {
  try {
    const response = await api.post("/corporate-employees/bulk-upload", {
      employees
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error uploading employees:", error);
    throw error;
  }
};

// Get employees
export const getEmployees = async (filters = {}) => {
  try {
    const response = await api.get("/corporate-employees", { params: filters });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching employees:", error);
    throw error;
  }
};

// Get employee details
export const getEmployeeDetails = async (employeeId) => {
  try {
    const response = await api.get(`/corporate-employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching employee details:", error);
    throw error;
  }
};

// Update employee
export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const response = await api.put(
      `/corporate-employees/${employeeId}`,
      employeeData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating employee:", error);
    throw error;
  }
};

// Delete employee
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await api.delete(`/corporate-employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error deleting employee:", error);
    throw error;
  }
};

// Assign employees to trip
export const assignEmployeesToTrip = async (tripId, employeeIds) => {
  try {
    const response = await api.post(`/corporate-operations/trips/${tripId}/assign-employees`, {
      employeeIds
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error assigning employees:", error);
    throw error;
  }
};

// Mark attendance
export const markAttendance = async (tripId, attendanceData) => {
  try {
    const response = await api.post(
      `/corporate/trips/${tripId}/mark-attendance`,
      attendanceData
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error marking attendance:", error);
    throw error;
  }
};

// Get attendance report
export const getAttendanceReport = async (filters = {}) => {
  try {
    const response = await api.get("/corporate/attendance-report", {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching attendance report:", error);
    throw error;
  }
};

// Get contracts
export const getContracts = async (status = "") => {
  try {
    const response = await api.get("/corporate/contracts", {
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
    const response = await api.get(`/corporate/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching contract details:", error);
    throw error;
  }
};

// Get quotations
export const getQuotations = async () => {
  try {
    const response = await api.get("/corporate/quotations");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching quotations:", error);
    throw error;
  }
};

// Accept quotation
export const acceptQuotation = async (quotationId) => {
  try {
    const response = await api.post(
      `/corporate/quotations/${quotationId}/accept`
    );
    return response.data;
  } catch (error) {
    console.error("[v0] Error accepting quotation:", error);
    throw error;
  }
};

// Get requirements
export const getRequirements = async () => {
  try {
    const response = await api.get("/corporate/requirements");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching requirements:", error);
    throw error;
  }
};

// Create requirement
export const createRequirement = async (requirementData) => {
  try {
    const response = await api.post("/corporate/requirements", requirementData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error creating requirement:", error);
    throw error;
  }
};

// Get corporate profile
export const getCorporateProfile = async () => {
  try {
    const response = await api.get("/corporate/profile");
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching corporate profile:", error);
    throw error;
  }
};

// Update corporate profile
export const updateCorporateProfile = async (profileData) => {
  try {
    const response = await api.put("/corporate/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("[v0] Error updating corporate profile:", error);
    throw error;
  }
};

// Get performance analytics
export const getPerformanceAnalytics = async (period = "monthly") => {
  try {
    const response = await api.get("/corporate/analytics", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error);
    throw error;
  }
};

// Get cost analysis
export const getCostAnalysis = async (dateRange = {}) => {
  try {
    const response = await api.get("/corporate/cost-analysis", {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    console.error("[v0] Error fetching cost analysis:", error);
    throw error;
  }
};

export default {
  getDailyTrips,
  getTripDetails,
  getAssignedVehicles,
  getVehicleDetails,
  getEmployeeRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  bulkUploadEmployees,
  getEmployees,
  getEmployeeDetails,
  updateEmployee,
  deleteEmployee,
  assignEmployeesToTrip,
  markAttendance,
  getAttendanceReport,
  getContracts,
  getContractDetails,
  getQuotations,
  acceptQuotation,
  getRequirements,
  createRequirement,
  getCorporateProfile,
  updateCorporateProfile,
  getPerformanceAnalytics,
  getCostAnalysis
};
