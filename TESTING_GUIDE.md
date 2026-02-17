# END-TO-END TESTING GUIDE

## Complete Flow Testing for COMMUTER, B2C_PARTNER, and B2C_PARTNER_DRIVER

---

## TEST SCENARIO 1: COMMUTER BOOKING FLOW

### Preconditions
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- B2C Partner has created a route

### Test Steps

#### 1.1 Search for Route (Commuter)
```
1. Go to http://localhost:3000/
2. Enter pickup location: "Downtown"
3. Enter destination: "Airport"
4. Select date and time
5. Click "Search for Routes"
6. Expected: Available routes displayed with prices and schedules
```

#### 1.2 View Route Details
```
1. Verify route shows:
   - Bus type and capacity
   - Pickup times and points
   - Drop-off times and points
   - Monthly subscription price
   - Available plans (Full Month, Weekdays Only, etc.)
2. Click on a route to see more details
```

#### 1.3 Create Subscription Booking
```
1. Click "Subscribe" or "Book Monthly"
2. If not logged in: Sign up with email and password
3. Enter payment details (Test mode)
4. Confirm subscription
5. Expected: Booking created, digital pass generated
6. Verify: Booking appears in "My Bookings"
```

### Expected Backend Calls
```
GET /commute/search - Fetch available routes
POST /auth/register - Create user account
POST /bookings/create - Create subscription booking
GET /bookings - Fetch passenger bookings
```

---

## TEST SCENARIO 2: B2C PARTNER ACCEPTS BOOKING

### Preconditions
- Commuter has created a booking
- B2C Partner logged in

### Test Steps

#### 2.1 View Pending Bookings
```
1. B2C Partner logs in
2. Go to Dashboard → Trips/Bookings
3. Filter by "PENDING" status
4. Expected: Shows bookings waiting for acceptance
5. Verify: Shows passenger name, trip details, date, price
```

#### 2.2 Accept Booking
```
1. Click "Accept" on a pending booking
2. System checks wallet balance for admin commission
3. If balance sufficient: Booking marked as "ACCEPTED"
4. Expected: 
   - Booking status changes to "ACCEPTED"
   - Daily trips generated for the month
   - Passenger notification sent
5. Verify: In database, booking.bookingStatus = "ACCEPTED"
```

#### 2.3 Reject Booking (Optional)
```
1. Click "Reject" on a pending booking
2. Enter rejection reason (optional)
3. Click confirm
4. Expected: Booking marked as "REJECTED"
5. Passenger receives notification
```

### Expected Backend Calls
```
GET /bookings/partner - Fetch partner bookings
PUT /bookings/:bookingId/accept - Accept booking
POST /notifications - Send notification
POST /trips/generate-daily - Create daily trips
PUT /bookings/:bookingId/reject - Reject booking
```

---

## TEST SCENARIO 3: DAILY TRIP START/COMPLETE

### Preconditions
- Booking is in "ACCEPTED" status
- Daily trips have been generated

### Test Steps

#### 3.1 B2C Partner Starts Trip (Self-Driving)
```
1. B2C Partner logs in to dashboard
2. Clicks "Trips" or "My Trips" tab
3. Sees list of daily trips for today
4. Clicks "Start Trip" on a trip
5. Expected:
   - Trip status changes to "IN_PROGRESS"
   - Passenger receives notification: "Trip Started"
   - Location sharing begins
```

#### 3.2 Alternative: B2C Partner Driver Starts Trip
```
1. Driver logs in to B2CPartnerDriverDashboard
2. Views assigned bookings
3. Clicks "Start Trip"
4. Expected:
   - Trip status to "IN_PROGRESS"
   - GPS location sharing enabled
   - Real-time tracking begins
```

#### 3.3 Passenger Sees Trip Started
```
1. Passenger logs in
2. Goes to "My Bookings"
3. Sees booking with "IN_PROGRESS" status
4. Clicks "Track Driver"
5. Expected:
   - Google Map opens
   - Driver's real-time location visible
   - Trip details displayed
   - Location updates in real-time
```

#### 3.4 Trip Completes
```
1. Driver/Partner clicks "Complete Trip"
2. Trip status changes to "COMPLETED"
3. Expected:
   - Passenger receives notification: "Trip Completed"
   - Tracking stops
   - Trip marked in history
   - Settlement processed (if applicable)
```

