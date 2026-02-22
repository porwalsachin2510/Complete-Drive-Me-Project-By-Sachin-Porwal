# DriveMe Platform - Complete Testing & Validation Guide

## 🧪 Testing Strategy for All 9 User Roles

### Pre-Testing Checklist
```
Backend:
✓ All API endpoints returning correct status codes
✓ Database connections working (MongoDB)
✓ JWT authentication working
✓ Socket.io connections established
✓ Payment gateways integrated (Stripe, TAP)
✓ Email service working
✓ File upload to Vercel Blob working
✓ Cron jobs scheduled and running

Frontend:
✓ All pages load without errors
✓ API calls using correct endpoints
✓ Redux store initialized
✓ WebSocket connections established
✓ Real-time location tracking working
✓ Payment modal displaying correctly
```

---

## Testing Scenarios by User Role

### 1️⃣ COMMUTER Testing

**Test Case 1.1: Homepage & Route Search**
```
Steps:
1. Open HomePage
2. Select Start Location (from dropdown or search)
3. Select Destination (from dropdown or search)
4. Select Date
5. Click "Find Routes"

Expected Results:
- API Call: GET /routes/search?from=X&to=Y&date=Z
- Frontend shows list of available routes
- Each route shows:
  - Route name
  - Pickup time
  - Price per month
  - Available seats
  - Driver rating
  - Vehicle type

Database Check:
- B2CPartnerRoute records fetched
- Filter by: from_location, to_location, schedule, availability
```

**Test Case 1.2: No Route Found - Create Requirement**
```
Steps:
1. Perform search with no matching routes
2. Click "Request This Route"
3. Fill requirement form:
   - Days needed (weekly/daily)
   - Priority
   - Additional notes
4. Submit

Expected Results:
- API Call: POST /requirements
- New Requirement created in database
- B2C_PARTNER and B2B_PARTNER receive notification
- Commuter gets confirmation message

Database Check:
- Requirement table में नई entry
- Status: "OPEN"
- Associated with userId
```

**Test Case 1.3: User Registration**
```
Steps:
1. Click Register
2. Select Role: "COMMUTER"
3. Fill form:
   - Name
   - Email
   - Phone
   - Address
   - Password
4. Verify Email
5. Complete Registration

Expected Results:
- API Call: POST /auth/register (role: COMMUTER)
- User created in database with COMMUTER role
- JWT token generated
- Login automatically
- Redirected to CommuterHomePage

Database Check:
- User table में नई entry
- role: "COMMUTER"
- email_verified: false → true (after verification)
```

**Test Case 1.4: Monthly Pass Purchase**
```
Steps:
1. Select a route
2. Click "Take Monthly Pass"
3. Choose Plan:
   - Full Month ₹5000
   - Weekdays Only ₹3500
   - Weekends Only ₹2000
4. Choose Payment Method:
   - Credit Card (Stripe)
   - Wallet
   - TAP Payment
5. Complete Payment

Expected Results:
- API Call: POST /bookings/b2c
- BookingModal shows payment form
- Payment processed successfully
- Booking status: "PENDING" → "CONFIRMED"
- Digital pass generated
- Email sent with booking details

Database Check:
- B2CPassengerBooking created
- status: "CONFIRMED"
- passengerId: userId
- routeId: selected route
- subscription_type: "FULL_MONTH" or "WEEKDAYS_ONLY" or "WEEKENDS_ONLY"
- payment_status: "SUCCESS"
```

**Test Case 1.5: Daily Travel - See Today's Trip**
```
Steps:
1. Open CommuterHomePage
2. Go to "My Bookings" or "Active Passes"
3. Click on today's trip

Expected Results:
- API Call: GET /bookings/passenger AND GET /bookings/:id/daily-trips
- Shows:
  - Today's schedule
  - Pickup location
  - Pickup time
  - Driver name & phone
  - Vehicle details (number plate, capacity)
  - Real-time bus location (GPS map)
  - Expected arrival time (ETA)

Real-time Updates:
- Socket.io: driver-location-:driverId
- Location updates every 10 seconds
- Map shows bus moving in real-time
```

**Test Case 1.6: No-Show Marking**
```
Steps:
1. In My Bookings, find today's trip
2. If not using today, click "Skip Today"

Expected Results:
- API Call: POST /bookings/:id/mark-no-show
- Seat becomes available for other commuters
- Record saved: user did not travel
- Affects commuter's reliability score

Database Check:
- Attendance marked: false
- no_show_count incremented
- daily_trip status: "NO_SHOW"
```

