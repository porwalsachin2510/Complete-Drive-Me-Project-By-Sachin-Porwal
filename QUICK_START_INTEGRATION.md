# ⚡ QUICK START - INTEGRATING FRONTEND WITH BACKEND

## 📌 THE PROBLEM

You have beautiful frontend UI, but many pages show **dummy data** instead of calling real APIs.

Example:
```javascript
// ❌ CURRENT - Dummy Data
const [routes] = useState([
  { id: 1, name: 'Route A', stops: 5 },
  { id: 2, name: 'Route B', stops: 3 }
]);

// ✅ WHAT IT SHOULD BE
const [routes, setRoutes] = useState([]);
useEffect(() => {
  api.get('/api/corporate/routes').then(res => {
    setRoutes(res.data.routes);
  });
}, []);
```

---

## 🔧 SOLUTION TEMPLATE

For **EVERY** component that needs API integration, follow this template:

### Step 1: Import necessary hooks and utilities
```javascript
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../utils/api';

// Import Redux slice if available
import { fetchRoutes, selectRoutes, selectLoading, selectError } 
  from '../../Redux/slices/routeSlice'; // If Redux slice exists
```

### Step 2: Set up state and fetch function
```javascript
export default function RoutesList() {
  // Option A: Use Redux (preferred for complex state)
  const dispatch = useDispatch();
  const routes = useSelector(selectRoutes);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Option B: Use local state (for simple data)
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/corporate/routes');
      if (response.data.success) {
        setRoutes(response.data.data); // or dispatch(setRoutes(...))
      }
    } catch (err) {
      setError(err.message);
      console.error('[v0] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {routes.map(route => (
        <RouteCard key={route._id} route={route} />
      ))}
    </div>
  );
}
```

### Step 3: Add CRUD operations
```javascript
const handleCreateRoute = async (formData) => {
  try {
    const response = await api.post('/api/corporate/routes', formData);
    if (response.data.success) {
      // Refresh list
      fetchData();
      // Show success
      alert('Route created successfully');
    }
  } catch (err) {
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};

const handleUpdateRoute = async (routeId, formData) => {
  try {
    const response = await api.put(`/api/corporate/routes/${routeId}`, formData);
    if (response.data.success) {
      fetchData();
      alert('Route updated');
    }
  } catch (err) {
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};

const handleDeleteRoute = async (routeId) => {
  if (!window.confirm('Delete this route?')) return;
  try {
    const response = await api.delete(`/api/corporate/routes/${routeId}`);
    if (response.data.success) {
      fetchData();
      alert('Route deleted');
    }
  } catch (err) {
    alert(`Error: ${err.response?.data?.message || err.message}`);
  }
};
```

---

## 📋 COMPONENTS TO INTEGRATE (PRIORITY ORDER)

### 🔴 CRITICAL (Do First)

#### 1. Corporate Route Management
**Files**: `frontend/src/Pages/CorporatePages/`
**Missing**: RouteCreationModal, RouteList, RoutedEditor

**APIs to Call**:
```javascript
// List routes
GET /api/corporate/routes

// Create route
POST /api/corporate/routes
Body: { name, description, stops: [{name, location, order}], schedules }

// Update route
PUT /api/corporate/routes/:id
Body: { name, stops, schedules }

// Delete route
DELETE /api/corporate/routes/:id

// Get single route
GET /api/corporate/routes/:id
```

**Integration Example**:
```javascript
// In CorporateProfilePage.jsx, add this to "routes" tab
const [routes, setRoutes] = useState([]);
const [selectedRoute, setSelectedRoute] = useState(null);

useEffect(() => {
  const fetchRoutes = async () => {
    try {
      const res = await api.get('/api/corporate/routes');
      setRoutes(res.data.data || []);
    } catch (err) {
      console.error('[v0] Error fetching routes:', err);
    }
  };
  fetchRoutes();
}, []);

// Then in JSX:
return (
  <div>
    <button onClick={() => setShowModal(true)}>Create Route</button>
    {showModal && <RouteCreationModal onSubmit={handleCreate} />}
    <RouteList routes={routes} onEdit={setSelectedRoute} />
  </div>
);
```

