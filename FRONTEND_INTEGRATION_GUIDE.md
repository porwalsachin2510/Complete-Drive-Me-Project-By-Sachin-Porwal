# Frontend Integration Guide - Real Backend API

This guide shows how to integrate real backend APIs into each frontend page.

## API Services Created

### 1. **corporateEmployeeAPI.js**
Location: `/frontend/src/services/corporateEmployeeAPI.js`

Used by: Corporate Employee Dashboard
Methods:
- `getEmployeeTrips(employeeId, date)` - Get assigned trips
- `getEmployeeAssignedRoute(employeeId)` - Get route info
- `checkInTrip(tripId)` - Check in for trip
- `cancelTrip(tripId)` - Cancel trip
- `getNoShowHistory()` - No-show records
- `getNotifications()` - Notifications

### 2. **b2bPartnerAPI.js**
Location: `/frontend/src/services/b2bPartnerAPI.js`

Used by: B2B Partner Dashboard
Methods:
- `getContracts()` - Active contracts
- `getDailyTrips(date)` - Daily operations
- `getVehicleAssignments(contractId)` - Vehicle assignments
- `getEarnings(period)` - Settlements & earnings
- `getFleet()` - Vehicle list
- `getDrivers()` - Driver list
- `completeTrip(tripId, data)` - Complete trip

### 3. **commuterBookingAPI.js**
Location: `/frontend/src/services/commuterBookingAPI.js`

Used by: Commuter Dashboard & Booking Pages
Methods:
- `getAvailableTrips(filters)` - Search available trips
- `bookTrip(tripId, data)` - Book a seat
- `cancelBooking(bookingId)` - Cancel booking
- `getMyBookings(status)` - My bookings
- `getTripLiveTracking(tripId)` - Live driver location
- `getMonthlyPasses()` - Monthly pass options
- `buyMonthlyPass(data)` - Purchase pass

### 4. **adminDashboardAPI.js**
Location: `/frontend/src/services/adminDashboardAPI.js`

Used by: Admin Dashboard
Methods:
- `getDashboardStats()` - Overview stats
- `getUsers(filters)` - All users
- `getB2CPartners()` - B2C partners
- `getB2BClients()` - B2B clients
- `getPendingPayments()` - Payment verification
- `getFinancialSummary(filters)` - Finance data
- `getTripReports(filters)` - Trip analytics

## Redux Integration

### Corporate Employee Slice
Location: `/frontend/src/Redux/slices/corporateEmployeeSlice.js`

Features:
- Async thunks for API calls
- Loading states
- Error handling
- Selectors for component access
- Real-time location tracking

Usage:
```javascript
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmployeeTrips,
  selectEmployeeTrips,
  selectTripsLoading
} from '../Redux/slices/corporateEmployeeSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const trips = useSelector(selectEmployeeTrips);
  const loading = useSelector(selectTripsLoading);

  useEffect(() => {
    dispatch(fetchEmployeeTrips({ employeeId: userId, date: today }));
  }, [userId]);

  return (
    // Use trips and loading state
  );
}
```

## Integration Pattern for Each Page

### Pattern for Corporate Employee Dashboard
1. Import Redux slice and selectors
2. Use dispatch to fetch data with Redux async thunks
3. Use selectors to access Redux state
4. Subscribe to Socket.io for real-time updates
5. Handle loading and error states
6. Render data with real information

### Pattern for B2B Partner Dashboard
1. Import b2bPartnerAPI service
2. Fetch contracts on component mount
3. Fetch daily trips when date changes
4. Subscribe to Socket.io for trip updates
5. Handle real-time status changes
6. Display earnings and analytics

### Pattern for Commuter Dashboard
1. Import commuterBookingAPI service
2. Fetch available trips with search filters
3. Handle booking flow (search → select → book)
4. Subscribe to trip location updates
5. Display live driver tracking
6. Handle payment integration

### Pattern for Admin Dashboard
1. Import adminDashboardAPI service
2. Fetch dashboard stats on load
3. Implement tab-based filtering
4. Handle user management actions
5. Display real financial data
6. Support data export

## Common Implementation Steps

### Step 1: Create Redux Slice (if needed)
```javascript
// Create async thunks
export const fetchData = createAsyncThunk(
  'slice/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await API.method(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Handle in reducer
builder.addCase(fetchData.fulfilled, (state, action) => {
  state.data = action.payload;
});
```