**Test Case 1.7: Rating Trip**
```
Steps:
1. After trip completes, modal appears
2. Rate driver (1-5 stars)
3. Rate vehicle cleanliness (1-5)
4. Rate route punctuality (1-5)
5. Optional feedback text
6. Submit

Expected Results:
- API Call: POST /trips/:id/ratings
- Rating saved in database
- Driver's average rating updated
- Notification sent to driver
- Shown on driver's profile

Database Check:
- Rating record created
- ratingValue: 1-5 average
- feedback: text
- driverId: updated average_rating
```

**Test Case 1.8: Monthly Renewal**
```
Steps:
1. Near month end, get notification
2. Open CommuterHomePage
3. See "Renew Your Pass" notification
4. Choose: Auto-renew, Manual renew, or Cancel

Expected Results (Auto-Renew):
- Cron job runs at midnight on renewal date
- API: POST /subscriptions/auto-renew
- Charge automatically processed
- New booking created for next month
- Email confirmation sent

Database Check:
- Subscription renewed
- New B2CPassengerBooking for next month
- Payment recorded in Transaction table
```

---

### 2️⃣ B2C_PARTNER Testing

**Test Case 2.1: Company Registration**
```
Steps:
1. Register page
2. Select: "I'm a Bus Operator"
3. Fill details:
   - Business name
   - Phone
   - Business address
   - Fleet size
   - Documents (RC, Insurance, etc.)
4. Submit for verification

Expected Results:
- API Call: POST /auth/register (role: B2C_PARTNER)
- User created with status: "PENDING_VERIFICATION"
- Documents uploaded to Vercel Blob
- ADMIN receives notification
- Email sent: "awaiting verification"

Database Check:
- User with role: B2C_PARTNER
- B2CPartnerProfile created
- verification_status: "PENDING"
- documents_path: stored in blob
```

**Test Case 2.2: Create First Route**
```
Steps:
1. Dashboard → Create Route
2. Fill form:
   - Route name: "Downtown Express"
   - From: Pick location
   - To: Destination
   - Route type: One-way or Round-trip
   - Total seats: 50
   - Schedule: Select days (Mon-Fri, Daily, Custom)
   - Start time: 8:00 AM
   - Add multiple pickup points with timings
3. Select Vehicle & Driver
4. Save

Expected Results:
- API Call: POST /b2c-trips/routes
- Route created in database
- Status: "ACTIVE"
- Trip records auto-generated for scheduled days
- Driver assigned and notified
- Notification to all subscribed COMMUTERs

Database Check:
- B2CPartnerRoute created
- partnerId: operator's ID
- stopPoints: [Point A 8:00, Point B 8:15, Final 8:45]
- schedule: recurring days
- totalSeats: 50
- driverId & vehicleId assigned
```

**Test Case 2.3: Manage Daily Trips**
```
Steps:
1. Dashboard → Today's Trips
2. See all trips for today
3. For each trip:
   - See booked seats vs available
   - Mark trip status: Started → In Progress → Completed
   - If passenger no-show, mark "No Show"

Expected Results:
- API Call: GET /b2c-trips/trips/today
- Shows all scheduled trips with:
  - Booked passengers (confirmed subscriptions)
  - Total capacity
  - Available seats
  - Route details
  - Assigned driver

Status Updates:
- API: PUT /b2c-trips/trips/:id/status
- Socket.io: Broadcast to all passengers
- Passengers see real-time trip status

Database Check:
- B2CPartnerTrip status updated
- attendance records created
```

**Test Case 2.4: Add Vehicle**
```
Steps:
1. Dashboard → Vehicles
2. Click "Add Vehicle"
3. Fill details:
   - Model: "Hyundai Isuzu Bus"
   - License Plate: "DXB-12345"
   - Total Capacity: 50 seats
   - AC/Non-AC: AC
   - Upload Documents (RC, Insurance, Fitness)
4. Save

Expected Results:
- API Call: POST /b2c-partner/vehicles
- Vehicle created and available for route assignment
- Documents stored in Vercel Blob
- Vehicle marked as "ACTIVE"

Database Check:
- B2CPartnerVehicle created
- vehicleNumber: "DXB-12345"
- totalCapacity: 50
- documents_path: blob path
- status: "ACTIVE"
```

