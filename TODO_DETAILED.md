# 📝 DETAILED TODO LIST - DRIVE-ME TRANSPORT SYSTEM

---

## 🔴 CRITICAL - MUST DO (Block Full Functionality)

### BACKEND CRITICAL ITEMS

#### ✅ [DONE] 1. Trip Driver Assignment Endpoint
- **Status:** ✅ COMPLETED
- **File:** `backend/src/controllers/tripController.js`
- **What:** Added POST /api/trips/:tripId/assign-driver
- **Features Implemented:**
  - Driver role validation (B2B_PARTNER_DRIVER, CORPORATE_DRIVER)
  - Vehicle assignment verification
  - Authorization checks
  - Socket notifications to driver
  - Trip event logging

#### ⏳ 2. Employee Stop Assignment Endpoint
- **Status:** ❌ TODO
- **Priority:** CRITICAL
- **Effort:** 2 hours
- **File:** `backend/src/controllers/corporateEmployeeController.js`
- **What to build:**
  - New endpoint: `PATCH /api/corporate-employees/{employeeId}/assign-stops`
  - Body: `{ routeId, pickupStop, dropoffStop, effectiveDate }`
  - Validations:
    - Employee exists
    - Route exists
    - Stops are part of route
    - Stop sequence is valid (pickup before dropoff)
  - Response: Updated employee with stop assignments
  - Notification: Send email/SMS to employee

#### ⏳ 3. Notification Event Triggers
- **Status:** ❌ TODO (Framework exists)
- **Priority:** CRITICAL
- **Effort:** 3 hours
- **File:** `backend/src/Services/notificationService.js`
- **What to add:**
  ```javascript
  // 1. Trip Start Reminder (trigger at T-12 hours)
  async function triggerTripStartReminder(tripId) {
    // Notify all employees in trip
    // Send via: Email + SMS + In-app notification
    // Message: "Your bus leaves in 12 hours"
  }
  
  // 2. Bus Near Stop (trigger when driver <2km from stop)
  async function triggerBusNearStopNotification(tripId, stopId) {
    // Notify only employees getting down at this stop
    // Send via: Push notification + In-app
    // Message: "Bus is 2 minutes away"
  }
  
  // 3. Driver Assigned Notification
  async function sendDriverAssignedNotification(tripId, driverId) {
    // Notify all employees in this trip
    // Send via: Email + In-app notification
    // Include: Driver name, phone, vehicle details
  }
  
  // 4. Contract Expiry Warning (7 days before)
  async function sendContractExpiryWarning(contractId) {
    // Notify corporate admin
    // Include: Contract details, action required
  }
  
  // 5. Payment Success Notification
  async function sendPaymentSuccessNotification(paymentId, userId) {
    // Notify user
    // Include: Amount, transaction ID, date
  }
  ```

#### ⏳ 4. Trip Generation with Auto-Driver Assignment
- **Status:** ⚠️ PARTIAL (Service exists, automation incomplete)
- **Priority:** CRITICAL
- **Effort:** 2 hours
- **File:** `backend/src/Services/tripGenerationService.js`
- **What to enhance:**
  - When trip is created from schedule:
    1. Check vehicle assignment rule
    2. If `WITH_DRIVER`:
       - Find available B2B_PARTNER_DRIVER
       - Assign driver to trip
       - Send notification to driver
    3. If `WITHOUT_DRIVER`:
       - Find available CORPORATE_DRIVER (filter by skills/route)
       - Assign driver to trip
       - Send notification to driver
    4. If no driver available:
       - Mark as "AWAITING_DRIVER"
       - Create notification for admin

