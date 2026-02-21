import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { startB2CTrip, completeB2CTrip } from "../../Redux/slices/bookingSlice";
import api from "../../utils/api";
import "./DailyTripsInBooking.css";

const DailyTripsInBooking = ({ booking, userRole, onTripStatusChange }) => {
  const dispatch = useDispatch();
  const [dailyTrips, setDailyTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);

  const fetchDailyTrips = useCallback(async () => {
    try {
      setLoading(true);
      const bookingId = booking?.bookingId || booking?._id;
      const response = await api.get(`/bookings/${bookingId}/daily-trips`);
      
      if (response.data.success) {
        const trips = Array.isArray(response.data.data) ? response.data.data : [];
        setDailyTrips(trips);
        console.log("[DailyTrips] Fetched trips:", trips);
      }
    } catch (error) {
      console.error("[DailyTrips] Error fetching trips:", error);
      setDailyTrips([]);
    } finally {
      setLoading(false);
    }
  }, [booking?.bookingId, booking?._id]);

  useEffect(() => {
    if (booking?.bookingId || booking?._id) {
      fetchDailyTrips();
    }
  }, [fetchDailyTrips, booking?.bookingId, booking?._id]);

  const handleStartTrip = async (tripId) => {
    try {
      const bookingId = booking?.bookingId || booking?._id;
      await dispatch(startB2CTrip(bookingId)).unwrap();
      
      // Send notification to passenger
      console.log("[DailyTrips] Trip started - notifying passenger");
      if (onTripStatusChange) {
        onTripStatusChange("STARTED", tripId);
      }
      
      // Refresh trips list
      await fetchDailyTrips();
    } catch (error) {
      console.error("[DailyTrips] Error starting trip:", error);
    }
  };

  const handleCompleteTrip = async (tripId) => {
    try {
      const bookingId = booking?.bookingId || booking?._id;
      await dispatch(completeB2CTrip(bookingId)).unwrap();
      
      // Send notification to passenger
      console.log("[DailyTrips] Trip completed - notifying passenger");
      if (onTripStatusChange) {
        onTripStatusChange("COMPLETED", tripId);
      }
      
      // Refresh trips list
      await fetchDailyTrips();
    } catch (error) {
      console.error("[DailyTrips] Error completing trip:", error);
    }
  };

  const getTripStatus = (trip) => {
    if (trip.tripStatus === "COMPLETED") return "Completed";
    if (trip.tripStatus === "STARTED") return "In Progress";
    if (trip.tripStatus === "CANCELLED") return "Cancelled";
    return "Pending";
  };

  const getTripStatusColor = (trip) => {
    if (trip.tripStatus === "COMPLETED") return "#28a745";
    if (trip.tripStatus === "STARTED") return "#ffc107";
    if (trip.tripStatus === "CANCELLED") return "#dc3545";
    return "#6c757d";
  };

  const isDriverRole = userRole === "B2C_PARTNER" || userRole === "B2C_PARTNER_DRIVER";
  const isPassengerRole = userRole === "NORMAL_PASSENGER" || userRole === "CORPORATE_EMPLOYEE";

  if (loading) {
    return <div className="daily-trips-loading">Loading daily trips...</div>;
  }

  if (!dailyTrips || dailyTrips.length === 0) {
    return <div className="daily-trips-empty">No trips scheduled for this booking</div>;
  }

  return (
    <div className="daily-trips-container">
      <div className="daily-trips-header">
        <h4>Daily Trips ({dailyTrips.length})</h4>
        <button 
          className="refresh-btn"
          onClick={fetchDailyTrips}
          title="Refresh trips"
        >
          ↻
        </button>
      </div>

      <div className="daily-trips-list">
        {dailyTrips.map((trip, index) => {
          const isExpanded = expandedTripId === trip._id;
          const tripTime = new Date(trip.tripDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div key={trip._id} className="daily-trip-card">
              <div 
                className="trip-header"
                onClick={() => setExpandedTripId(isExpanded ? null : trip._id)}
              >
                <div className="trip-info">
                  <div className="trip-number">Trip #{index + 1}</div>
                  <div className="trip-date">{tripTime}</div>
                  <div 
                    className="trip-status-badge"
                    style={{ backgroundColor: getTripStatusColor(trip) }}
                  >
                    {getTripStatus(trip)}
                  </div>
                </div>
                <div className="trip-chevron">
                  {isExpanded ? "▼" : "▶"}
                </div>
              </div>

              {isExpanded && (
                <div className="trip-details">
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{tripTime}</span>
                  </div>

                  {trip.fromLocation && (
                    <div className="detail-row">
                      <span className="label">From:</span>
                      <span className="value">{trip.fromLocation}</span>
                    </div>
                  )}

                  {trip.toLocation && (
                    <div className="detail-row">
                      <span className="label">To:</span>
                      <span className="value">{trip.toLocation}</span>
                    </div>
                  )}

                  {trip.pickupTime && (
                    <div className="detail-row">
                      <span className="label">Pickup Time:</span>
                      <span className="value">
                        {new Date(trip.pickupTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}

                  {trip.estimatedArrival && (
                    <div className="detail-row">
                      <span className="label">Estimated Arrival:</span>
                      <span className="value">
                        {new Date(trip.estimatedArrival).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  )}

                  {trip.driverId && (
                    <div className="detail-row">
                      <span className="label">Driver:</span>
                      <span className="value">{trip.driverName || trip.driverId}</span>
                    </div>
                  )}

                  {trip.vehicleNumber && (
                    <div className="detail-row">
                      <span className="label">Vehicle:</span>
                      <span className="value">{trip.vehicleNumber}</span>
                    </div>
                  )}

                  {/* Driver Actions */}
                  {isDriverRole && (
                    <div className="trip-actions">
                      {trip.tripStatus !== "COMPLETED" && trip.tripStatus !== "CANCELLED" && (
                        <>
                          {trip.tripStatus === "PENDING" && (
                            <button 
                              className="btn btn-start"
                              onClick={() => handleStartTrip(trip._id)}
                            >
                              ▶ Start Trip
                            </button>
                          )}

                          {trip.tripStatus === "STARTED" && (
                            <button 
                              className="btn btn-complete"
                              onClick={() => handleCompleteTrip(trip._id)}
                            >
                              ✓ Complete Trip
                            </button>
                          )}
                        </>
                      )}

                      {(trip.tripStatus === "COMPLETED" || trip.tripStatus === "CANCELLED") && (
                        <div className="trip-status-final">
                          {trip.tripStatus === "COMPLETED" ? "✓ Trip Completed" : "✗ Trip Cancelled"}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Passenger View */}
                  {isPassengerRole && trip.tripStatus === "STARTED" && (
                    <div className="passenger-actions">
                      <button className="btn btn-track">
                        📍 Track Driver
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTripsInBooking;