**Test Case 2.5: Add Driver**
```
Steps:
1. Dashboard → Drivers
2. Click "Add Driver"
3. Fill form:
   - Name
   - Phone
   - License number
   - License expiry
   - Experience (years)
   - Upload Documents (DL, Police Clearance)
4. Save

Expected Results:
- API Call: POST /b2c-partner/drivers
- Driver created
- Status: "ACTIVE"
- Now available for route assignment
- Email sent to driver with login link

Database Check:
- B2CPartnerDriver created
- partnerId: operator's ID
- licenseNumber & validity stored
- documents_path: blob path
- status: "ACTIVE"
```

**Test Case 2.6: View Earnings**
```
Steps:
1. Dashboard → Earnings
2. See monthly earnings breakdown:
   - Total revenue
   - Per route breakdown
   - Number of active subscribers
   - Commission breakdown

Expected Results:
- API Call: GET /b2c-partner/earnings
- Shows:
  - This month's revenue
  - Total bookings
  - Average per route
  - Comparison with last month
  - Estimated next payment date

Calculation:
- Count: B2CPassengerBooking WHERE partnerId=X AND status="CONFIRMED"
- Revenue: Sum of all booking amounts
- Net: Revenue - 10% admin commission
- Payout: Via bank transfer every month

Database Check:
- Count B2CPassengerBooking records
- Calculate from pricing_applied × quantity
```

**Test Case 2.7: Route Requests → Create Route**
```
Steps:
1. Dashboard → Route Requests
2. See all COMMUTERs' route requests:
   - From-To location
   - How many people want it
   - Preferred days
3. Click "Create Route from Request"
4. Details auto-filled, add rest info, save

Expected Results:
- API Call: GET /requirements/open
- Shows open requirements
- API Call: POST /b2c-trips/routes/from-requirement
- New route created based on demand
- All requesters notified
- Route becomes active

Database Check:
- Requirement status: "OPEN" → "FULFILLED"
- New B2CPartnerRoute created with matching details
```

---

### 3️⃣ B2C_PARTNER_DRIVER Testing

**Test Case 3.1: Receive Invitation & Register**
```
Steps:
1. B2C_PARTNER adds driver in system
2. Driver receives email with signup link
3. Click link
4. Fill registration form:
   - Name (may be pre-filled)
   - License number
   - Experience
   - Documents
5. Verify email and complete

Expected Results:
- API Call: POST /b2c-partner/drivers/register
- Driver account created
- Role: "B2C_PARTNER_DRIVER"
- Linked to B2C_PARTNER
- Status: "ACTIVE" (if documents verified by partner)

Database Check:
- B2CPartnerDriver record created
- userId: driver's account
- partnerId: B2C_PARTNER's ID
```

**Test Case 3.2: View Today's Trips**
```
Steps:
1. Driver login to Dashboard
2. Go to "Today's Trips"
3. See all routes assigned by B2C_PARTNER

Expected Results:
- API Call: GET /b2c-trips/driver/daily-assignments
- Shows all trips for today:
  - Route name & details
  - Total passengers expected
  - Pickup points with times
  - Drop location
  - Status (Not Started, Started, Completed)

Database Check:
- B2CPartnerTrip records where:
  - driverId = logged-in driver
  - trip_date = today
```

**Test Case 3.3: Start Trip & Location Sharing**
```
Steps:
1. Pick up all passengers at scheduled time
2. When ready, click "Start Trip"
3. Location sharing automatically activates

Expected Results:
- API Call: POST /b2c-trips/trips/:id/start
- Trip status changes to "STARTED"
- GPS location sharing enabled
- Real-time location broadcasts to:
  - All passengers on this trip
  - B2C_PARTNER (monitoring)
- Location updates every 10 seconds

Real-time:
- Socket.io channel: driver-location-:driverId
- Emits: {latitude, longitude, timestamp}
- All subscribed clients receive updates

Database Check:
- B2CPartnerTrip status: "STARTED"
- start_time recorded
- driver_active: true
```

**Test Case 3.4: Complete Trip**
```
Steps:
1. Drop final passenger at destination
2. Click "Complete Trip"
3. Confirm passenger count

Expected Results:
- API Call: POST /b2c-trips/trips/:id/complete
- Trip status: "COMPLETED"
- Location sharing stopped
- Attendance auto-marked for all passengers
- Payment processed
- Passengers can now rate you

Database Check:
- B2CPartnerTrip status: "COMPLETED"
- end_time: current timestamp
- Attendance records created for all passengers
- Payment processed and recorded
```