### Step 2: Import in Component
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchData, selectData, selectLoading } from '../Redux/slices/slice';
```

### Step 3: Dispatch Actions
```javascript
useEffect(() => {
  dispatch(fetchData(params));
}, [dispatch, params]);
```

### Step 4: Access Redux State
```javascript
const data = useSelector(selectData);
const loading = useSelector(selectLoading);
```

### Step 5: Handle Real-Time Updates
```javascript
useEffect(() => {
  const socket = io(BACKEND_URL, { auth: { token } });
  
  socket.on('data-updated', (newData) => {
    dispatch(updateData(newData));
  });
  
  return () => socket.disconnect();
}, [token, dispatch]);
```

## Pages Requiring Integration

### Completed
- [x] Corporate Employee Dashboard
- [x] Redux Store with Corporate Employee Slice

### Priority High (Do Next)
- [ ] B2B Partner Profile Page
  - getDailyTrips()
  - getContracts()
  - Real-time trip updates
  
- [ ] Commuter Profile Page
  - getMyBookings()
  - getAvailableTrips()
  - getTripLiveTracking()

- [ ] Admin Dashboard
  - getDashboardStats()
  - getUsers()
  - getPendingPayments()

### Priority Medium
- [ ] B2C Partner Dashboard
- [ ] Driver Dashboards (all 3 types)
- [ ] Payment Callback Handler
- [ ] Routes List Pages

### Priority Low
- [ ] Profile Settings Pages
- [ ] Wallet/Balance Pages
- [ ] Reports Pages

## Testing Real Integration

### Test Corporate Employee Dashboard
1. Login as Corporate Employee
2. Verify trips are loaded from backend
3. Check driver location updates live
4. Verify check-in works
5. Test trip cancellation

### Test B2B Partner Dashboard
1. Login as B2B Partner
2. View daily trips (real data)
3. Complete a trip
4. Check earnings calculation
5. Verify vehicle assignments

### Test Commuter Booking
1. Search available trips
2. Book a trip (real backend)
3. View booking confirmation
4. Track driver location in real-time
5. Cancel booking if needed

### Test Admin Dashboard
1. View dashboard stats (real data)
2. Manage users
3. Verify pending payments
4. View financial reports
5. Approve quotations

## Socket.io Real-Time Events

### Available Events
- `location-update` - Driver location changed
- `trip-update` - Trip status changed
- `notification` - New notification
- `trip-assigned` - New trip assigned
- `payment-verified` - Payment verified
- `user-status-changed` - User status changed

### Example Usage
```javascript
socket.on('location-update', (data) => {
  dispatch(setDriverLocation(data));
});

socket.on('trip-update', (data) => {
  dispatch(updateTripStatus(data));
});
```

## Error Handling

All API services include proper error handling:
- Try-catch blocks
- Error logging to console
- Return meaningful error messages
- Reject promises with user-friendly messages

### Use in Components
```javascript
try {
  await dispatch(fetchData(params)).unwrap();
} catch (error) {
  setError(error || 'Failed to fetch data');
}
```

## Performance Optimization

### Memoization
```javascript
const MemoizedComponent = React.memo(Component);
```

### Lazy Loading
```javascript
const LazyComponent = React.lazy(() => import('./Component'));
```

### Selective Redux Updates
Use Redux selectors to only trigger re-renders when specific state changes:
```javascript
const trips = useSelector(selectEmployeeTrips);
const selectedTrip = useSelector(state => 
  state.corporateEmployee.trips.data.find(t => t._id === tripId)
);
```

## API Endpoints Reference

All endpoints used in frontend services:
- `/corporate-employees/{employeeId}/trips` - Employee trips
- `/trips/{tripId}` - Trip details
- `/trips/{tripId}/cancel` - Cancel trip
- `/contracts` - Contracts list
- `/b2b-operations/daily-trips` - Daily trips
- `/b2c-trips/available` - Available trips
- `/b2c-bookings` - Create booking
- `/admin/dashboard/overview` - Admin stats
- `/admin/users` - User management
- `/admin/payments/pending` - Payment verification
- `/wallet` - Wallet info
- `/notifications` - Notifications

## Next Steps

1. Implement remaining Redux slices for other user types
2. Update all dashboard pages with real API integration
3. Add proper loading spinners and error messages
4. Implement Socket.io event handlers in each page
5. Test end-to-end flows with real backend
6. Optimize performance with React.memo and lazy loading
7. Add comprehensive error handling and user feedback
8. Deploy and monitor real-time performance
