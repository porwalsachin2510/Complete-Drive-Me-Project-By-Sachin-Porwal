import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "../../../Components/Footer/Footer";
import "./corporateemployeedashboard.css";
import axios from "axios";

export default function CorporateEmployeeDashboard() {
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  
  const [activeTab, setActiveTab] = useState("corporate");
  const [assignedBus, setAssignedBus] = useState(null);
  const [todayTrips, setTodayTrips] = useState([]);
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [noShowHistory, setNoShowHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("trip-info");

  useEffect(() => {
    if (token && userId) {
      fetchEmployeeDashboardData();
      subscribeToUpdates();
    }
  }, [token, userId]);

  const fetchEmployeeDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch employee details and assigned bus
      const employeeRes = await axios.get(
        `/api/corporate-employees/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssignedBus(employeeRes.data.data.route);

      // Fetch today's trips
      const today = new Date().toISOString().split("T")[0];
      const tripsRes = await axios.get(
        `/api/trips/available?date=${today}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodayTrips(tripsRes.data.data.trips || []);

      // Fetch upcoming trips
      const upcomingRes = await axios.get(
        `/api/trips/my-bookings?status=SCHEDULED`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUpcomingTrips(upcomingRes.data.data.bookings || []);

      // Fetch no-show history
      const noShowRes = await axios.get(
        `/api/no-shows/my-history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoShowHistory(noShowRes.data.data.noShows || []);

      // Fetch notifications
      const notifRes = await axios.get(
        `/api/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifRes.data.data.notifications || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // This would typically use WebSocket or polling for real-time updates
    // Placeholder for socket subscription
    console.log("[v0] Subscribed to real-time updates");
  };

  const handleBookTrip = async (tripId) => {
    try {
      const seatNumber = prompt("Enter your seat number:");
      if (!seatNumber) return;

      const response = await axios.post(
        `/api/trips/${tripId}/book`,
        {
          pickupPoint: assignedBus?.fromLocation,
          seatNumber: parseInt(seatNumber),
          useMonthlyPass: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Trip booked successfully!");
      fetchEmployeeDashboardData();
    } catch (error) {
      alert(`Error booking trip: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCancelBooking = async (tripId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.delete(
          `/api/trips/${tripId}/cancel`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Booking cancelled successfully!");
        fetchEmployeeDashboardData();
      } catch (error) {
        alert(`Error cancelling booking: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div className="corporate-employee-dashboard">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="employee-dashboard-container">
        <div className="employee-dashboard-header">
          <h1>My Daily Commute</h1>
          <p>Stay updated with your assigned bus and bookings</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : (
          <div className="employee-dashboard-content">
            <div className="dashboard-tabs">
              <button
                className={`tab-btn ${activeSection === "trip-info" ? "active" : ""}`}
                onClick={() => setActiveSection("trip-info")}
              >
                Trip Info
              </button>
              <button
                className={`tab-btn ${activeSection === "bookings" ? "active" : ""}`}
                onClick={() => setActiveSection("bookings")}
              >
                My Bookings
              </button>
              <button
                className={`tab-btn ${activeSection === "history" ? "active" : ""}`}
                onClick={() => setActiveSection("history")}
              >
                History
              </button>
              <button
                className={`tab-btn ${activeSection === "notifications" ? "active" : ""}`}
                onClick={() => setActiveSection("notifications")}
              >
                Notifications
              </button>
            </div>

            {/* Assigned Bus Card */}
            {activeSection === "trip-info" && (
              <div className="section-content">
                <div className="assigned-bus-card">
                  <h2>Your Assigned Bus Route</h2>
                  {assignedBus ? (
                    <div className="bus-details">
                      <div className="route-info">
                        <div className="route-item">
                          <label>From:</label>
                          <span>{assignedBus?.fromLocation || "Loading..."}</span>
                        </div>
                        <div className="route-item">
                          <label>To:</label>
                          <span>{assignedBus?.toLocation || "Loading..."}</span>
                        </div>
                        <div className="route-item">
                          <label>Distance:</label>
                          <span>{assignedBus?.totalDistance || "N/A"} km</span>
                        </div>
                        <div className="route-item">
                          <label>Estimated Duration:</label>
                          <span>{assignedBus?.estimatedDuration || "N/A"} mins</span>
                        </div>
                      </div>
                      
                      <div className="driver-info">
                        <h3>Driver Information</h3>
                        <div className="driver-details">
                          <p><strong>Name:</strong> {assignedBus?.driverName || "To be assigned"}</p>
                          <p><strong>Phone:</strong> {assignedBus?.driverPhone || "N/A"}</p>
                          <p><strong>License:</strong> {assignedBus?.driverLicense || "N/A"}</p>
                        </div>
                      </div>

                      <div className="vehicle-info">
                        <h3>Vehicle Information</h3>
                        <div className="vehicle-details">
                          <p><strong>Type:</strong> {assignedBus?.vehicleType || "N/A"}</p>
                          <p><strong>License Plate:</strong> {assignedBus?.licensePlate || "N/A"}</p>
                          <p><strong>Capacity:</strong> {assignedBus?.totalSeats || "N/A"} seats</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="no-bus-assigned">
                      <p>No bus route assigned yet. Please contact your manager.</p>
                    </div>
                  )}
                </div>

                <div className="today-trips-card">
                  <h2>Today's Available Trips</h2>
                  {todayTrips.length > 0 ? (
                    <div className="trips-list">
                      {todayTrips.map((trip) => (
                        <div key={trip._id} className="trip-item">
                          <div className="trip-timing">
                            <span className="trip-time">{trip.startTime}</span>
                            <span className="trip-route">
                              {trip.fromLocation} → {trip.toLocation}
                            </span>
                          </div>
                          <div className="trip-seats">
                            <span>{trip.availableSeats} seats available</span>
                          </div>
                          <button
                            className="book-btn"
                            onClick={() => handleBookTrip(trip._id)}
                          >
                            Book Now
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-trips">
                      <p>No trips available for today</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Bookings */}
            {activeSection === "bookings" && (
              <div className="section-content">
                <div className="bookings-card">
                  <h2>My Upcoming Bookings</h2>
                  {upcomingTrips.length > 0 ? (
                    <div className="bookings-list">
                      {upcomingTrips.map((booking) => (
                        <div key={booking._id} className="booking-item">
                          <div className="booking-date">
                            {new Date(booking.tripDate).toLocaleDateString()}
                          </div>
                          <div className="booking-info">
                            <span className="booking-time">{booking.startTime}</span>
                            <span className="booking-route">
                              {booking.fromLocation} → {booking.toLocation}
                            </span>
                          </div>
                          <div className="booking-seat">
                            <span>Seat: {booking.myBooking?.seatNumber}</span>
                          </div>
                          <div className="booking-status">
                            <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                              {booking.status}
                            </span>
                          </div>
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-bookings">
                      <p>You don't have any upcoming bookings</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No-Show History */}
            {activeSection === "history" && (
              <div className="section-content">
                <div className="history-card">
                  <h2>No-Show History</h2>
                  {noShowHistory.length > 0 ? (
                    <div className="history-list">
                      {noShowHistory.map((noShow) => (
                        <div key={noShow._id} className="history-item">
                          <div className="history-date">
                            {new Date(noShow.date).toLocaleDateString()}
                          </div>
                          <div className="history-info">
                            <span>{noShow.message}</span>
                          </div>
                          <div className="history-reason">
                            <span>Reason: {noShow.reason || "Not specified"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-history">
                      <p>Great! No no-show records</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="section-content">
                <div className="notifications-card">
                  <h2>Recent Notifications</h2>
                  {notifications.length > 0 ? (
                    <div className="notifications-list">
                      {notifications.map((notif) => (
                        <div key={notif._id} className="notification-item">
                          <div className="notification-type">
                            <span className={`type-badge ${notif.type?.toLowerCase()}`}>
                              {notif.type}
                            </span>
                          </div>
                          <div className="notification-content">
                            <h4>{notif.title}</h4>
                            <p>{notif.message}</p>
                          </div>
                          <div className="notification-time">
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-notifications">
                      <p>No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