**Test Case 3.5: View Ratings & Earnings**
```
Steps:
1. Dashboard → Ratings & Earnings
2. See:
   - Average rating (1-5)
   - Recent reviews
   - This month's earnings
   - Number of trips completed
   - Breakdown by route

Expected Results:
- API Call: GET /driver/ratings AND GET /driver/earnings
- Shows:
  - Current average rating
  - Recent feedback from passengers
  - Total earnings this month
  - Per-trip breakdown
  - Payment due date

Database Check:
- Average of Rating records for this driver
- Sum of trip payments
- Count of completed trips
```

---

### 4️⃣ CORPORATE Testing

**Test Case 4.1: Register Company**
```
Steps:
1. Register page
2. Select: "I'm a Company"
3. Fill:
   - Company name
   - Industry
   - Office addresses
   - Employee count
   - Tax ID/GST
   - HR manager details
   - Documents (Registration, GST, Office proof)
4. Submit

Expected Results:
- API Call: POST /auth/register (role: CORPORATE)
- Status: "PENDING_VERIFICATION"
- Documents uploaded to Vercel Blob
- ADMIN receives verification request
- Email: "awaiting verification"

Database Check:
- User with role: CORPORATE
- CorporateProfile created
- verification_status: "PENDING"
```

**Test Case 4.2: Post Transportation Requirement**
```
Steps:
1. Dashboard → Get Transportation
2. Click "Post Requirement"
3. Fill form:
   - How many employees
   - Locations (office to home/station)
   - Pickup times
   - Shift preferences
   - Special requirements
4. Submit

Expected Results:
- API Call: POST /requirements
- Status: "OPEN"
- All B2B_PARTNERs notified
- Email sent: "new requirement posted"

Database Check:
- CorporateRequirement created
- corporateId: company's ID
- status: "OPEN"
- requirement_details: locations, timings, employee count
```

**Test Case 4.3: Receive & Compare Quotes**
```
Steps:
1. See "Incoming Quotes" section
2. B2B_PARTNERs send quotes
3. Compare:
   - Price per employee
   - Vehicle type
   - Driver details
   - Service terms
   - Insurance coverage
4. View detailed proposal

Expected Results:
- API Call: GET /quotations
- Shows all quotes from interested B2B_PARTNERs
- Can expand each to see full details
- Comparison table available
- Can request clarifications

Database Check:
- Quotation records with status: "SENT"
- quotationFrom: B2B_PARTNER ID
- quotationTo: CORPORATE ID
- quotation_details: all terms
```

**Test Case 4.4: Accept Quote & Sign Contract**
```
Steps:
1. Choose best quote
2. Click "Accept Quote"
3. Review contract details
4. Digital signature (e-sign or checkbox)
5. Submit

Expected Results:
- API Call: POST /contracts
- Contract created
- Status: "ACCEPTED"
- Email sent to B2B_PARTNER: "contract accepted"
- Service start date scheduled
- Both parties get contract copy

Database Check:
- Contract created
- status: "ACCEPTED"
- start_date: service start
- both parties' IDs stored
```

**Test Case 4.5: Add Employees (Manual)**
```
Steps:
1. Dashboard → Manage Employees
2. Click "Add Employee"
3. Fill:
   - Employee ID
   - Name
   - Email
   - Department
   - Residential area
   - Assigned route
4. Send Invite

Expected Results:
- API Call: POST /corporate/employees
- Employee record created
- Status: "INVITED"
- Email sent to employee with signup link
- Employee can now sign up and start using transportation

Database Check:
- CorporateEmployee created
- corporateId: company's ID
- status: "INVITED"
- assigned_route_id: if applicable
```

**Test Case 4.6: Bulk Upload Employees**
```
Steps:
1. Dashboard → Manage Employees
2. Click "Bulk Upload"
3. Download CSV template
4. Fill with employee data:
   - Employee ID, Name, Email, Department, Area, Route
5. Upload CSV file

Expected Results:
- API Call: POST /corporate/employees/bulk
- All employees created at once
- Each receives invitation email
- Progress bar shows: "Processing X of Y"
- Confirmation: "X employees invited"

Database Check:
- Multiple CorporateEmployee records created
- All with status: "INVITED"
- All with same corporateId
```

