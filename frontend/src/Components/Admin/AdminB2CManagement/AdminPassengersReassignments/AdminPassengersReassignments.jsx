"use client"

import { useState, useEffect } from "react"
import "./AdminPassengersReassignments.css"
import AdminReassignModal from "../AdminReassignModal/AdminReassignModal"
import api from "../../../../utils/api"

function AdminPassengersReassignments() {
  const [reassignments, setReassignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [selectedReassignment, setSelectedReassignment] = useState(null)

  useEffect(() => {
    fetchReassignments()
  }, [statusFilter])

  const fetchReassignments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/b2c/passenger-reassignments', {
        params: { status: statusFilter !== "all" ? statusFilter : undefined }
      })
      setReassignments(response.data.reassignments)
    } catch (error) {
      console.error("Error fetching reassignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessReassignment = async (reassignmentId, action, reason = "") => {
    try {
      await api.put(`/admin/b2c/passenger-reassignments/${reassignmentId}/process`, {
        action,
        reason
      })
      fetchReassignments()
    } catch (error) {
      console.error("Error processing reassignment:", error)
    }
  }

  const handleViewDetails = (reassignment) => {
    setSelectedReassignment(reassignment)
    setShowReassignModal(true)
  }

  const filteredReassignments = reassignments.filter(reassignment => 
    reassignment.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reassignment.passengerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reassignment.originalRoute.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reassignment.newRoute.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reassignment.reason.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "#28a745"
      case "rejected": return "#dc3545"
      case "pending": return "#ffc107"
      case "processing": return "#17a2b8"
      default: return "#6c757d"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "#dc3545"
      case "normal": return "#28a745"
      case "low": return "#6c757d"
      default: return "#6c757d"
    }
  }

  if (loading) {
    return (
      <div className="ad-dash-passenger-reassignments">
        <div className="loading">Loading passenger reassignments...</div>
      </div>
    )
  }

  return (
    <div className="ad-dash-passenger-reassignments">
      <div className="ad-dash-pr-header">
        <div>
          <h3 className="ad-dash-pr-title">Passenger Reassignments</h3>
          <p className="ad-dash-pr-subtitle">Manage passenger route change requests and transfers.</p>
        </div>
      </div>

      <div className="ad-dash-pr-filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="processing">Processing</option>
        </select>
        <input
          type="text"
          placeholder="Search by passenger, route, or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ad-dash-pr-table">
        <table>
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Original Route</th>
              <th>New Route</th>
              <th>Reason</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReassignments.map((reassignment) => (
              <tr key={reassignment._id}>
                <td>
                  <div className="passenger-info">
                    <span className="passenger-name">{reassignment.passengerName}</span>
                    <span className="passenger-email">{reassignment.passengerEmail}</span>
                  </div>
                </td>
                <td>
                  <div className="route-info">
                    <div className="route-name">{reassignment.originalRoute}</div>
                    <div className="provider-name">{reassignment.originalProvider}</div>
                  </div>
                </td>
                <td>
                  <div className="route-info">
                    <div className="route-name">{reassignment.newRoute}</div>
                    <div className="provider-name">{reassignment.newProvider}</div>
                  </div>
                </td>
                <td>
                  <span className="reason-text">{reassignment.reason}</span>
                </td>
                <td>
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(reassignment.priority) }}
                  >
                    {reassignment.priority}
                  </span>
                </td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(reassignment.status) }}
                  >
                    {reassignment.status}
                  </span>
                </td>
                <td>
                  <div className="date-info">
                    <span className="request-date">
                      {new Date(reassignment.requestedAt).toLocaleDateString()}
                    </span>
                    <span className="request-time">
                      {new Date(reassignment.requestedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => handleViewDetails(reassignment)}
                    >
                      View Details
                    </button>
                    {reassignment.status === 'pending' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleProcessReassignment(reassignment._id, 'approved')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleProcessReassignment(reassignment._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {reassignment.processedBy && (
                      <div className="processed-by">
                        by {reassignment.processedBy}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredReassignments.length === 0 && (
        <div className="no-reassignments">
          <p>No passenger reassignments found</p>
        </div>
      )}

      {/* Reassignment Details Modal */}
      {showReassignModal && selectedReassignment && (
        <AdminReassignModal
          reassignment={selectedReassignment}
          onClose={() => {
            setShowReassignModal(false)
            setSelectedReassignment(null)
          }}
          onProcess={handleProcessReassignment}
        />
      )}
    </div>
  )
}

export default AdminPassengersReassignments