#### ⏳ 5. Enhance Booking Segment Logic
- **Status:** ⚠️ PARTIAL
- **Priority:** CRITICAL
- **Effort:** 3 hours
- **File:** `backend/src/Services/bookingService.js` (create if not exists)
- **What to implement:**
  - Current: Single seat per trip
  - New: Seat locking per stop-segment
  - Logic:
    ```
    When employee books Route A → Route D via stops [A, B, C, D]:
    - Lock seat for segment A→B
    - Lock seat for segment B→C
    - Lock seat for segment C→D
    - Calculate fare as: base_fare * (number_of_segments)
    - Show available seats: Available for [B→C] = Total - booked for B→C
    ```
  - Implementation:
    - Create `RouteSegment` concept in booking
    - Check availability per segment
    - Lock seats atomically
    - Handle cancellation (release segment locks)

---

### FRONTEND CRITICAL ITEMS

#### ⏳ 1. Employee Dashboard - Real API Integration
- **Status:** ⚠️ PARTIAL (Page exists, not integrated)
- **Priority:** CRITICAL
- **Effort:** 4 hours
- **Files:**
  - `frontend/src/Pages/CommuterPages/CorporateEmployeeDashboard/CorporateEmployeeDashboard.jsx`
  - `frontend/src/Pages/CommuterPages/CorporateEmployeeDashboard/corporateemployeedashboard.css`
- **What to fix:**

  **Tab 1: Trip Info**
  ```javascript
  // Replace mock data with real API
  const response = await fetch('/api/corporate-employees/my-route', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  // Show:
  - Route name & description
  - From location, To location
  - Pickup stop: Where employee gets on
  - Dropoff stop: Where employee gets down
  - Vehicle: Bus registration, capacity, type
  - Driver: Name, phone, photo
  - Schedule: Departure time, arrival time
  - Status: Active/Inactive
  ```

  **Tab 2: My Bookings**
  ```javascript
  // Fetch: GET /api/corporate-employees/{userId}/my-bookings
  // Show:
  - List of bookings for upcoming 7 days
  - For each: Trip date, departure time, status, vehicle
  - Actions: Cancel booking (if allowed), view details
  // Real-time: Listen to 'booking-confirmed' socket event
  ```

  **Tab 3: History**
  ```javascript
  // Fetch: GET /api/travel-history?userId={id}&limit=20
  // Show:
  - Past 20 trips
  - For each: Date, vehicle, driver, duration, distance
  - Analytics:
    * Attendance: % days booked vs available
    * No-shows: Count this month
    * Average ride time
  ```

  **Tab 4: Notifications**
  ```javascript
  // Fetch: GET /api/notifications?userId={id}&unread=true
  // Show:
  - List of notifications (newest first)
  - Mark as read: PATCH /api/notifications/{id}/read
  // Real-time: Listen to 'notification-received' socket event
  // Display: Toast for 5 seconds, then dismiss
  ```