**Test Case 4.7: View Daily Attendance**
```
Steps:
1. Dashboard → Reports → Today's Attendance
2. See:
   - Total employees in system
   - Who is traveling today
   - Who marked as present
   - Who didn't show up
   - Route-wise breakdown

Expected Results:
- API Call: GET /corporate/attendance
- Shows:
  - Real-time attendance dashboard
  - Live GPS tracking of buses
  - Expected vs actual pickup times
  - Attendance percentage

Database Check:
- Attendance records for today
- Linked to Trips and Employees
- Real-time updates via Socket.io
```

**Test Case 4.8: Monthly Billing & Payment**
```
Steps:
1. Dashboard → Billing
2. At month end, invoice auto-generates
3. Invoice shows:
   - Attendance days
   - Per-employee rate
   - Total charge
   - Any discounts
4. Pay online or wire transfer

Expected Results:
- API Call: GET /corporate/invoices
- Invoice PDF generated
- Payment gateway opens (Stripe/TAP)
- Payment success recorded
- Invoice marked as "PAID"
- B2B_PARTNER gets payment confirmation

Database Check:
- Invoice created
- amount: days × per_day_rate × employees
- status: "PENDING" → "PAID"
- Transaction record created
```

---

### 5️⃣ B2B_PARTNER Testing

**Test Case 5.1: Register Transportation Company**
```
Steps:
1. Register → "I'm a Transportation Company"
2. Fill:
   - Company name
   - Fleet size
   - Years in operation
   - HQ address
   - Authorized person
   - Documents (Reg, Insurance, GST)
3. Submit

Expected Results:
- API Call: POST /auth/register (role: B2B_PARTNER)
- Status: "PENDING_VERIFICATION"
- ADMIN reviews documents
- Email: "verification in progress"

Database Check:
- User with role: B2B_PARTNER
- B2BPartnerProfile created
- verification_status: "PENDING"
```

**Test Case 5.2: Receive Requirements & Create Quote**
```
Steps:
1. Dashboard → Incoming Requirements
2. See CORPORATE's requirements:
   - Location details
   - Employee count
   - Shift timings
   - Special requests
3. Click "Create Quote"
4. Fill pricing & terms:
   - Per-employee monthly rate
   - Vehicle type to use
   - Driver allocation
   - Service guarantees
   - Insurance details
5. Send Quote

Expected Results:
- API Call: POST /quotations
- Quote sent to CORPORATE
- Email: "new quote from vendor"
- Status: "SENT"
- CORPORATE can view and compare

Database Check:
- Quotation created
- quotationFrom: B2B_PARTNER ID
- quotationTo: CORPORATE ID
- quotation_details: pricing & terms
- status: "SENT"
```

**Test Case 5.3: Win Contract & Activate Service**
```
Steps:
1. When CORPORATE accepts quote
2. Contract automatically created
3. Start date arrives
4. Set up routes for first day

Expected Results:
- API Call: POST /contracts/:id/accept (from B2B side)
- Status: "ACTIVE"
- Start providing service from start_date
- Employees start receiving trip info
- Payment cycle begins

Database Check:
- Contract status: "ACTIVE"
- start_date: service started
- active_employees: count from CORPORATE side
```

**Test Case 5.4: Manage Fleet & Drivers**
```
Steps:
1. Dashboard → Fleet Management
2. Add vehicles:
   - Model, capacity, license plate
   - Upload insurance, RC, Fitness
3. Add drivers:
   - License, experience, documents
   - Training certificates

Expected Results:
- API Call: POST /b2b-partner/vehicles & /b2b-partner/drivers
- Vehicles & Drivers available for route assignment
- Documents stored in Blob
- Status: "ACTIVE"

Database Check:
- B2BPartnerVehicle & B2BPartnerDriver records created
- Ready for contract assignment
```

**Test Case 5.5: Daily Trip Management**
```
Steps:
1. Dashboard → Daily Trips
2. See all trips for contracted employees
3. For each trip:
   - Assign vehicle
   - Assign driver
   - Confirm passenger count
   - Start trip
   - Complete trip

Expected Results:
- API Call: GET /b2b-partner/trips/daily
- Shows all corporate routes for today
- Real-time tracking of driver location
- Attendance auto-marked
- Payment processing

Database Check:
- B2BPartnerTrip records
- vehicle_id & driver_id assigned
- Attendance records created
- Payment transaction recorded
```

