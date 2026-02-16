import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./employeedashboard.css";

export default function EmployeeDashboard() {
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("trip-info");
  const [tripInfo, setTripInfo] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null);

  // Fetch employee's assigned route/trip info
  useEffect(() => {
    fetchTripInfo();
    fetchMyBookings();
    fetchTravelHistory();
    fetchNotifications();
  }, [user?.id]);

  const fetchTripInfo = async () => {
    try {
      const response = await fetch("/api/corporate-employees/my-route", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTripInfo(data.data);
      }
    } catch (err) {
      console.error("[v0] Error fetching trip info:", err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await fetch(`/api/trips/my-bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMyBookings(data.data?.bookings || []);
      }
    } catch (err) {
      console.error("[v0] Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTravelHistory = async () => {
    try {
      const response = await fetch("/api/travel-history", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.data?.history || []);
      }
    } catch (err) {
      console.error("[v0] Error fetching history:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (err) {
      console.error("[v0] Error fetching notifications:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/trips/${bookingId}/cancel`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        setMyBookings(myBookings.filter((b) => b._id !== bookingId));
      }
    } catch (err) {
      console.error("[v0] Error canceling booking:", err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "trip-info":
        return <TripInfoTab tripInfo={tripInfo} loading={loading} />;
      case "my-bookings":
        return (
          <MyBookingsTab
            bookings={myBookings}
            onCancel={handleCancelBooking}
            loading={loading}
          />
        );
      case "history":
        return <HistoryTab history={history} loading={loading} />;
      case "notifications":
        return (
          <NotificationsTab notifications={notifications} loading={loading} />
        );
      default:
        return <TripInfoTab tripInfo={tripInfo} loading={loading} />;
    }
  };

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.fullName}</h1>
        <p className="subtitle">Corporate Employee Transportation Dashboard</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "trip-info" ? "active" : ""}`}
          onClick={() => setActiveTab("trip-info")}
        >
          Trip Info
        </button>
        <button
          className={`tab-btn ${activeTab === "my-bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("my-bookings")}
        >
          My Bookings
        </button>
        <button
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          className={`tab-btn ${activeTab === "notifications" ? "active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          Notifications
        </button>
      </div>

      <div className="dashboard-content">{renderContent()}</div>
    </div>
  );
}

function TripInfoTab({ tripInfo, loading }) {
  if (loading)
    return <div className="loading">Loading trip information...</div>;
  if (!tripInfo)
    return <div className="empty-state">No trip information available</div>;

  return (
    <div className="tab-content">
      <h2>Your Assigned Route</h2>
      <div className="trip-info-cards">
        <div className="info-card">
          <label>Route</label>
          <p>
            {tripInfo.route?.fromLocation} → {tripInfo.route?.toLocation}
          </p>
        </div>
        <div className="info-card">
          <label>Vehicle</label>
          <p>
            {tripInfo.vehicle?.make} {tripInfo.vehicle?.model}
          </p>
          <small>{tripInfo.vehicle?.licensePlate}</small>
        </div>
        <div className="info-card">
          <label>Driver</label>
          <p>{tripInfo.driver?.fullName}</p>
          <small>{tripInfo.driver?.phone}</small>
        </div>
        <div className="info-card">
          <label>Pickup Stop</label>
          <p>{tripInfo.pickupStop || "Not assigned"}</p>
        </div>
        <div className="info-card">
          <label>Dropoff Stop</label>
          <p>{tripInfo.dropoffStop || "Not assigned"}</p>
        </div>
        <div className="info-card">
          <label>Shift Type</label>
          <p>{tripInfo.shiftType || "Full Day"}</p>
        </div>
      </div>
    </div>
  );
}

function MyBookingsTab({ bookings, onCancel, loading }) {
  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="tab-content">
      <h2>My Bookings</h2>
      {bookings.length === 0 ? (
        <div className="empty-state">No bookings yet</div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-info">
                <h3>
                  {booking.fromLocation} → {booking.toLocation}
                </h3>
                <p className="date">
                  {new Date(booking.tripDate).toLocaleDateString()} at{" "}
                  {booking.startTime}
                </p>
                <span className={`status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-actions">
                {booking.status !== "COMPLETED" && (
                  <button
                    className="cancel-btn"
                    onClick={() => onCancel(booking._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ history, loading }) {
  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="tab-content">
      <h2>Travel History</h2>
      {history.length === 0 ? (
        <div className="empty-state">No travel history</div>
      ) : (
        <div className="history-list">
          {history.map((trip) => (
            <div key={trip._id} className="history-item">
              <div className="history-date">
                {new Date(trip.date).toLocaleDateString()}
              </div>
              <div className="history-route">
                {trip.fromLocation} → {trip.toLocation}
              </div>
              <div className="history-status">{trip.attendance}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsTab({ notifications, loading }) {
  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="tab-content">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div className="empty-state">No notifications</div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notification-item ${!notif.isRead ? "unread" : ""}`}
            >
              <div className="notif-title">{notif.title}</div>
              <div className="notif-message">{notif.message}</div>
              <div className="notif-time">
                {new Date(notif.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
