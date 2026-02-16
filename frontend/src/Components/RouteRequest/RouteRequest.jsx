import React, { useState } from 'react';
import './RouteRequest.css';

const RouteRequest = ({ isOpen, onClose, searchParams, onRequestSubmitted }) => {
  const [formData, setFormData] = useState({
    pickupLocation: searchParams?.pickup || '',
    dropoffLocation: searchParams?.dropoff || '',
    preferredTime: searchParams?.time || '',
    travelDays: searchParams?.days || 'WEEKDAYS',
    urgency: 'NORMAL',
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to submit route request');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/route-requests/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Route request submitted successfully! We will notify you when this route becomes available.');
        setTimeout(() => {
          onRequestSubmitted();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit route request');
      }
    } catch (error) {
      console.error('Error submitting route request:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="route-request-overlay">
      <div className="route-request-modal">
        <div className="route-request-header">
          <h3>Request This Route</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="route-request-form">
          <div className="form-group">
            <label>Pickup Location</label>
            <input
              type="text"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
              placeholder="Enter pickup location"
            />
          </div>

          <div className="form-group">
            <label>Dropoff Location</label>
            <input
              type="text"
              name="dropoffLocation"
              value={formData.dropoffLocation}
              onChange={handleChange}
              required
              placeholder="Enter destination"
            />
          </div>

          <div className="form-group">
            <label>Preferred Travel Time</label>
            <input
              type="time"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Travel Days</label>
            <select
              name="travelDays"
              value={formData.travelDays}
              onChange={handleChange}
            >
              <option value="WEEKDAYS">Weekdays Only</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKENDS">Weekends Only</option>
              <option value="CUSTOM">Custom Days</option>
            </select>
          </div>

          <div className="form-group">
            <label>Urgency</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value="LOW">Low - Flexible timing</option>
              <option value="NORMAL">Normal - Standard priority</option>
              <option value="HIGH">High - Need soon</option>
              <option value="URGENT">Urgent - Immediate need</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows="3"
              placeholder="Any specific requirements or preferences..."
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteRequest;