**Test Case 5.6: View Reports & Analytics**
```
Steps:
1. Dashboard → Reports
2. See:
   - Daily attendance trends
   - Route efficiency
   - Vehicle utilization
   - Driver performance (ratings)
   - Monthly revenue

Expected Results:
- API Call: GET /b2b-partner/reports
- Comprehensive analytics dashboard
- Charts showing trends
- Export to PDF option

Database Check:
- Aggregate Trip, Attendance, Rating data
- Calculate efficiency metrics
```

**Test Case 5.7: Generate Monthly Invoice**
```
Steps:
1. Dashboard → Invoicing
2. Month end invoice auto-generates
3. Shows:
   - Days operated
   - Employees transported
   - Per-day rate
   - Total billable amount
4. Send to CORPORATE

Expected Results:
- API Call: GET /b2b-partner/invoices
- Invoice PDF created
- Sent to CORPORATE automatically
- Status: "SENT"
- Awaiting payment from CORPORATE

Database Check:
- Invoice created
- amount: active_days × per_day_rate × employees
- status: "SENT"
- email_sent: true
```

---

### 6️⃣ B2B_PARTNER_DRIVER Testing

**Test Case 6.1: Get Added to Fleet & Register**
```
Steps:
1. B2B_PARTNER adds driver to system
2. Driver receives email invitation
3. Fill signup form with:
   - License details
   - Experience
   - Documents
4. Verify & activate

Expected Results:
- B2BPartnerDriver record created
- Account activated
- Ready for trip assignments
- Receives dashboard access

Database Check:
- B2BPartnerDriver created
- partnerId: B2B_PARTNER's ID
- status: "ACTIVE"
```

**Test Case 6.2: View Assigned Routes & Employees**
```
Steps:
1. Login → Dashboard
2. See "My Assignment":
   - Corporate client details
   - Assigned route (from → to)
   - Total employees to transport
   - Working schedule
   - Shift timings

Expected Results:
- API Call: GET /b2b-driver/assignments
- Shows current contract details
- Employee list for today
- Route map

Database Check:
- B2BPartnerDriver linked to Contract
- Contract details display
```

**Test Case 6.3: Daily Trip Operations (Same as B2C_PARTNER_DRIVER)**
```
See Test Case 3.3 & 3.4 for identical flow:
- View today's trips
- Start trip (GPS enabled)
- Mark employee attendance
- Complete trip
- Attendance finalized
```

**Test Case 6.4: Monthly Payment & Performance Report**
```
Steps:
1. Dashboard → Salary & Performance
2. See:
   - Days worked
   - Salary amount
   - Deductions
   - Performance rating
   - Attendance accuracy
3. Salary auto-transferred to bank

Expected Results:
- API Call: GET /b2b-driver/monthly-statement
- Salary statement generated
- Paid via bank transfer
- Performance metrics shown

Database Check:
- Payment record created
- Salary calculated from days worked
- Deductions applied
- Bank transfer initiated
```

---

### 7️⃣ CORPORATE_EMPLOYEE Testing

**Test Case 7.1: Receive Invitation & Register**
```
Steps:
1. CORPORATE adds employee
2. Employee receives email with signup link
3. Click link
4. Fill form:
   - Name
   - Employee ID
   - Password
   - Residential address
5. Verify email

Expected Results:
- API Call: POST /corporate-employees/register
- Account created
- Role: "CORPORATE_EMPLOYEE"
- Auto-assigned to route
- Receives access to app

Database Check:
- CorporateEmployee record created
- corporateId: company's ID
- assigned_route_id: pre-set by HR
- status: "ACTIVE"
```

**Test Case 7.2: View Route & Driver Info**
```
Steps:
1. Login → Dashboard
2. Click "My Transportation"
3. See:
   - Route details (from → to)
   - Pickup location & time
   - Drop location
   - Driver name & photo
   - Vehicle details
   - Estimated pickup ETA

Expected Results:
- API Call: GET /corporate-employee/today-trip
- Full trip information displayed
- Driver contact available
- Map showing pickup location

Database Check:
- EmployeeRoute linked to employee
- Route details fetched
- Driver details populated
```

**Test Case 7.3: Live Tracking**
```
Steps:
1. Go to "Today's Trip"
2. See live map of bus location
3. Location updates in real-time

Expected Results:
- Socket.io: driver-location-:driverId
- Real-time GPS broadcasts
- Map shows bus moving
- ETA updates as bus moves
- Notification: "Bus arriving in X minutes"

Real-time:
- New location every 10 seconds
- Distance to pickup shows
- Estimated arrival time updates
```

