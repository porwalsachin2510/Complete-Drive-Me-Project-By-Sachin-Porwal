"use client";

import { useState, useEffect } from "react";
import "./b2c_routecard.css";
import api from "../../../../utils/api";
import B2C_TripModal from "../B2C_TripModal/B2C_TripModal.jsx";

function B2C_RouteCard({ route, onRouteUpdated, onAddSchedule }) {
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateTripModal, setShowCreateTripModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [upcomingTrips, setUpcomingTrips] = useState([]);

  // Check if route has schedule and upcoming trips
  useEffect(() => {
    let cancelled = false;
    const checkScheduleAndTrips = async () => {
      try {
        // Check if schedule exists for this route
        const scheduleResponse = await api.get(`/b2c-schedules/schedules?routeId=${route._id}`);
        const hasScheduleData = scheduleResponse.data.success && scheduleResponse.data.schedules.length > 0;
        if (cancelled) return;
        setHasSchedule(hasScheduleData);

        if (hasScheduleData) {
          // Get upcoming trips for this route
          const tripsResponse = await api.get(`/b2c-trips/trips/today?routeId=${route._id}`);
          if (!cancelled && tripsResponse.data.success) {
            setUpcomingTrips(tripsResponse.data.trips || []);
          }
        }
      } catch (error) {
        console.error("Error checking schedule/trips:", error);
      }
    };

    checkScheduleAndTrips();
    return () => { cancelled = true; };
  }, [route._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#10b981";
      case "Inactive":
        return "#ef4444";
      case "Scheduled":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getTripTypeColor = (type) => {
    switch (type) {
      case "One Way":
        return "#3b82f6";
      case "Round Trip":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const handleDeleteRoute = async () => {
    if (!window.confirm("Are you sure you want to delete this route?")) return;
    
    try {
      await api.delete(`/b2c-partner/routes/${route._id}`);
      onRefresh();
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  return (
    <div className="b2c-route-card">
      <div className="b2c-route-header">
        <div className="b2c-route-info">
          <div className="b2c-route-locations">
            <div className="b2c-location">
              <span className="b2c-location-dot b2c-from"></span>
              <span className="b2c-location-text">{route.fromLocation}</span>
            </div>
            <div className="b2c-route-arrow">→</div>
            <div className="b2c-location">
              <span className="b2c-location-dot b2c-to"></span>
              <span className="b2c-location-text">{route.toLocation}</span>
            </div>
          </div>
        </div>
        
        {/* Separate badges container with absolute positioning - Only Active Badge */}
        <div className="b2c-badges-wrapper" style={{
          position: 'absolute',
          top: '2px',
          right: '12px',
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10
        }}>
          <span 
            className="b2c-status-badge"
            style={{ 
              backgroundColor: getStatusColor(route.status),
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '600',
              color: 'white',
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            {route.status}
          </span>
        </div>
      </div>

      <div className="b2c-route-details">
        <div className="b2c-detail-row">
          <div className="b2c-detail-item">
            <span className="b2c-detail-label">Start Time:</span>
            <span className="b2c-detail-value">{route.startTime}</span>
          </div>
          <div className="b2c-detail-item">
            <span className="b2c-detail-label">Available Days:</span>
            <span className="b2c-detail-value">{route.availableDays?.join(", ") || "Daily"}</span>
          </div>
        </div>

        <div className="b2c-detail-row">
          <div className="b2c-detail-item">
            <span className="b2c-detail-label">Total Seats:</span>
            <span className="b2c-detail-value">{route.totalSeats}</span>
          </div>
          <div className="b2c-detail-item">
            <span className="b2c-detail-label">Available:</span>
            <span className="b2c-detail-value">{route.availableSeats}</span>
          </div>
        </div>

        <div className="b2c-pricing-row">
          <div className="b2c-price-item">
            <span className="b2c-price-label">One Way:</span>
            <span className="b2c-price-value">KWD {route.pricing?.oneWayPrice || 0}</span>
          </div>
          {route.pricing?.roundTripPrice && (
            <div className="b2c-price-item">
              <span className="b2c-price-label">Round Trip:</span>
              <span className="b2c-price-value">KWD {route.pricing.roundTripPrice}</span>
            </div>
          )}
          {route.pricing?.monthlyPrice && (
            <div className="b2c-price-item">
              <span className="b2c-price-label">Monthly:</span>
              <span className="b2c-price-value">KWD {route.pricing.monthlyPrice}</span>
            </div>
          )}
        </div>

        {route.stopPoints && route.stopPoints.length > 0 && (
          <div className="b2c-stop-points">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              width: '100%'
            }}>
              <button 
                className="b2c-toggle-details"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide" : "Show"} Stop Points ({route.stopPoints.length})
              </button>
              
              <span 
                className="b2c-trip-type-badge"
                style={{ 
                  backgroundColor: getTripTypeColor(route.tripType),
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  color: 'white',
                  whiteSpace: 'nowrap'
                }}
              >
                {route.tripType}
              </span>
            </div>
            
            {showDetails && (
              <div className="b2c-stop-points-list">
                {route.stopPoints.map((stop, index) => (
                  <div key={index} className="b2c-stop-point">
                    <span className="b2c-stop-number">{index + 1}</span>
                    <span className="b2c-stop-location">{stop.location}</span>
                    <span className="b2c-stop-time">{stop.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="b2c-route-assignments">
          <div className="b2c-assignment-item">
            <span className="b2c-assignment-label">Vehicle:</span>
            <span className="b2c-assignment-value">
              {route.assignedVehicle?.model || "Not Assigned"}
            </span>
          </div>
          <div className="b2c-assignment-item">
            <span className="b2c-assignment-label">Driver:</span>
            <span className="b2c-assignment-value">
              {route.assignedDriver?.name || "Not Assigned"}
            </span>
          </div>
        </div>
      </div>

      <div className="b2c-route-actions">
        <button 
          className="b2c-action-btn b2c-edit-btn"
          onClick={() => console.log("Edit route:", route._id)}
        >
          Edit
        </button>
        
        <button 
          className="b2c-action-btn b2c-schedule-btn"
          onClick={() => onAddSchedule && onAddSchedule(route)}
        >
          {hasSchedule ? "Manage Schedule" : "Add Schedule"}
        </button>
        
        {hasSchedule ? (
          <button 
            className="b2c-action-btn b2c-view-trips-btn"
            onClick={() => setShowTripModal(true)}
          >
            View Trips ({upcomingTrips.length})
          </button>
        ) : (
          <button 
            className="b2c-action-btn b2c-trip-btn"
            onClick={() => setShowCreateTripModal(true)}
          >
            Create Trip
          </button>
        )}
        
        <button 
          className="b2c-action-btn b2c-delete-btn"
          onClick={handleDeleteRoute}
        >
          Delete
        </button>
      </div>

      {showCreateTripModal && (
        <B2C_CreateTripModal 
          route={route} 
          onClose={() => setShowCreateTripModal(false)} 
        />
      )}
      
      {showTripModal && (
        <B2C_TripModal 
          route={route} 
          onClose={() => setShowTripModal(false)} 
        />
      )}
    </div>
  );
}

export default B2C_RouteCard;