#### ⏳ 2. Employee Management Page - Full Features
- **Status:** ⚠️ PARTIAL (Page structure exists, features incomplete)
- **Priority:** CRITICAL
- **Effort:** 5 hours
- **File:** `frontend/src/Pages/CorporatePages/CorporateEmployeeManagementPage/CorporateEmployeeManagementPage.jsx`
- **What to implement:**

  **Employee List with Real Data**
  ```javascript
  // Fetch: GET /api/corporate-employees?limit=10&page=1
  // Show:
  - Table with columns:
    * Employee ID
    * Name
    * Email
    * Department
    * Assigned Route
    * Pickup Stop
    * Dropoff Stop
    * Status (Active/Inactive)
  - Pagination: Show 10 per page
  - Search: Real-time filter by name/email/ID
  - Filter: By department, status, route
  // Update on interval: Refresh every 30 seconds
  ```

  **Bulk CSV Upload**
  ```javascript
  // UI Modal for:
  - File input: Accept .csv only
  - Template download: Show template format
  - Upload button
  - Progress bar: Show upload %
  
  // Format expected:
  Employee ID, Name, Email, Phone, Department, Route ID
  EMP001, John Doe, john@company.com, 9876543210, Engineering, ROUTE001
  
  // API: POST /api/corporate-employees/upload-csv
  // Response: List of results with success/error for each row
  
  // Error handling:
  - Invalid file format
  - Missing required fields
  - Duplicate employee IDs
  - Invalid phone numbers
  ```

  **Route Assignment Modal**
  ```javascript
  // When user clicks "Assign Route":
  1. Fetch available routes: GET /api/routes?corporateId={id}
  2. Show dropdown with routes
  3. On select:
     - Show route details
     - Show all stops in sequence
     - User selects pickup stop (earlier in sequence)
     - User selects dropoff stop (later in sequence)
  4. Submit: PATCH /api/corporate-employees/{id}/assign-route
  5. Success: Show toast "Route assigned successfully"
  ```

  **Stop Assignment Modal**
  ```javascript
  // Similar to route assignment but for stops:
  1. After route selected, show all stops visually
  2. Let user click pickup stop
  3. Let user click dropoff stop
  4. Validate: pickup stop index < dropoff stop index
  5. Submit: PATCH /api/corporate-employees/{id}/assign-stops
  6. Show: Visual confirmation with selected stops highlighted
  ```

  **Employee Actions**
  ```javascript
  // Action buttons per row:
  - View: Open modal with employee details
  - Edit: Popup to change route/stops
  - Deactivate: Soft delete (set active=false)
  - Delete: Hard delete (remove permanently)
  - View Bookings: Show employee's booking history
  
  // Confirmation dialogs for destructive actions
  ```

#### ⏳ 3. Trip Assignment Dashboard
- **Status:** ❌ TODO (COMPLETELY NEW PAGE)
- **Priority:** CRITICAL
- **Effort:** 4 hours
- **File:** `frontend/src/Pages/CorporatePages/TripAssignmentDashboard/TripAssignmentDashboard.jsx` (CREATE NEW)
- **What to create:**

  **Daily Trips List**
  ```javascript
  // Fetch: GET /api/trips?corporateId={id}&date={selectedDate}
  // Show in table:
  - Trip number/ID
  - From location
  - To location
  - Departure time
  - Total seats
  - Booked seats
  - Driver status (Assigned/Unassigned)
  - Vehicle details
  - Actions: View, Assign Driver, Edit
  
  // Filters:
  - Date selector (calendar)
  - Filter by vehicle
  - Filter by status
  // Sorting: By time, by vehicle, by status
  ```

  **Assign Driver Modal**
  ```javascript
  // When click "Assign Driver":
  1. Fetch available drivers: GET /api/drivers?type=CORPORATE_DRIVER&availableFor={tripId}
  2. Show list with:
     - Driver name & ID
     - Current assignments (today)
     - License expiry
     - Rating/reviews
  3. Select driver
  4. Confirm: PATCH /api/trips/{tripId}/assign-driver
  5. Success: Toast & refresh list
  6. Notification: Driver gets socket event 'trip-assigned'
  ```

  **Trip Details View**
  ```javascript
  // Click on trip to see:
  - Full trip schedule with all stops and timings
  - List of assigned employees
  - For each employee:
    * Name, ID, department
    * Pickup stop, dropoff stop
    * Booking status (Booked/Cancelled)
  - Vehicle details:
    * Registration, capacity, type
    * Maintenance status
  - Assigned driver:
    * Name, license number
    * Contact info
    * Photo
  - Actions:
    * Reassign driver
    * View map/route
    * Modify stops (if allowed)
  ```

#### ⏳ 4. Driver Dashboard Enhancement
- **Status:** ⚠️ PARTIAL (Exists, needs enhancement)
- **Priority:** CRITICAL
- **Effort:** 3 hours
- **Files:**
  - `frontend/src/Pages/DriverPages/CorporateDriverDashboard/CorporateDriverDashboard.jsx`
  - `frontend/src/Pages/DriverPages/B2BPartnerDriverDashboard/B2BPartnerDriverDashboard.jsx`
  - `frontend/src/Pages/DriverPages/B2CPartnerDriverDashboard/B2CPartnerDriverDashboard.jsx`
