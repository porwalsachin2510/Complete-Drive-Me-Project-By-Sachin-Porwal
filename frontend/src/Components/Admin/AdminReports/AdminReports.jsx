"use client"

import { useState, useEffect } from "react"
import "./AdminReports.css"
import api from "../../../utils/api"

function AdminReports() {
  const [activeTab, setActiveTab] = useState("fraud-detection")
  const [loading, setLoading] = useState(true)
  const [fraudAlerts, setFraudAlerts] = useState([])
  const [userActivity, setUserActivity] = useState([])
  const [systemLogs, setSystemLogs] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      // Fetch fraud alerts
      const fraudResponse = await api.get('/admin/reports/fraud-alerts')
      setFraudAlerts(fraudResponse.data.alerts)

      // Fetch user activity
      const activityResponse = await api.get('/admin/reports/user-activity')
      setUserActivity(activityResponse.data.activity)

      // Fetch system logs
      const logsResponse = await api.get('/admin/reports/system-logs')
      setSystemLogs(logsResponse.data.logs)

      // Fetch reports
      const reportsResponse = await api.get('/admin/reports')
      setReports(reportsResponse.data.reports)
      
    } catch (error) {
      console.error("Error fetching reports data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertAction = async (alertId, action) => {
    try {
      await api.put(`/admin/reports/fraud-alerts/${alertId}/${action}`)
      fetchReportsData()
    } catch (error) {
      console.error(`Error ${action} alert:`, error)
    }
  }

  const handleUserAction = async (userId, action) => {
    try {
      await api.put(`/admin/reports/user-activity/${userId}/${action}`)
      fetchReportsData()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH": return "#dc3545"
      case "MEDIUM": return "#ffc107"
      case "LOW": return "#28a745"
      default: return "#6c757d"
    }
  }

  const getRiskColor = (score) => {
    if (score >= 80) return "#dc3545"
    if (score >= 60) return "#ffc107"
    return "#28a7745"
  }

  const renderFraudDetection = () => (
    <div className="reports-section">
      <div className="section-header">
        <h3>Fraud Detection</h3>
        <div className="alert-stats">
          <div className="stat-card">
            <span className="stat-number">{fraudAlerts.length}</span>
            <span className="stat-label">Total Alerts</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{fraudAlerts.filter(a => a.severity === 'HIGH').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="alerts-table">
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>User</th>
              <th>Severity</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fraudAlerts.map(alert => (
              <tr key={alert._id}>
                <td>{alert._id}</td>
                <td>{alert.type}</td>
                <td>{alert.description}</td>
                <td>{alert.userId?.fullName || alert.userId}</td>
                <td>
                  <span 
                    className="severity-badge" 
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </td>
                <td>{new Date(alert.createdAt).toLocaleString()}</td>
                <td>
                  <button 
                    className="resolve-btn"
                    onClick={() => handleAlertAction(alert._id, 'resolve')}
                  >
                    Resolve
                  </button>
                  <button 
                    className="investigate-btn"
                    onClick={() => handleAlertAction(alert._id, 'investigate')}
                  >
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderUserActivity = () => (
    <div className="reports-section">
      <div className="section-header">
        <h3>User Activity Monitoring</h3>
        <div className="activity-stats">
          <div className="stat-card">
            <span className="stat-number">{userActivity.length}</span>
            <span className="stat-label">Monitored Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{userActivity.filter(u => u.riskScore >= 80).length}</span>
            <span className="stat-label">High Risk</span>
          </div>
        </div>
      </div>

      <div className="activity-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>ID</th>
              <th>Risk Score</th>
              <th>Complaints</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userActivity.map(user => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user._id}</td>
                <td>
                  <span 
                    className="risk-score" 
                    style={{ backgroundColor: getRiskColor(user.riskScore) }}
                  >
                    {user.riskScore}
                  </span>
                </td>
                <td>{user.complaints}</td>
                <td>⭐ {user.rating}</td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn">View Details</button>
                  {user.status === 'Flagged' && (
                    <button 
                      className="unflag-btn"
                      onClick={() => handleUserAction(user._id, 'unflag')}
                    >
                      Unflag
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSystemLogs = () => (
    <div className="reports-section">
      <div className="section-header">
        <h3>System Logs</h3>
        <div className="log-stats">
          <div className="stat-card">
            <span className="stat-number">{systemLogs.length}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{systemLogs.filter(l => l.level === 'ERROR').length}</span>
            <span className="stat-label">Errors</span>
          </div>
        </div>
      </div>

      <div className="logs-container">
        {systemLogs.map(log => (
          <div key={log._id} className={`log-entry ${log.level.toLowerCase()}`}>
            <div className="log-header">
              <span className="log-timestamp">{new Date(log.timestamp).toLocaleString()}</span>
              <span className={`log-level ${log.level.toLowerCase()}`}>{log.level}</span>
              <span className="log-source">{log.source}</span>
            </div>
            <div className="log-message">{log.message}</div>
            {log.details && (
              <div className="log-details">
                <pre>{JSON.stringify(log.details, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderCustomReports = () => (
    <div className="reports-section">
      <div className="section-header">
        <h3>Custom Reports</h3>
        <button className="generate-report-btn">Generate Report</button>
      </div>

      <div className="reports-grid">
        {reports.map(report => (
          <div key={report._id} className="report-card">
            <div className="report-header">
              <h4>{report.title}</h4>
              <span className="report-date">{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="report-description">
              <p>{report.description}</p>
            </div>
            <div className="report-stats">
              <div className="stat">
                <span className="stat-label">Records:</span>
                <span className="stat-value">{report.recordCount}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Generated:</span>
                <span className="stat-value">{new Date(report.generatedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="report-actions">
              <button className="download-btn">Download</button>
              <button className="view-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "fraud-detection":
        return renderFraudDetection()
      case "user-activity":
        return renderUserActivity()
      case "system-logs":
        return renderSystemLogs()
      case "custom-reports":
        return renderCustomReports()
      default:
        return renderFraudDetection()
    }
  }

  if (loading) {
    return (
      <div className="admin-reports">
        <div className="loading">Loading reports data...</div>
      </div>
    )
  }

  return (
    <div className="admin-reports">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <div className="reports-overview">
          <div className="overview-item">
            <span className="overview-label">Active Alerts</span>
            <span className="overview-value">{fraudAlerts.filter(a => a.status === 'ACTIVE').length}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">Flagged Users</span>
            <span className="overview-value">{userActivity.filter(u => u.status === 'Flagged').length}</span>
          </div>
          <div className="overview-item">
            <span className="overview-label">System Errors</span>
            <span className="overview-value">{systemLogs.filter(l => l.level === 'ERROR').length}</span>
          </div>
        </div>
      </div>

      <div className="reports-tabs">
        <button
          className={`reports-tab ${activeTab === "fraud-detection" ? "active" : ""}`}
          onClick={() => setActiveTab("fraud-detection")}
        >
          Fraud Detection
        </button>
        <button
          className={`reports-tab ${activeTab === "user-activity" ? "active" : ""}`}
          onClick={() => setActiveTab("user-activity")}
        >
          User Activity
        </button>
        <button
          className={`reports-tab ${activeTab === "system-logs" ? "active" : ""}`}
          onClick={() => setActiveTab("system-logs")}
        >
          System Logs
        </button>
        <button
          className={`reports-tab ${activeTab === "custom-reports" ? "active" : ""}`}
          onClick={() => setActiveTab("custom-reports")}
        >
          Custom Reports
        </button>
      </div>

      <div className="reports-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default AdminReports