#### 2. B2B Daily Trips Dashboard
**Files**: `frontend/src/Pages/B2B_PartnerPages/`
**Missing**: DailyTripsDashboard, TripCard, DriverAssignmentModal

**APIs to Call**:
```javascript
// Get today's trips
GET /api/b2b-partner/trips?date=2024-02-16

// Assign driver to trip
PUT /api/trip/:tripId/assign-driver
Body: { driverId }

// Start trip
PUT /api/trip/:tripId/start

// Complete trip
PUT /api/trip/:tripId/complete
Body: { endOdometer, endTime }

// Update trip status
PUT /api/trip/:tripId/status
Body: { status: 'IN_PROGRESS' | 'COMPLETED' }
```

**Integration Example**:
```javascript
const [trips, setTrips] = useState([]);

useEffect(() => {
  const today = new Date().toISOString().split('T')[0];
  api.get(`/api/b2b-partner/trips?date=${today}`)
    .then(res => setTrips(res.data.data || []))
    .catch(err => console.error('[v0]', err));
}, []);

const assignDriver = async (tripId, driverId) => {
  try {
    await api.put(`/api/trip/${tripId}/assign-driver`, { driverId });
    // Refresh trips
    const today = new Date().toISOString().split('T')[0];
    const res = await api.get(`/api/b2b-partner/trips?date=${today}`);
    setTrips(res.data.data || []);
  } catch (err) {
    console.error('[v0]', err);
  }
};
```

#### 3. Employee Check-In System
**Files**: `frontend/src/Pages/CommuterPages/CorporateEmployeeDashboard/`
**Missing**: CheckInModal, TripCard with check-in button

**APIs to Call**:
```javascript
// Get assigned trip for employee
GET /api/corporate-employee/:employeeId/assigned-trip

// Check-in to trip
POST /api/corporate-employee/check-in
Body: { tripId }

// No-show report
POST /api/corporate-employee/no-show
Body: { tripId, reason }
```

**Integration Example**:
```javascript
const [assignedTrip, setAssignedTrip] = useState(null);

useEffect(() => {
  const userId = localStorage.getItem('userId');
  api.get(`/api/corporate-employee/${userId}/assigned-trip`)
    .then(res => setAssignedTrip(res.data.data))
    .catch(err => console.error('[v0]', err));
}, []);

const handleCheckIn = async (tripId) => {
  try {
    const res = await api.post('/api/corporate-employee/check-in', { tripId });
    if (res.data.success) {
      alert('Checked in successfully!');
      setAssignedTrip(prev => ({ ...prev, checkedIn: true }));
    }
  } catch (err) {
    alert('Check-in failed: ' + err.response?.data?.message);
  }
};
```

#### 4. Real-Time Location Updates
**Files**: `frontend/src/Components/LiveTracking/`
**Missing**: Socket.io event listeners, Map display

**Socket Events to Listen**:
```javascript
// In component:
import { useSocket } from '../../hooks/useSocket';

const socket = useSocket();

useEffect(() => {
  // Listen for driver location updates
  socket?.on('driver-location-update', (data) => {
    console.log('[v0] Driver location:', data);
    // Update map or state with new location
    setDriverLocation(data);
  });

  return () => {
    socket?.off('driver-location-update');
  };
}, [socket]);
```

**Driver Side** (in driver dashboard):
```javascript
const updateLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    // Send to backend
    await api.post('/api/driver/location/update', {
      latitude,
      longitude,
      timestamp: new Date()
    });

    // Emit via socket
    socket?.emit('update-location', {
      driverId: userId,
      lat: latitude,
      lng: longitude
    });
  } catch (err) {
    console.error('[v0] Location error:', err);
  }
};

// Call every 5 seconds
useEffect(() => {
  const interval = setInterval(updateLocation, 5000);
  return () => clearInterval(interval);
}, []);
```

---