- **What to add:**

  **Today's Assigned Trips**
  ```javascript
  // Fetch: GET /api/driver/my-trips?date={today}
  // Display:
  - List of trips for today
  - For each trip:
    * Route (From → To)
    * Departure time, expected arrival
    * Number of passengers
    * Stops with passenger counts
  // Real-time: Listen to 'trip-assigned' socket event
  // Auto-refresh: Every 5 minutes
  
  // Actions:
  - Accept trip (if optional)
  - Start trip (button)
  - View route on map
  - Call passenger (if phone shared)
  ```

  **Trip Live Tracking**
  ```javascript
  // When trip starts:
  1. Emit socket event every 10 seconds:
     socket.emit('driver-location-update', {
       driverId: userId,
       location: { lat, lng },
       tripId, timestamp
     })
  
  2. Show real-time:
     - Current location on map
     - Next stop
     - Distance to next stop
     - ETA to next stop
     - Passengers getting down at this stop
  
  3. Passengers see:
     - Real-time bus location
     - Updated ETA
     - Driver info
  ```

  **Stop Management**
  ```javascript
  // For each trip:
  - Show upcoming stops
  - Actions at each stop:
    * "Mark passengers boarded"
    * "Mark passengers dropped"
  - Validation:
    * Check against booking list
    * Don't allow drop before pickup
    * Auto-calculate journey progress
  - Notifications:
    * Notify passengers when bus near stop
    * Confirm pickup/drop
  ```

---

## 🟠 HIGH PRIORITY (1-2 weeks)

#### ⏳ 1. Redux Integration for State Management
- **Status:** ⚠️ PARTIAL (Store exists, slices incomplete)
- **Effort:** 3 hours
- **File:** `frontend/src/Redux/store.js`
- **What to create:**

  ```javascript
  // Create new slices in Redux:
  
  // 1. employeeSlice
  - state: { 
      route, 
      assignedStops, 
      upcomingBookings, 
      travelHistory 
    }
  - actions: {
      setRoute,
      setStops,
      addBooking,
      cancelBooking,
      setHistory
    }
  
  // 2. tripSlice
  - state: { 
      dailyTrips, 
      selectedTrip, 
      assignedDriver 
    }
  - actions: {
      setTrips,
      selectTrip,
      assignDriver,
      updateTrip
    }
  
  // 3. driverSlice
  - state: { 
      assignedTrips, 
      currentLocation, 
      activeTrip 
    }
  - actions: {
      setTrips,
      updateLocation,
      startTrip,
      endTrip
    }
  
  // 4. notificationSlice
  - state: { 
      notifications, 
      unreadCount 
    }
  - actions: {
      addNotification,
      readNotification,
      clearNotifications
    }
  
  // 5. locationSlice
  - state: { 
      driverLocations (map), 
      selectedDriver 
    }
  - actions: {
      updateDriverLocation,
      selectDriver,
      clearLocations
    }
  ```

#### ⏳ 2. Socket.IO Event Listeners
- **Status:** ❌ TODO (Infrastructure exists)
- **Effort:** 3 hours
- **File:** `frontend/src/context/SocketContext.jsx`
- **What to add:**

  ```javascript
  // Add socket listeners:
  
  // 1. Trip Assignment
  socket.on('trip-assigned', (data) => {
    // Update driver's Redux store
    // Show notification toast
    // Refresh driver dashboard
  });
  
  // 2. Driver Location Update
  socket.on('driver-location-update', (data) => {
    // Update location in Redux
    // Update map component
    // Recalculate ETA
  });
  
  // 3. Bus Near Stop
  socket.on('bus-near-stop', (data) => {
    // Show notification to passengers
    // Update remaining time
    // Highlight stop on map
  });
  
  // 4. Notification Received
  socket.on('notification-received', (data) => {
    // Add to Redux notifications
    // Show toast
    // Play sound (optional)
  });
  
  // 5. Booking Confirmed
  socket.on('booking-confirmed', (data) => {
    // Update employee's bookings
    // Refresh dashboard
  });
  
  // 6. Payment Success
  socket.on('payment-success', (data) => {
    // Update wallet
    // Show confirmation
  });
  
  // Error handling:
  socket.on('connect_error', handleError);
  socket.on('disconnect', handleDisconnect);
  ```

