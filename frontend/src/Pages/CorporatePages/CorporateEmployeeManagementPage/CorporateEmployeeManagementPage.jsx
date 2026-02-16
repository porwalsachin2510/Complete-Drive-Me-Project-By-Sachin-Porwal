import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "../../../Components/Footer/Footer";
import "./corporateemployeemanagement.css";
import axios from "axios";

export default function CorporateEmployeeManagementPage() {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);

  const [activeTab, setActiveTab] = useState("corporate");
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [assignmentData, setAssignmentData] = useState({
    routeId: "",
    pickupLocation: "",
    dropoffLocation: "",
  });

 


  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/corporate-employees?page=1&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEmployees(response.data.data.employees || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await axios.get(`/api/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(response.data.data.routes || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
    };
    
     useEffect(() => {
       if (token && userId) {
         fetchEmployees();
         fetchRoutes();
       }
     }, [token, userId]);

  const filterEmployees = () => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter((emp) => emp.department === filterDepartment);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
    };
    
      useEffect(() => {
        filterEmployees();
      }, [employees, searchTerm, filterDepartment]);


  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const response = await axios.post(
        `/api/corporate-employees/upload-csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(progress);
          },
        },
      );

      alert(
        `Upload successful! Added ${response.data.data.summary.successful} employees`,
      );
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadProgress(0);
      fetchEmployees();
    } catch (error) {
      alert(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAssignRoute = async (e) => {
    e.preventDefault();
    if (!selectedEmployee || !assignmentData.routeId) {
      alert("Please select employee and route");
      return;
    }

    try {
      const response = await axios.put(
        `/api/corporate-employees/${selectedEmployee._id}/assign-route`,
        {
          routeId: assignmentData.routeId,
          pickupLocation: assignmentData.pickupLocation,
          dropoffLocation: assignmentData.dropoffLocation,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Route assigned successfully!");
      setShowAssignmentModal(false);
      setSelectedEmployee(null);
      setAssignmentData({
        routeId: "",
        pickupLocation: "",
        dropoffLocation: "",
      });
      fetchEmployees();
    } catch (error) {
      alert(
        `Assignment failed: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(`/api/corporate-employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Employee deleted successfully!");
        fetchEmployees();
      } catch (error) {
        alert(
          `Delete failed: ${error.response?.data?.message || error.message}`,
        );
      }
    }
  };

  const handleDeactivateEmployee = async (employeeId) => {
    try {
      await axios.put(
        `/api/corporate-employees/${employeeId}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      alert("Employee deactivated successfully!");
      fetchEmployees();
    } catch (error) {
      alert(
        `Deactivation failed: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  const departments = [...new Set(employees.map((emp) => emp.department))];

  return (
    <div className="corporate-employee-management">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="employee-management-container">
        <div className="management-header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage and assign routes to your employees</p>
          </div>
          <div className="header-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowUploadModal(true)}
            >
              Upload CSV
            </button>
          </div>
        </div>

        <div className="management-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : (
          <>
            <div className="employees-summary">
              <div className="summary-card">
                <span className="summary-label">Total Employees</span>
                <span className="summary-value">{employees.length}</span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Active Employees</span>
                <span className="summary-value">
                  {employees.filter((emp) => emp.isActive).length}
                </span>
              </div>
              <div className="summary-card">
                <span className="summary-label">Assigned Routes</span>
                <span className="summary-value">
                  {employees.filter((emp) => emp.routeId).length}
                </span>
              </div>
            </div>

            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Assigned Route</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.length > 0 ? (
                    currentEmployees.map((employee) => (
                      <tr key={employee._id}>
                        <td className="employee-id">{employee.employeeId}</td>
                        <td className="employee-name">{employee.fullName}</td>
                        <td className="employee-email">{employee.email}</td>
                        <td>{employee.department}</td>
                        <td>{employee.designation}</td>
                        <td>
                          {employee.routeId ? (
                            <span className="route-badge">
                              {typeof employee.routeId === "string"
                                ? employee.routeId
                                : employee.routeId?.routeName}
                            </span>
                          ) : (
                            <span className="no-route">Not Assigned</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              employee.isActive ? "active" : "inactive"
                            }`}
                          >
                            {employee.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-btn assign-btn"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowAssignmentModal(true);
                            }}
                            title="Assign Route"
                          >
                            Assign
                          </button>
                          {employee.isActive && (
                            <button
                              className="action-btn deactivate-btn"
                              onClick={() =>
                                handleDeactivateEmployee(employee._id)
                              }
                              title="Deactivate"
                            >
                              Deactivate
                            </button>
                          )}
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteEmployee(employee._id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowUploadModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Employees from CSV</h2>
              <button
                className="close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="file-input"
                  required
                />
                <p className="helper-text">
                  CSV should have columns: Employee ID, Full Name, Email,
                  Contact Number, Department, Designation, Work Shift, Pickup
                  Location, Dropoff Location
                </p>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Upload
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Assignment Modal */}
      {showAssignmentModal && selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignmentModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Route to {selectedEmployee.fullName}</h2>
              <button
                className="close-btn"
                onClick={() => setShowAssignmentModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAssignRoute} className="assignment-form">
              <div className="form-group">
                <label>Select Route</label>
                <select
                  value={assignmentData.routeId}
                  onChange={(e) => {
                    const selectedRoute = routes.find(
                      (r) => r._id === e.target.value,
                    );
                    setAssignmentData({
                      routeId: e.target.value,
                      pickupLocation: selectedRoute?.fromLocation || "",
                      dropoffLocation: selectedRoute?.toLocation || "",
                    });
                  }}
                  className="form-select"
                  required
                >
                  <option value="">Select a route...</option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeName} ({route.fromLocation} →{" "}
                      {route.toLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pickup Location</label>
                <input
                  type="text"
                  value={assignmentData.pickupLocation}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      pickupLocation: e.target.value,
                    })
                  }
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Dropoff Location</label>
                <input
                  type="text"
                  value={assignmentData.dropoffLocation}
                  onChange={(e) =>
                    setAssignmentData({
                      ...assignmentData,
                      dropoffLocation: e.target.value,
                    })
                  }
                  className="form-input"
                  readOnly
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Assign Route
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignmentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