### 🟠 HIGH PRIORITY (Week 1-2)

#### 5. B2C Schedule Management
```javascript
// APIs to call:
GET /api/b2c-partner/schedules
POST /api/b2c-partner/schedules
PUT /api/b2c-partner/schedules/:id
DELETE /api/b2c-partner/schedules/:id
```

#### 6. Admin Real-Time Dashboard
```javascript
// Use Socket.io for real-time updates:
socket?.on('stats-update', (data) => {
  setStats(data);
});
```

#### 7. Driver Earnings Dashboard
```javascript
GET /api/driver/earnings
GET /api/driver/earnings/daily
GET /api/driver/earnings/monthly
```

---

## 🔗 API CLIENT USAGE

Your API client is already set up:

```javascript
import api from '../utils/api';

// GET
const response = await api.get('/api/endpoint');

// POST
const response = await api.post('/api/endpoint', { data });

// PUT
const response = await api.put(`/api/endpoint/${id}`, { data });

// DELETE
const response = await api.delete(`/api/endpoint/${id}`);
```

---

## 🆘 COMMON ISSUES & FIXES

### Issue: "Cannot read property 'data' of undefined"
```javascript
// ❌ Wrong
const routes = response.data;

// ✅ Right
const routes = response.data.data || [];
```

### Issue: State not updating after API call
```javascript
// ❌ Wrong - Component doesn't re-render
fetch('/api/endpoint').then(r => r.json());

// ✅ Right - Uses state
const [data, setData] = useState([]);
api.get('/api/endpoint').then(res => setData(res.data.data));
```

### Issue: Too many API calls
```javascript
// ❌ Wrong - Fetches every render
function Component() {
  const [data, setData] = useState([]);
  api.get('/api/endpoint').then(res => setData(res.data.data));
  return <div>{data}</div>;
}

// ✅ Right - Fetches only once
function Component() {
  const [data, setData] = useState([]);
  useEffect(() => {
    api.get('/api/endpoint').then(res => setData(res.data.data));
  }, []);
  return <div>{data}</div>;
}
```

---

## ✅ CHECKLIST FOR EACH COMPONENT

When integrating a component with API:

- [ ] Import `api` utility
- [ ] Create `useState` for data, loading, error
- [ ] Create `useEffect` with API call
- [ ] Handle loading state (show spinner)
- [ ] Handle error state (show message)
- [ ] Display real data (no dummy values)
- [ ] Add CRUD buttons (create, update, delete)
- [ ] Implement each action with API call
- [ ] Show success/error messages
- [ ] Test with real database
- [ ] Check console for errors
- [ ] Verify data is from backend (not hardcoded)

---

## 🚀 IMPLEMENTATION CHECKLIST

**This Week**:
- [ ] Corporate Routes (use template above)
- [ ] B2B Daily Trips (use template above)
- [ ] Employee Check-In (use template above)
- [ ] Location Tracking (use Socket.io example above)

**Next Week**:
- [ ] B2C Schedule Management
- [ ] Driver Earnings
- [ ] Admin Real-Time Stats
- [ ] Form Validations

**Week 3**:
- [ ] Error Boundaries
- [ ] Mobile Responsive
- [ ] Performance Optimization
- [ ] Testing

---

## 💬 KEY REMINDER

**Every component must follow this pattern:**

```javascript
// 1. Fetch real data from API
useEffect(() => {
  api.get('/api/endpoint')
    .then(res => setState(res.data.data))
    .catch(err => setError(err.message));
}, []);

// 2. Show loading state
if (loading) return <LoadingSpinner />;

// 3. Show error state
if (error) return <ErrorMessage error={error} />;

// 4. Display real data
return (
  <div>
    {data.map(item => <ItemComponent key={item._id} item={item} />)}
  </div>
);

// 5. Handle user actions with API
const handleCreate = async (formData) => {
  const res = await api.post('/api/endpoint', formData);
  setState(prev => [...prev, res.data.data]);
};
```

**This is the golden pattern - use it everywhere!**