#### ⏳ 3. Live Location Map Component
- **Status:** ❌ TODO (NEW COMPONENT)
- **Effort:** 3 hours
- **File:** `frontend/src/Components/LiveLocationMap/LiveLocationMap.jsx` (CREATE NEW)
- **What to create:**

  ```javascript
  // Component shows:
  - Map (using Google Maps / Leaflet)
  - Current bus location (real-time)
  - Route path from start to end
  - All stops marked
  - Next stop highlighted
  - Passenger pickup points (if sharing location)
  
  // Features:
  - Zoom to current location
  - Show distance to next stop
  - Show ETA to next stop
  - Show current speed
  - Update every 10 seconds
  
  // Responsive:
  - Full screen on mobile
  - Sidebar on desktop
  ```

#### ⏳ 4. Notification Toast/Modal System
- **Status:** ❌ TODO (NEED UI COMPONENT)
- **Effort:** 2 hours
- **File:** `frontend/src/Components/NotificationCenter/NotificationCenter.jsx` (CREATE NEW)
- **What to create:**

  ```javascript
  // Component features:
  - Toast notifications (bottom right)
  - Auto-dismiss after 5 seconds
  - Different types: Success, Error, Info, Warning
  - Click to expand/view full notification
  - Action buttons in notification (if applicable)
  - Notification count badge
  - Bell icon in header
  - Click bell to show all notifications
  - Mark as read
  - Delete notification
  
  // Integration with Redux:
  - Pull notifications from Redux store
  - Dispatch actions on user interaction
  ```

---

## 🟡 MEDIUM PRIORITY (2-4 weeks)

#### ⏳ 1. Route Visualization Component
- **Status:** ❌ TODO
- **Effort:** 2 hours
- **File:** `frontend/src/Components/RouteVisualization/RouteVisualization.jsx` (CREATE NEW)
- **Purpose:**
  - Show route as: Start → Stop 1 → Stop 2 → ... → End
  - Show as: Vertical line with numbered stops
  - On employee assignment: Highlight pickup/dropoff stops
  - On trip view: Show passengers getting on/off at each stop

#### ⏳ 2. Driver Assignment List Component
- **Status:** ❌ TODO
- **Effort:** 1.5 hours
- **File:** `frontend/src/Components/DriverAssignmentSelector/DriverAssignmentSelector.jsx` (CREATE NEW)
- **Purpose:**
  - Reusable component for assigning driver to trip
  - Show available drivers with stats
  - Search/filter drivers
  - Show driver details in tooltip

#### ⏳ 3. Stop Assignment Selector Component
- **Status:** ❌ TODO
- **Effort:** 2 hours
- **File:** `frontend/src/Components/StopAssignmentSelector/StopAssignmentSelector.jsx` (CREATE NEW)
- **Purpose:**
  - Visual route with clickable stops
  - Select pickup stop (click, turns green)
  - Select dropoff stop (click, turns blue)
  - Validate sequence
  - Show selected stops highlighted

#### ⏳ 4. CSV Upload Component (Reusable)
- **Status:** ⚠️ PARTIAL (Need generic component)
- **Effort:** 1.5 hours
- **File:** `frontend/src/Components/CSVUpload/CSVUpload.jsx` (CREATE NEW)
- **Purpose:**
  - Generic CSV upload with template
  - File validation
  - Preview before upload
  - Progress tracking
  - Result display (success/error per row)
  - Can be used for multiple imports