**Test Case 7.4: Rate Trip & Driver**
```
Steps:
1. After trip completes
2. Modal: "Rate Your Trip"
3. Rate:
   - Driver (1-5 stars)
   - Vehicle cleanliness
   - Route punctuality
   - Behavior/Courtesy
4. Optional feedback
5. Submit

Expected Results:
- API Call: POST /trips/:id/ratings
- Rating saved
- Driver gets notification
- Shown in driver's profile
- Affects driver's overall rating

Database Check:
- Rating record created
- driverId average_rating updated
- feedback stored for driver
```

**Test Case 7.5: View Travel History**
```
Steps:
1. Dashboard → Travel History
2. See all previous trips:
   - Dates
   - Routes
   - Drivers
   - Ratings given
   - Duration

Expected Results:
- API Call: GET /corporate-employee/travel-history
- All past trips listed
- With dates and details
- Sortable by date

Database Check:
- Attendance records for employee
- Linked Trip information
- Historical data preserved
```

---

### 8️⃣ CORPORATE_DRIVER Testing

**Test Case 8.1: Register as Company Driver**
```
Same as test 6.1 but:
- Role: CORPORATE_DRIVER
- Hired by: CORPORATE (not B2B_PARTNER)
- Direct employee relationship

Database Check:
- CorporateDriver record created
- corporateId: direct company ID
- status: "ACTIVE"
```

**Test Case 8.2: Fixed Route Assignment**
```
Steps:
1. CORPORATE assigns driver to route
2. Driver sees assigned route
3. Driver views:
   - Same route every day
   - List of employees to pick up
   - Pickup and drop locations

Expected Results:
- API Call: GET /corporate-driver/assignment
- Fixed route displayed
- Employee list for route
- Shift timing

Database Check:
- CorporateDriver.assigned_route_id set
- EmployeeRoute records show this driver
```

**Test Case 8.3: Daily Operations**
```
Same as B2C/B2B driver:
- View today's trip
- Start trip (GPS enabled)
- Pick up employees (mark attendance)
- Complete trip

Database Check:
- Trip created
- Attendance marked for each employee
- GPS locations recorded
```

**Test Case 8.4: Salary Payment**
```
Steps:
1. Month end
2. Dashboard → Payroll
3. See:
   - Salary amount
   - Days worked
   - Any deductions
4. Salary transferred

Expected Results:
- CORPORATE pays fixed salary
- Not per-trip based
- Paid monthly via bank transfer

Database Check:
- Payroll record created
- salary_amount set
- payment_status: "COMPLETED"
```

---

### 9️⃣ ADMIN Testing

**Test Case 9.1: User Verification**
```
Steps:
1. Admin Dashboard → Pending Verifications
2. See list of:
   - B2C_PARTNERs
   - B2B_PARTNERs
   - CORPORATEs
   - All with documents
3. Review documents
4. Click "Verify" or "Reject"

Expected Results:
- API Call: POST /admin/users/:id/verify
- User status: "PENDING_VERIFICATION" → "VERIFIED"
- Email sent: "Your account is now active"
- Or email sent: "Verification failed, resubmit"

Database Check:
- User.verification_status updated
- verification_date recorded
- admin_id: who verified
```

**Test Case 9.2: Route Management & Suspension**
```
Steps:
1. Admin Dashboard → Routes
2. See all B2C/B2B routes
3. For problematic routes:
   - Click "View Details"
   - Check complaints/ratings
   - Click "Suspend Route"
   - Reason & duration

Expected Results:
- API Call: POST /admin/routes/:id/suspend
- Route marked as suspended
- No new bookings possible
- Existing passengers notified
- B2C_PARTNER gets alert
- Support contacted immediately

Database Check:
- B2CPartnerRoute.status: "SUSPENDED"
- suspension_reason stored
- suspension_end_date set
```

**Test Case 9.3: Complaint Management**
```
Steps:
1. Admin Dashboard → Complaints
2. See all complaints:
   - From COMMUTERs, EMPLOYEEs, etc.
   - Against drivers, routes, partners
3. For each complaint:
   - Mark priority
   - Assign to support team
   - Set deadline
4. Follow up on resolution

Expected Results:
- API Call: GET /admin/complaints
- Filter by type, status, priority
- Reassign to support staff
- Track resolution

Database Check:
- Complaint records
- status: "OPEN" → "ASSIGNED" → "RESOLVED"
- admin_id: who handled
- resolution_date
```

