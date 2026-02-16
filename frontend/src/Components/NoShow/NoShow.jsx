import React, { useState, useEffect } from 'react';
import './NoShow.css';

const NoShow = ({ tripId, onNoShowMarked }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reasons = [
    'SICK_LEAVE',
    'PERSONAL_EMERGENCY',
    'VACATION',
    'WORK_FROM_HOME',
    'MEETING_CONFLICT',
    'TRANSPORTATION_ISSUE',
    'OTHER'
  ];

  const handleInputChange = (e) => {
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
        setError('Please login to mark no-show');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/no-show/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tripId,
          ...formData
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('No-show marked successfully. Your seat has been released for today.');
        setTimeout(() => {
          setShowModal(false);
          onNoShowMarked && onNoShowMarked();
        }, 2000);
      } else {
        setError(data.message || 'Failed to mark no-show');
      }
    } catch (error) {
      console.error('Error marking no-show:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="no-show-btn"
        onClick={() => setShowModal(true)}
      >
        Mark No Show
      </button>

      {showModal && (
        <div className="no-show-overlay">
          <div className="no-show-modal">
            <div className="no-show-header">
              <h3>Mark No Show</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="no-show-form">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Reason</label>
                <select
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a reason</option>
                  {reasons.map(reason => (
                    <option key={reason} value={reason}>
                      {reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Provide any additional details..."
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Mark No Show'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default NoShow;
