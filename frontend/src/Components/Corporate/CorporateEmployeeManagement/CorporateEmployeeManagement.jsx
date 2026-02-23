import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../utils/api";
import "./CorporateEmployeeManagement.css";

function CorporateEmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [employeeForm, setEmployeeForm] = useState({
    fullName: "",
    email: "",
    whatsappNumber: "",
    department: "",
    designation: "",
    workLocation: "",
    residentialAddress: {
      street: "",
      area: "",
      city: "",
      state: "",
      postalCode: ""
    },
    transportDetails: {
      assignedRoute: "",
      pickupPoint: "",
      dropOffPoint: "",
      shiftType: "FULL_DAY"
    }
  });

  const [bulkUploadData, setBulkUploadData] = useState({
    employees: []
  });

  useEffect(() => {
    fetchEmployees();
    fetchAvailableRoutes();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Backend: GET /api/corporate-employees (corporateEmployeeRoutes.js)
      const response = await api.get('/corporate-employees', {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined
        }
      });
      setEmployees(response.data.data.employees);
      setTotalPages(response.data.data.pagination.pages);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      // Backend: GET /api/corporate-operations/assigned-routes-status
      const response = await api.get('/corporate-operations/assigned-routes-status');
      const routesData = response.data?.data;
      // Ensure availableRoutes is always an array
      if (Array.isArray(routesData)) {
        setAvailableRoutes(routesData);
      } else if (routesData && Array.isArray(routesData.routes)) {
        setAvailableRoutes(routesData.routes);
      } else if (routesData && Array.isArray(routesData.assignedRoutes)) {
        setAvailableRoutes(routesData.assignedRoutes);
      } else {
        setAvailableRoutes([]);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
      setAvailableRoutes([]);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Backend: POST /api/corporate-employee-users/register
      await api.post('/corporate-employee-users/register', employeeForm);
      setShowAddModal(false);
      resetEmployeeForm();
      fetchEmployees();
      alert("Employee added successfully!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate that we have employees to upload
      if (!bulkUploadData.employees || !Array.isArray(bulkUploadData.employees) || bulkUploadData.employees.length === 0) {
        alert("No employees data to upload. Please select a valid JSON file.");
        return;
      }
      
      // Backend: POST /api/corporate-employees/bulk-upload
      const response = await api.post('/corporate-employees/bulk-upload', bulkUploadData);
      setShowBulkUploadModal(false);
      setBulkUploadData({ employees: [] });
      fetchEmployees();
      
      const successCount = response.data?.data?.successful?.length || response.data?.data?.created || 0;
      const failCount = response.data?.data?.failed?.length || response.data?.data?.errors || 0;
      alert(`Bulk upload completed! ${successCount} successful, ${failCount} failed`);
    } catch (error) {
      console.error("Error in bulk upload:", error);
      alert(error.response?.data?.message || "Failed to complete bulk upload");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransport = async (employeeId, transportData) => {
    try {
      await api.put(`/employees/${employeeId}/transport`, transportData);
      fetchEmployees();
      alert("Transport details updated successfully!");
    } catch (error) {
      console.error("Error updating transport:", error);
      alert(error.response?.data?.message || "Failed to update transport");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      fetchEmployees();
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      fullName: "",
      email: "",
      whatsappNumber: "",
      department: "",
      designation: "",
      workLocation: "",
      residentialAddress: {
        street: "",
        area: "",
        city: "",
        state: "",
        postalCode: ""
      },
      transportDetails: {
        assignedRoute: "",
        pickupPoint: "",
        dropOffPoint: "",
        shiftType: "FULL_DAY"
      }
    });
  };

  const handleBulkUploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          setBulkUploadData({ employees: jsonData });
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        fullName: "John Doe",
        email: "john@company.com",
        whatsappNumber: "+1234567890",
        department: "IT",
        designation: "Software Engineer",
        workLocation: "Main Office",
        residentialAddress: {
          street: "123 Main St",
          area: "Downtown",
          city: "New York",
          state: "NY",
          postalCode: "10001"
        },
        assignedRoute: "",
        pickupPoint: "",
        dropOffPoint: "",
        shiftType: "FULL_DAY"
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "list":
        return (
          <div className="employee-list">
            <div className="list-header">
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add Employee
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBulkUploadModal(true)}
                >
                  📤 Bulk Upload
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading employees...</div>
            ) : (
              <div className="employees-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Route</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee._id}>
                        <td>{employee.fullName}</td>
                        <td>{employee.email}</td>
                        <td>{employee.whatsappNumber}</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>
                          <span className="status-badge active">Active</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              View
                            </button>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => setSelectedEmployee(employee)}
                            >
                              Edit Transport
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteEmployee(employee._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="corporate-employee-management">
      <div className="management-header">
        <h2>Employee Management</h2>
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === "list" ? "active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Employee List
          </button>
        </div>
      </div>

      <div className="management-content">
        {renderContent()}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="modal-form">
              <div className="form-section">
                <h4>Personal Information</h4>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={employeeForm.fullName}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    value={employeeForm.whatsappNumber}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Designation"
                    value={employeeForm.designation}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, designation: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Work Location"
                    value={employeeForm.workLocation}
                    onChange={(e) => setEmployeeForm(prev => ({ ...prev, workLocation: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Transport Details</h4>
                <div className="form-row">
                  <select
                    value={employeeForm.transportDetails.assignedRoute}
                    onChange={(e) => setEmployeeForm(prev => ({
                      ...prev,
                      transportDetails: { ...prev.transportDetails, assignedRoute: e.target.value }
                    }))}
                  >
                    <option value="">Select Route</option>
                    {Array.isArray(availableRoutes) && availableRoutes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.fromLocation || route.from} → {route.toLocation || route.to}
                      </option>
                    ))}
                  </select>
                  <select
                    value={employeeForm.transportDetails.shiftType}
                    onChange={(e) => setEmployeeForm(prev => ({
                      ...prev,
                      transportDetails: { ...prev.transportDetails, shiftType: e.target.value }
                    }))}
                  >
                    <option value="FULL_DAY">Full Day</option>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Pickup Point"
                    value={employeeForm.transportDetails.pickupPoint}
                    onChange={(e) => setEmployeeForm(prev => ({
                      ...prev,
                      transportDetails: { ...prev.transportDetails, pickupPoint: e.target.value }
                    }))}
                  />
                  <input
                    type="text"
                    placeholder="Drop-off Point"
                    value={employeeForm.transportDetails.dropOffPoint}
                    onChange={(e) => setEmployeeForm(prev => ({
                      ...prev,
                      transportDetails: { ...prev.transportDetails, dropOffPoint: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Bulk Upload Employees</h3>
              <button
                className="close-btn"
                onClick={() => setShowBulkUploadModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="bulk-upload-instructions">
                <h4>Instructions:</h4>
                <ol>
                  <li>Download the sample template below</li>
                  <li>Fill in employee details in the JSON file</li>
                  <li>Upload the completed file</li>
                </ol>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={downloadSampleTemplate}
                >
                  📥 Download Sample Template
                </button>
              </div>

              <form onSubmit={handleBulkUpload} className="modal-form">
                <div className="form-group">
                  <label>Upload JSON File</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleBulkUploadFile}
                    required
                  />
                </div>

                {bulkUploadData.employees.length > 0 && (
                  <div className="upload-preview">
                    <h4>Preview ({bulkUploadData.employees.length} employees)</h4>
                    <div className="preview-list">
                      {bulkUploadData.employees.slice(0, 5).map((emp, index) => (
                        <div key={index} className="preview-item">
                          {emp.fullName} - {emp.email}
                        </div>
                      ))}
                      {bulkUploadData.employees.length > 5 && (
                        <div className="preview-item">
                          ... and {bulkUploadData.employees.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowBulkUploadModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || bulkUploadData.employees.length === 0}
                  >
                    {loading ? "Uploading..." : "Upload Employees"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CorporateEmployeeManagement;