### Expected Backend Calls
```
PUT /bookings/:bookingId/start - Start trip
Socket.io event: "driver-location-update" - Real-time location
PUT /bookings/:bookingId/complete - Complete trip
POST /settlements - Process settlement
POST /notifications - Send completion notification
```

---

## TEST SCENARIO 4: NO-SHOW AND DAILY TRIP HANDLING

### Test Steps

#### 4.1 Passenger Marks No-Show
```
1. Commuter gets daily trip reminder notification
2. Decides not to travel today
3. Clicks "Not traveling today" or "No Show"
4. Expected:
   - That day's trip marked as "NO_SHOW"
   - Seat freed for other passengers
   - No charge applied (if no-show policy allows)
```

#### 4.2 Multiple Days Handling
```
1. Check "My Bookings" - shows only TODAY's trip details
2. Tomorrow's trip is NOT visible yet
3. Refresh page after midnight
4. Tomorrow's trip should appear
5. Process: Same as Step 3 (Start → Track → Complete)
```

---

## TEST SCENARIO 5: B2C PARTNER CREATES ROUTE

### Preconditions
- B2C Partner has verified account

### Test Steps

#### 5.1 Create New Route
```
1. B2C Partner Dashboard → Routes
2. Click "Create New Route"
3. Fill in:
   - Route Name: "Downtown Express"
   - Pickup Points: [{ location: "Main St", time: "08:00" }]
   - Drop-off Points: [{ location: "Airport", time: "09:00" }]
   - Total Seats: 10
   - Schedule: Mon-Fri
   - Trip Type: Round Trip
4. Click "Create"
5. Expected: Route created, appears in route list
```

#### 5.2 Set Subscription Plans
```
1. On created route, click "Set Plans"
2. Define:
   - Full Month: 500 AED
   - Weekdays Only: 350 AED
   - Weekend Only: 150 AED
3. Click "Save Plans"
4. Expected: Plans saved, visible when passengers search
```

#### 5.3 View Route Subscribers
```
1. Route Dashboard shows:
   - Total active subscribers: 5
   - Revenue this month: 2500 AED
   - Subscriber list with names and plan types
   - Renewal dates
```

---

## CRITICAL VERIFICATION POINTS

### Backend Requirements
- [ ] All booking statuses: PENDING → ACCEPTED/REJECTED → IN_PROGRESS → COMPLETED
- [ ] Daily trips auto-generated after booking accepted
- [ ] Notifications sent at correct events
- [ ] Socket.io events firing in real-time
- [ ] Payment processing working
- [ ] Wallet balance decrements on accept
- [ ] Settlement calculated correctly

### Frontend Requirements
- [ ] Commuter sees routes from search
- [ ] B2C Partner sees pending bookings
- [ ] Accept button works and updates UI
- [ ] Trip status changes reflected immediately
- [ ] Real-time location appears on map
- [ ] Notifications visible in UI
- [ ] All daily trips showing within booking

### Real-Time Requirements
- [ ] Socket.io connection established
- [ ] Driver location updates every 5 seconds
- [ ] Passenger sees live location on map
- [ ] Notifications appear in real-time
- [ ] Trip status updates without page refresh

---

## TROUBLESHOOTING

### Issue: Routes not appearing in search
**Solution:**
- Verify B2C Partner has created routes
- Check route schedule is for today/selected date
- Verify route seats > 0

### Issue: Booking not accepted
**Solution:**
- Check B2C Partner wallet has sufficient balance
- Verify admin commission is less than balance
- Check network connection

### Issue: Location not tracking
**Solution:**
- Verify Socket.io connection in browser console
- Check driver GPS is enabled
- Verify booking is in IN_PROGRESS status
- Check browser location permissions

### Issue: Notifications not received
**Solution:**
- Check notification service is running
- Verify user ID in notification payload
- Check Socket.io events in browser console
- Verify notification subscription

---

## SUCCESS CRITERIA

All scenarios should complete successfully with:
✅ No errors in browser console
✅ No errors in backend logs
✅ All database records created correctly
✅ Real-time updates working
✅ Notifications received
✅ UI updates immediately
✅ All statuses transitioning correctly

---