**Test Case 9.4: Financial Reports**
```
Steps:
1. Admin Dashboard → Financial Reports
2. See:
   - Total revenue
   - Platform commission
   - Partner payouts
   - Payment status (who paid, who didn't)
   - Monthly trends

Expected Results:
- API Call: GET /admin/financial-reports
- Comprehensive financial dashboard
- Export to Excel
- Payment tracking

Database Check:
- Aggregate Transaction, Invoice, Booking data
- Calculate total revenue & commission
- Show payment status
```

**Test Case 9.5: Contract Dispute Resolution**
```
Steps:
1. Admin Dashboard → Disputes
2. See disputes between:
   - CORPORATE vs B2B_PARTNER
   - Payment disagreements
   - Service issues
3. Review both sides' claims
4. Issue ruling:
   - Full refund, partial, none
   - Contract termination or continuation
5. Implement decision

Expected Results:
- API Call: POST /admin/disputes/:id/resolve
- Decision recorded
- Refund processed if needed
- Both parties notified
- Contract updated

Database Check:
- Dispute record created
- resolution_decision stored
- Transaction/Refund processed
```

---

## 🔄 Cross-System Integration Tests

### Payment Gateway Testing
```
Test: Complete Payment Flow

Stripe:
1. Enter card details
2. Payment processes
3. Success: Booking confirmed
4. Webhook: Backend receives confirmation
5. Database: Transaction recorded

TAP (Middle East):
1. TAP gateway opens
2. Payment via TAP
3. Success confirmation
4. Webhook: Backend updated
5. Database: Transaction recorded

Wallet:
1. Deduct from wallet balance
2. Update wallet.balance
3. Transaction logged
4. Can refund back to wallet
```

### Real-Time Location Testing
```
Test: GPS Tracking

Setup:
1. Driver starts trip
2. GPS enabled
3. Location captured every 10 seconds

Verify:
- Socket.io broadcasts working
- All passengers receive updates
- Maps shows accurate location
- Distance calculation correct
- ETA updates as driver moves

Database:
- DriverLocation table has entries
- Timestamps accurate
- Coordinates match vehicle position
```

### Notification Testing
```
Test: All Notification Types

1. Email Notifications:
   - Registration confirmation
   - Booking confirmation
   - Invoice sent
   - Payment received
   - Support tickets

2. Push Notifications:
   - Booking updates
   - Trip status changes
   - Driver location (every 2 min)
   - Payment reminders
   - Complaint updates

3. In-App Notifications:
   - Unread count badge
   - Notification dropdown
   - Mark as read
```

---

## ✅ Final Verification Checklist

Before declaring production ready:

```
FUNCTIONALITY:
✓ All 9 user roles can register and login
✓ All role-specific features work
✓ API endpoints return correct responses
✓ Database operations save/retrieve correctly
✓ Real-time updates work via Socket.io
✓ Payments process successfully
✓ Emails send correctly
✓ File uploads to Blob storage
✓ Cron jobs run on schedule
✓ Location tracking works in real-time

SECURITY:
✓ JWT tokens working
✓ Role-based access control enforced
✓ Sensitive data encrypted
✓ API endpoints properly authenticated
✓ SQL injection prevented (parameterized queries)
✓ XSS protection enabled
✓ CORS configured correctly
✓ Password hashing (bcrypt)
✓ Rate limiting on APIs
✓ File upload validation

PERFORMANCE:
✓ Page load time < 3 seconds
✓ API response time < 500ms
✓ Database queries optimized
✓ Image optimization done
✓ Caching implemented
✓ No memory leaks
✓ Handles concurrent users
✓ Socket.io broadcasts smooth

UI/UX:
✓ All pages render correctly
✓ Responsive design works
✓ All buttons clickable
✓ Forms validate input
✓ Error messages helpful
✓ Loading states shown
✓ Mobile experience optimized
✓ Accessibility compliance
✓ No console errors

TESTING:
✓ Unit tests passing
✓ Integration tests passing
✓ End-to-end tests passing
✓ Manual testing completed
✓ Load testing done
✓ Security testing done
✓ Cross-browser testing done
```

---

**अंतिम नोट**: यह comprehensive testing guide सभी scenarios cover करता है। Production में जाने से पहले यह सभी tests run करें।