#### ⏳ 5. API Integration Utilities
- **Status:** ❌ TODO
- **Effort:** 2 hours
- **Files:**
  - `frontend/src/utils/apiClient.js` (create if not exists)
  - `frontend/src/utils/errorHandler.js`
- **What to add:**

  ```javascript
  // apiClient.js - Wrapper for all API calls
  - Automatic token inclusion
  - Error handling
  - Retry logic for failed requests
  - Request/response logging
  - Timeout handling
  
  // errorHandler.js
  - Parse error responses
  - User-friendly error messages
  - Categorize errors (auth, validation, server)
  - Auto-redirect on 401 (expired token)
  ```

---

## 🟢 LOW PRIORITY (Nice to Have)

#### ⏳ 1. Advanced Analytics Dashboard
- **Effort:** 4 hours
- **For:** Corporate admins
- **Metrics:**
  - Employee attendance rate
  - No-show rate
  - Cost per employee
  - Fleet utilization
  - On-time percentage

#### ⏳ 2. Route Optimization
- **Effort:** 6 hours
- **Purpose:**
  - Optimize pickup stops order
  - Minimize journey time
  - Suggest alternative routes

#### ⏳ 3. Feedback & Rating System
- **Effort:** 3 hours
- **Features:**
  - Passengers rate trips
  - Passengers rate drivers
  - Drivers rate passengers
  - Show ratings in driver profile

#### ⏳ 4. SOS / Emergency Features
- **Effort:** 2 hours
- **Features:**
  - Panic button in app
  - Notify emergency contact
  - Share location
  - Contact support

#### ⏳ 5. Accessibility Improvements
- **Effort:** 2 hours
- **Ensure:**
  - WCAG 2.1 AA compliance
  - Screen reader support
  - Keyboard navigation
  - Proper color contrast

---

## 📊 SUMMARY TABLE

| # | Item | Status | Priority | Effort | Dependency |
|---|------|--------|----------|--------|------------|
| 1 | Trip driver assignment endpoint | ✅ DONE | 🔴 Critical | Done | - |
| 2 | Employee stop assignment API | ❌ TODO | 🔴 Critical | 2h | - |
| 3 | Notification event triggers | ❌ TODO | 🔴 Critical | 3h | - |
| 4 | Trip generation auto-assignment | ⚠️ PARTIAL | 🔴 Critical | 2h | - |
| 5 | Booking segment logic | ⚠️ PARTIAL | 🔴 Critical | 3h | - |
| 6 | Employee dashboard integration | ⚠️ PARTIAL | 🔴 Critical | 4h | Item#2,3 |
| 7 | Employee management features | ⚠️ PARTIAL | 🔴 Critical | 5h | Item#2,4 |
| 8 | Trip assignment dashboard | ❌ TODO | 🔴 Critical | 4h | Item#1,4 |
| 9 | Driver dashboard enhancement | ⚠️ PARTIAL | 🔴 Critical | 3h | Item#3 |
| 10 | Redux integration | ⚠️ PARTIAL | 🟠 High | 3h | - |
| 11 | Socket.IO listeners | ❌ TODO | 🟠 High | 3h | Item#10 |
| 12 | Live location map | ❌ TODO | 🟠 High | 3h | Item#11 |
| 13 | Notification UI | ❌ TODO | 🟠 High | 2h | Item#10,11 |

---

## 🎯 RECOMMENDED EXECUTION ORDER

1. Start with **Item #2** (Employee stop assignment API) - 2 hours
2. Then **Item #3** (Notification triggers) - 3 hours
3. Then **Item #6** (Employee dashboard integration) - 4 hours
4. Then **Item #7** (Employee management) - 5 hours
5. Then **Item #8** (Trip assignment dashboard) - 4 hours
6. Then **Item #10** (Redux integration) - 3 hours
7. Then **Item #11** (Socket listeners) - 3 hours
8. Then **Item #12** (Live location) - 3 hours
9. Finally **Item #13** (Notification UI) - 2 hours

**Total Time: ~29 hours for all critical items**

---

