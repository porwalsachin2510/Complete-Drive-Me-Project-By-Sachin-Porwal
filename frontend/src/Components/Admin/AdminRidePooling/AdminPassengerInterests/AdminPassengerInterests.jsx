"use client"

import { useState, useEffect, useCallback } from "react"
import "./AdminPassengerInterests.css"
import api from "../../../../utils/api"

const AdminPassengerInterests = () => {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const fetchPassengerInterests = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/ride-pooling/passenger-interests', {
        params: { status: statusFilter !== "all" ? statusFilter : undefined }
      })
      setInterests(response.data.interests)
    } catch (error) {
      console.error("Error fetching passenger interests:", error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPassengerInterests()
  }, [fetchPassengerInterests])

  const handleStatusChange = async (interestId, newStatus) => {
    try {
      await api.put(`/admin/ride-pooling/passenger-interests/${interestId}/status`, {
        status: newStatus
      })
      fetchPassengerInterests()
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const filteredInterests = interests.filter(interest => 
    interest.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interest.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interest.dropoffLocation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#28a745"
      case "pending": return "#ffc107"
      case "inactive": return "#dc3545"
      default: return "#6c757d"
    }
  }

  if (loading) {
    return (
      <div className="admin-passenger-interests">
        <div className="loading">Loading passenger interests...</div>
      </div>
    )
  }

  return (
    <div className="admin-passenger-interests">
      <div className="interests-header">
        <h3>Passenger Interests</h3>
        <div className="interests-filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="interests-table">
        <table>
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Preferred Time</th>
              <th>Frequency</th>
              <th>Status</th>
              <th>Matched Routes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInterests.map(interest => (
              <tr key={interest._id}>
                <td>
                  <div className="passenger-info">
                    <span className="passenger-name">{interest.passengerName}</span>
                    <span className="passenger-id">{interest.passengerId}</span>
                  </div>
                </td>
                <td>{interest.pickupLocation}</td>
                <td>{interest.dropoffLocation}</td>
                <td>{interest.preferredTime}</td>
                <td>{interest.frequency}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(interest.status) }}
                  >
                    {interest.status}
                  </span>
                </td>
                <td>{interest.matchedRoutes}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn">View Details</button>
                    {interest.status === 'pending' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => handleStatusChange(interest._id, 'active')}
                        >
                          Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleStatusChange(interest._id, 'inactive')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {interest.status === 'active' && (
                      <button 
                        className="deactivate-btn"
                        onClick={() => handleStatusChange(interest._id, 'inactive')}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInterests.length === 0 && (
        <div className="no-interests">
          <p>No passenger interests found</p>
        </div>
      )}
    </div>
  )
}

export default AdminPassengerInterests
