# COMPLETE APPLICATION FLOW - ALL 9 USER ROLES
# Drive Me - Transportation Management Platform
# (ENGLISH + HINDI)

---

## TABLE OF CONTENTS
1. Registration & Login (All Users)
2. COMMUTER Flow (Normal Passenger)
3. B2C_PARTNER Flow (Bus Operator / Service Provider)
4. B2C_PARTNER_DRIVER Flow
5. CORPORATE Flow (Company HR/Transport Manager)
6. B2B_PARTNER Flow (Fleet/Transportation Company)
7. B2B_PARTNER_DRIVER Flow
8. CORPORATE_EMPLOYEE Flow (Company Staff Passenger)
9. CORPORATE_DRIVER Flow
10. ADMIN Flow (Platform Admin)
11. Complete End-to-End Flows (How Users Connect)

---

# ============================================================
# SECTION 0: REGISTRATION & LOGIN (ALL USERS)
# ============================================================

## ENGLISH:

### Registration (URL: /register)
1. Open the website. You land on the HomePage (/).
2. Click "Register" link in the Navbar (top-right).
3. You reach the Register page (/register).
4. You see 5 role options to choose from:
   - COMMUTER (Normal Passenger)
   - CORPORATE (Company HR/Transport Manager)
   - B2C_PARTNER (Bus Operator / Individual Service Provider)
   - B2B_PARTNER (Fleet / Transportation Company)
   - CORPORATE_EMPLOYEE (Company Staff Passenger)
5. Select your role by clicking on the role card.
6. Fill the form:
   - Full Name
   - Email
   - Phone Number
   - Password
   - Confirm Password
   - (For CORPORATE: Company Name, Company Address, Tax ID)
   - (For B2B_PARTNER: Company Name, Fleet Size)
   - (For CORPORATE_EMPLOYEE: Company Code/Email - to link with the corporate)
7. Click "Register" button.
8. API Call: POST /api/auth/register
9. OTP Verification screen appears. Enter OTP sent to your email.
10. API Call: POST /api/auth/verify-otp
11. On success, you are logged in and redirected to / (HomePage).
12. The HomePage detects your role and shows the correct dashboard.

NOTE: Drivers (B2C_PARTNER_DRIVER, B2B_PARTNER_DRIVER, CORPORATE_DRIVER) are NOT registered from the Register page. They are created by their respective partner/corporate from their fleet management panel.

### Login (URL: /login)
1. Click "Login" link in the Navbar.
2. You reach the Login page (/login).
3. Enter Email and Password.
4. Click "Login" button.
5. API Call: POST /api/auth/login
6. On success, token is stored in localStorage, user data goes to Redux store.
7. You are redirected to / (HomePage).
8. HomePage detects your role and renders:
   - COMMUTER -> CommuterHomePage (search routes)
   - B2C_PARTNER -> B2C_PartnerProfilePage (partner dashboard)
   - B2B_PARTNER -> B2B_PartnerProfilePage (fleet dashboard)
   - CORPORATE -> ServiceSelection (search vehicles)
   - CORPORATE_EMPLOYEE -> EmployeeTripBooking
   - B2C_PARTNER_DRIVER -> B2CPartnerDriverDashboard
   - B2B_PARTNER_DRIVER -> B2BPartnerDriverDashboard
   - CORPORATE_DRIVER -> CorporateDriverDashboard
   - ADMIN -> AdminDashboardPage

### Admin Login (URL: /admin-login)
1. Go to /admin-login directly (or enter admin credentials on /login which auto-redirects).
2. Enter admin email and password.
3. API Call: POST /api/auth/admin-login
4. Redirected to /admin-dashboard.

## HINDI:

### Registration (URL: /register)
1. Website kholo. Aap HomePage (/) par aoge.
2. Navbar (upar right side) me "Register" link par click karo.
3. Register page (/register) par pahunch jaoge.
4. 5 role options dikhenge:
   - COMMUTER (Normal Passenger)
   - CORPORATE (Company HR/Transport Manager)
   - B2C_PARTNER (Bus Operator / Individual Service Provider)
   - B2B_PARTNER (Fleet / Transportation Company)
   - CORPORATE_EMPLOYEE (Company Staff Passenger)
5. Apna role select karo card par click karke.
6. Form fill karo:
   - Full Name
   - Email
   - Phone Number
   - Password
   - Confirm Password
   - (CORPORATE ke liye: Company Name, Company Address, Tax ID)
   - (B2B_PARTNER ke liye: Company Name, Fleet Size)
   - (CORPORATE_EMPLOYEE ke liye: Company Code/Email - corporate se link karne ke liye)
7. "Register" button click karo.
8. API Call: POST /api/auth/register
9. OTP Verification screen aayegi. Email par aaya OTP enter karo.
10. API Call: POST /api/auth/verify-otp
11. Success hone par login ho jaoge aur / (HomePage) par redirect ho jaoge.
12. HomePage aapka role detect karke sahi dashboard dikhayega.

NOTE: Drivers (B2C_PARTNER_DRIVER, B2B_PARTNER_DRIVER, CORPORATE_DRIVER) Register page se register NAHI hote. Unhe unke respective partner/corporate apne fleet management panel se create karte hain.

### Login (URL: /login)
1. Navbar me "Login" link click karo.
2. Login page (/login) par pahuncho.
3. Email aur Password enter karo.
4. "Login" button click karo.
5. API Call: POST /api/auth/login
6. Success par token localStorage me store hota hai, user data Redux store me jaata hai.
7. / (HomePage) par redirect hote ho.
8. HomePage role detect karke dikhata hai - (upar English me detail di hai).

---

# ============================================================
# SECTION 1: COMMUTER (Normal Passenger) FLOW
# ============================================================

## ENGLISH:

### After Login -> HomePage (/) shows CommuterHomePage

### Step 1: Search & Discover Routes
- Page: CommuterHomePage (rendered inside HomePage for COMMUTER role)
- You see a search form with:
  - Pick-up Location (text input)
  - Destination (text input)
  - Travel Date
  - "Search Routes" button
- Click "Search Routes"
- API Call: GET /api/commute/search?from=...&to=...&date=...
- Results show available B2C routes with: route name, pickup/drop points, time, price, seats available

### Step 2A: If Route IS Available
- You see route cards with details (bus type, price per month, pickup points, schedule)
- Click "View Details" on a route -> see full route info
- Click "Book Now" / "Subscribe"
- API Call: POST /api/b2c-bookings/create (creates a booking/subscription)
- Payment flow: Stripe/Tap payment gateway opens
- API Call: POST /api/payments/create-checkout-session
- After payment -> redirected to /payment/callback
- API Call: POST /api/payments/verify
- Booking confirmed! Digital pass issued.

### Step 2B: If Route NOT Available
- Message shows: "No active routes found for your search"
- You see "Request This Route" button
- Click it -> form opens (from location, to location, preferred time)
- API Call: POST /api/route-requests
- Request submitted! B2C_PARTNERS will see this demand.

### Step 3: Go to Profile Dashboard
- Click your profile icon / "My Profile" in Navbar
- Redirected to /commuter-profile
- Page: CommuterProfilePage with sidebar tabs:

#### Tab: "My Rides" (default)
- Component: CommuterMyBookingsPage
- Shows all your bookings (active, upcoming, completed, cancelled)
- API Call: GET /api/b2c-bookings/my-bookings
- Each booking shows: route, date, time, status, bus details
- Active bookings have real-time tracking - "Track Bus" button
  - API Call: GET /api/driver-location/:driverId
  - Socket.io: join room `track-driver-{driverId}` for live location updates
- Can cancel booking: Click "Cancel" -> API Call: POST /api/b2c-bookings/:id/cancel
- Polling: Bookings refresh every 30 seconds automatically

#### Tab: "Find Routes"
- Component: FindRoutes
- Search for B2C routes from the profile page
- Same search functionality as CommuterHomePage
- API Call: GET /api/commute/search

#### Tab: "Wallet"
- Component: Wallet
- Shows wallet balance, transaction history
- API Call: GET /api/wallet/balance
- Add Funds: Click "Add Funds" -> enters amount -> Stripe/Tap checkout
  - API Call: POST /api/wallet/add-funds
- Withdraw: Click "Withdraw" -> enters amount -> API Call: POST /api/wallet/withdraw
- Transaction History: API Call: GET /api/wallet/transactions

#### Tab: "Travel History"
- Component: TravelHistory
- Shows all past completed rides
- API Call: GET /api/travel-history/

#### Tab: "Subscription Settings"
- Component: SubscriptionSettings
- Shows active monthly subscriptions (B2C monthly passes)
- API Call: GET /api/subscription-settings
- Can renew, cancel, or modify subscription
- "Renew" button -> API Call: POST /api/subscription-settings/renew
- "Cancel" button -> API Call: POST /api/subscription-settings/cancel

#### Tab: "Alerts"
- Component: Alerts
- Shows notifications (trip reminders, booking confirmations, promotions)
- API Call: GET /api/notifications/user/:userId

#### Tab: "Settings"
- Component: Settings
- Update profile info (name, phone, email)
- API Call: PUT /api/users/profile
- Change password: API Call: PUT /api/users/change-password

### Step 4: Daily Travel
- You get notification reminders 30 min before pickup
- Open "My Rides" tab -> see active trip -> click "Track Bus" for real-time location
- If not traveling today: Click "No Show" on your booking
  - API Call: POST /api/no-shows
  - Seat freed for that day

### Step 5: Renewal / Cancel
- Go to "Subscription Settings" tab
- Monthly pass shows renewal date
- Click "Auto-Renew" to enable auto renewal
- Click "Cancel" to cancel next month
- API Call: POST /api/subscription-settings/renew or /cancel

---

## HINDI:

### Login ke baad -> HomePage (/) CommuterHomePage dikhata hai

### Step 1: Route Search Karo
- Page: CommuterHomePage
- Search form me:
  - Pick-up Location (kaha se)
  - Destination (kaha tak)
  - Travel Date
  - "Search Routes" button
- "Search Routes" click karo
- API Call: GET /api/commute/search?from=...&to=...&date=...
- Results me available B2C routes dikhenge: route name, pickup/drop points, time, price, seats

### Step 2A: Agar Route Available Hai
- Route cards me details dikhti hain (bus type, monthly price, pickup points, schedule)
- "View Details" click karo -> full route info
- "Book Now" / "Subscribe" click karo
- API Call: POST /api/b2c-bookings/create
- Payment: Stripe/Tap payment gateway khulta hai
- Payment ke baad -> /payment/callback par redirect
- Booking confirm! Digital pass milta hai.

### Step 2B: Agar Route Available NAHI Hai
- Message: "No active routes found for your search"
- "Request This Route" button click karo
- Form fill karo (from, to, preferred time)
- API Call: POST /api/route-requests
- Request submit! B2C_PARTNERS ko demand dikhai degi.

### Step 3: Profile Dashboard Par Jao
- Navbar me profile icon / "My Profile" click karo
- /commuter-profile par redirect

#### Tab: "My Rides" (default)
- Saari bookings dikhti hain (active, upcoming, completed, cancelled)
- API Call: GET /api/b2c-bookings/my-bookings
- Active booking me "Track Bus" button -> bus ki real-time location
- "Cancel" button se booking cancel
- Har 30 second me bookings auto-refresh

#### Tab: "Find Routes" - Route search
#### Tab: "Wallet" - Wallet balance, add funds, withdraw, transactions
#### Tab: "Travel History" - Past completed rides
#### Tab: "Subscription Settings" - Monthly pass renew/cancel
#### Tab: "Alerts" - Notifications
#### Tab: "Settings" - Profile update, password change

### Step 4: Daily Travel
- 30 min pehle notification
- "My Rides" me active trip -> "Track Bus" se real-time location
- Aaj nahi ja rahe? "No Show" click karo -> seat free

### Step 5: Renewal / Cancel
- "Subscription Settings" tab me monthly pass dikhai dega
- "Auto-Renew" ya "Cancel" click karo

---

# ============================================================
# SECTION 2: B2C_PARTNER (Bus Operator / Service Provider) FLOW
# ============================================================

## ENGLISH:

### After Login -> HomePage (/) shows B2C_PartnerProfilePage

### Dashboard URL: / (HomePage renders B2C_PartnerProfilePage)
### Also accessible at: /b2c-partner-profile

### Dashboard has these tabs in B2C_Navigation:

#### Tab: "Overview" (default)
- Component: B2CPartnerOverview
- Shows summary cards: Total Routes, Active Subscribers, Monthly Revenue, Pending Bookings
- API Call: GET /api/b2c-partner/dashboard
- Quick stats for the partner

#### Tab: "Trips" 
- Component: B2C_PartnerBookingsPage
- Shows all bookings for this partner's routes
- API Call: GET /api/b2c-bookings/partner-bookings
- Each booking shows: passenger name, route, date, status
- Partner can Accept/Reject bookings:
  - Accept: API Call: PUT /api/b2c-bookings/:id/accept
  - Reject: API Call: PUT /api/b2c-bookings/:id/reject

#### Tab: "Daily Trips"
- Component: B2CDailyTrips
- Shows today's trips auto-generated from route schedules
- API Call: GET /api/b2c-trips/partner-trips
- Each trip: route name, departure time, booked seats, available seats
- Mark trip as: "Started" -> "Completed" -> "Cancelled"
  - API Call: PUT /api/b2c-trips/:id/start
  - API Call: PUT /api/b2c-trips/:id/complete
  - API Call: PUT /api/b2c-trips/:id/cancel
- Update available seats for non-subscribers:
  - API Call: PUT /api/b2c-trips/:id/update-seats

#### Tab: "Earnings"
- Component: Earnings
- Shows revenue data: total earnings, monthly breakdown, per-route earnings
- API Call: GET /api/b2c-partner/earnings

#### Tab: "Vehicles" (Fleet & Drivers Management) -- IMPORTANT
- Component: B2C_FleetAndDrivers
- **Add Vehicle:**
  - Click "Add Vehicle" button
  - Fill form: Vehicle Number, Type, Capacity, Documents
  - API Call: POST /api/b2c-partner/vehicles
  - Vehicle added to fleet
- **View Vehicles:** List of all vehicles with status
  - API Call: GET /api/b2c-partner/vehicles
- **Add Driver (B2C_PARTNER_DRIVER):**
  - Click "Add Driver" button
  - Fill form: Driver Name, Email, Phone, License Number, Password
  - API Call: POST /api/b2c-partner/drivers
  - THIS CREATES A B2C_PARTNER_DRIVER USER IN THE SYSTEM!
  - Driver can now login with those credentials
- **View Drivers:** List of all drivers
  - API Call: GET /api/b2c-partner/drivers
- **Assign Driver to Vehicle:**
  - Select vehicle -> Click "Assign Driver" -> Select driver from dropdown
  - API Call: PUT /api/b2c-partner/vehicles/:vehicleId/assign-driver
- **Assign Driver to Route:**
  - Select driver -> Assign to specific route
  - API Call: POST /api/b2c-partner/assign-driver-route

#### Tab: "Routes" -- IMPORTANT (Flow Step 2)
- Component: B2C_Routes
- **Create New Route:**
  - Click "Create New Route" button
  - Fill form:
    - Route Name (e.g., "Downtown Express")
    - From Location (starting point)
    - To Location (ending point)
    - Pickup Points (multiple stops with times)
    - Drop-off Points
    - Trip Type: One-Way or Round Trip
    - Schedule: Mon-Fri, Daily, Custom days
    - Total Seats Available
    - Monthly Subscription Price
    - Plan Variants (Full Month, Weekdays Only, etc.)
  - API Call: POST /api/b2c-partner/routes
  - Route created! Commuters can now find it.
- **View All Routes:**
  - API Call: GET /api/b2c-partner/routes
  - Each route shows: name, from->to, schedule, subscribers count, revenue
- **Edit Route:**
  - Click route -> Edit details
  - API Call: PUT /api/b2c-partner/routes/:routeId
- **Delete Route:**
  - API Call: DELETE /api/b2c-partner/routes/:routeId

#### Tab: "Route Requests"
- Component: B2CRouteRequests
- Shows requests from commuters who searched for routes that don't exist yet
- API Call: GET /api/route-requests
- Partner can see demand and create new routes based on requests

#### Tab: "Account"
- Component: Account
- Update profile, business info
- API Call: PUT /api/users/profile

---

## HINDI:

### Login ke baad -> HomePage (/) B2C_PartnerProfilePage dikhata hai

### Dashboard Tabs:

#### Tab: "Overview" (default) - Summary cards (Total Routes, Subscribers, Revenue)
#### Tab: "Trips" - Sabhi bookings, Accept/Reject karo
#### Tab: "Daily Trips" - Aaj ki trips, Start/Complete/Cancel karo
#### Tab: "Earnings" - Revenue data, monthly breakdown
#### Tab: "Vehicles" (Fleet & Drivers) -- BAHUT IMPORTANT
- "Add Vehicle" -> Vehicle details fill karo -> POST /api/b2c-partner/vehicles
- "Add Driver" -> Driver details fill karo -> POST /api/b2c-partner/drivers
  - YE B2C_PARTNER_DRIVER USER CREATE KARTA HAI!
  - Driver ab inn credentials se login kar sakta hai
- Vehicle me driver assign karo: PUT /api/b2c-partner/vehicles/:id/assign-driver
- Driver ko route assign karo: POST /api/b2c-partner/assign-driver-route

#### Tab: "Routes" -- BAHUT IMPORTANT
- "Create New Route" -> Form:
  - Route Name, From, To, Pickup Points, Drop Points
  - Trip Type (One-Way/Round), Schedule, Seats, Monthly Price
  - POST /api/b2c-partner/routes
  - Route ban gaya! Ab commuters ise search kar sakte hain.
- Sabhi routes dekho: GET /api/b2c-partner/routes
- Edit/Delete route bhi kar sakte ho

#### Tab: "Route Requests" - Commuters ki route demands dekho
#### Tab: "Account" - Profile update

---

# ============================================================
# SECTION 3: B2C_PARTNER_DRIVER FLOW
# ============================================================

## ENGLISH:

### How Driver Account is Created:
- B2C_PARTNER creates the driver from their "Vehicles" tab -> "Add Driver" button
- Driver receives credentials (email + password)
- Driver logs in at /login with those credentials

### After Login -> HomePage (/) shows B2CPartnerDriverDashboard
### Also accessible at: /driver/b2c-dashboard

### Dashboard has these main tabs:

#### Tab: "Bookings" (default)
- Shows assigned bookings for this driver
- API Call: GET /api/bookings/driver (Redux: getPartnerDriverBookings)
- Filter by status: ACCEPTED, PENDING, COMPLETED
- Each booking: passenger name, route, pickup/drop, time
- **Accept Booking:** Click "Accept" -> API Call: PUT /api/bookings/:id/accept (Redux: acceptBooking)
- **Reject Booking:** Click "Reject" -> enter reason -> API Call: PUT /api/bookings/:id/reject (Redux: rejectBooking)
- **Complete Booking:** After ride done -> Click "Complete" -> API Call: PUT /api/bookings/:id/complete (Redux: completeBooking)

#### Tab: "Daily Trips"
- Component: DailyTripsInBooking
- Shows today's scheduled trips
- API Call: GET /api/b2c-trips/driver-trips
- **Start Trip:** Click "Start Trip" -> API Call: PUT /api/b2c-trips/:id/start (Redux: startB2CTrip)
  - Location sharing starts automatically via Socket.io
  - Socket: emit `driver-location-update` with GPS coordinates
- **Complete Trip:** Click "Complete Trip" -> API Call: PUT /api/b2c-trips/:id/complete (Redux: completeB2CTrip)
  - Location sharing stops

#### Tab: "Location Sharing"
- Toggle "Share My Location" switch
- Uses browser Geolocation API
- GPS coordinates sent every 10 seconds:
  - API Call: POST /api/driver-location/update
  - Socket.io: emit `driver-location-update` { lat, lng, driverId }
- Passengers tracking the bus receive live updates
- Stop sharing: Toggle switch off, or navigate to /driver/location-tracking page

#### Logout: Click "Log Out" button in header

---

## HINDI:

### Driver Account Kaise Banta Hai:
- B2C_PARTNER apne "Vehicles" tab me "Add Driver" se driver create karta hai
- Driver ko credentials milte hain (email + password)
- Driver /login par login karta hai

### Login ke baad -> HomePage (/) B2CPartnerDriverDashboard dikhata hai

### Dashboard Tabs:

#### Tab: "Bookings" (default)
- Assigned bookings dikhti hain
- Accept/Reject/Complete actions
- Accept: passenger ki booking confirm
- Reject: reason deke reject
- Complete: ride khatam hone par

#### Tab: "Daily Trips"
- Aaj ki scheduled trips
- "Start Trip" -> trip shuru, location sharing auto start, Socket.io se live GPS
- "Complete Trip" -> trip khatam, location sharing band

#### Tab: "Location Sharing"
- Switch on -> GPS location har 10 second me backend ko bhejta hai
- Passengers ko real-time bus location dikhti hai
- Switch off -> band

---

# ============================================================
# SECTION 4: CORPORATE (Company HR/Transport Manager) FLOW
# ============================================================

## ENGLISH:

### After Login -> HomePage (/) shows ServiceSelection page

### Phase 1: Search for B2B Transportation Providers

#### ServiceSelection Page (URL: / for CORPORATE role, or /corporate)
- Corporate manager sees search form:
  - Vehicle Type (Bus, Mini Bus, etc.)
  - Number of Vehicles needed
  - Service Duration (Monthly, Quarterly)
  - Pickup Locations
  - Drop Locations
- Click "Search"
- API Call: GET /api/corporate-operations/search
- Redirected to /search-results (SearchResults page)

#### SearchResults Page (URL: /search-results)
- Shows matching B2B_PARTNER fleet owners
- Each result: Company name, vehicle types, capacity, ratings, price range
- Click "View Fleet Owner" -> /fleet-portfolio/:id

#### FleetOwnerPortfolio Page (URL: /fleet-portfolio/:id)
- Full portfolio of B2B_PARTNER: company info, vehicles, certifications
- API Call: GET /api/corporate-operations/fleet-owner/:id
- Click on specific vehicle -> /vehicle/:id (VehicleDetails page)

#### VehicleDetails Page (URL: /vehicle/:id)
- Vehicle details: type, capacity, features, price, photos
- API Call: GET /api/corporate-operations/vehicle/:id

#### SingleVehicleOwnerDetails Page (URL: /view-single-vehicle-owner)
- View complete details of a specific fleet owner
- API Call: GET /api/corporate-operations/fleet-owner/:id

### Phase 2: Send Quotation Request

- From VehicleDetails or FleetOwnerPortfolio page:
- Click "Request Quote" button
- Fill form:
  - Number of vehicles needed
  - Duration (months)
  - Pickup/Drop locations
  - Shift timings
  - Special requirements (AC, WiFi, etc.)
- API Call: POST /api/quotations
- Quotation sent to B2B_PARTNER!

### Phase 3: View & Manage Quotations

#### My Quotations Page (URL: /my-quotations)
- API Call: GET /api/quotations/my-quotations
- Shows all sent quotation requests and their status (PENDING, RESPONDED, ACCEPTED, REJECTED)
- Click on a quotation -> /quotation/:id

#### Quotation Details Page (URL: /quotation/:id)
- Full quotation details: your request + B2B_PARTNER's response (pricing, terms)
- API Call: GET /api/quotations/:id
- If B2B_PARTNER has responded:
  - Click "Accept Quotation" -> API Call: PUT /api/quotations/:id/accept
  - This creates a CONTRACT automatically!
  - Click "Reject Quotation" -> API Call: PUT /api/quotations/:id/reject
  - Click "Negotiate" -> API Call: PUT /api/quotations/:id/negotiate (send counter-offer)

### Phase 4: Contract Management

#### Corporate Contracts Page (URL: /corporate/contracts)
- API Call: GET /api/contracts/corporate-contracts
- Shows all contracts: ACTIVE, PENDING, EXPIRED, CANCELLED
- Click on contract -> /corporate/contracts/:id

#### Contract Details Page (URL: /corporate/contracts/:id)
- API Call: GET /api/contracts/:id
- Full contract: B2B_PARTNER details, vehicles assigned, routes, pricing, duration
- "Accept Contract" -> API Call: PUT /api/contracts/:id/accept
- "Reject Contract" -> API Call: PUT /api/contracts/:id/reject
- View assigned vehicles: Link to /corporate/assigned-vehicles

#### Assigned Vehicles Page (URL: /corporate/assigned-vehicles)
- API Call: GET /api/contracts/corporate/assigned-vehicles
- Shows vehicles that B2B_PARTNER has assigned to your contracts
- Each vehicle: type, number plate, driver name, route, schedule

### Phase 5: Employee Management (CorporateProfilePage)

#### Go to /corporate-profile
#### Dashboard has these tabs:

#### Tab: "Company Profile" (default)
- Component: CompanyProfile
- Shows company info, address, tax details
- API Call: GET /api/users/me
- Edit: API Call: PUT /api/users/profile

#### Tab: "Contracts"
- Component: CorporateContractPage (same as /corporate/contracts)
- View all contracts inline

#### Tab: "Employee Management" -- VERY IMPORTANT
- Component: CorporateEmployeeManagement
- **Upload Employees (CSV):**
  - Click "Upload CSV" button
  - Upload CSV file with employee data (name, email, phone, department)
  - API Call: POST /api/corporate-employees/upload-csv
  - Employees added to system in bulk!
- **Add Employee Manually:**
  - Click "Add Employee" button
  - Fill form: Name, Email, Phone, Department, Address
  - API Call: POST /api/corporate-employees/bulk-upload
- **View All Employees:**
  - API Call: GET /api/corporate-employees
  - Table with: Name, Email, Department, Status, Assigned Route
- **Assign Route to Employee:**
  - Click employee -> "Assign Route" button
  - Select route from dropdown (routes come from: GET /api/corporate-employees/routes)
  - Enter pickup/drop locations
  - API Call: PUT /api/corporate-employees/:id/assign-route
- **Send Invitations:**
  - Select employees -> Click "Send Invitations"
  - API Call: POST /api/corporate-employees/send-invitations
  - Employees receive email invitation to register as CORPORATE_EMPLOYEE
- **Deactivate Employee:**
  - Click "Deactivate" -> API Call: PUT /api/corporate-employees/:id/deactivate
- **Delete Employee:**
  - Click "Delete" -> API Call: DELETE /api/corporate-employees/:id
- **Approve Employee Registration:**
  - When employee registers, manager sees pending approval
  - API Call: POST /api/corporate-employees/approve/:id

#### Tab: "Employee Bookings"
- Component: CorporateEmployeeBookingsPage
- Shows all bookings made by your employees
- API Call: GET /api/corporate-operations/bookings
- Track which employees are traveling, which are absent

#### Tab: "Requirements"
- Component: RequirementManagement
- Create new transport requirements for B2B partners
- API Call: POST /api/requirements
- View existing: GET /api/requirements/corporate

#### Tab: "Billing"
- Component: CorporateBilling
- Monthly invoices, payment history
- API Call: GET /api/corporate/billing-report
- Invoice list: GET /api/corporate/invoices

#### Tab: "Account Settings"
- Component: AccountSettings
- Update company info, change password
- API Call: PUT /api/users/profile

### Stats Cards (Top of Dashboard):
- Active Contracts count
- Total Employees count
- Active Routes count
- API Call: GET /api/corporate/stats

### Employee Feedback Summary:
- Click "Employee Feedback Summary" button
- API Call: GET /api/corporate-employees/feedback-summary
- Shows: Average Rating, Total Feedbacks, Rating Distribution, Recent Feedbacks

---

## HINDI:

### Login ke baad -> HomePage (/) ServiceSelection dikhata hai

### Phase 1: B2B Transport Providers Search Karo
- ServiceSelection page par vehicle type, kitni vehicles chahiye, duration, locations fill karo
- "Search" click karo -> GET /api/corporate-operations/search
- /search-results par matching B2B fleet owners dikhenge
- Fleet owner click karo -> /fleet-portfolio/:id -> vehicles dekho
- Vehicle click karo -> /vehicle/:id -> full details

### Phase 2: Quotation Bhejo
- Vehicle/Fleet page se "Request Quote" click karo
- Form fill karo (vehicles, duration, locations, timings, requirements)
- POST /api/quotations -> Quote B2B_PARTNER ko bheji gayi!

### Phase 3: Quotations Manage Karo
- /my-quotations par jao -> GET /api/quotations/my-quotations
- Quotation click karo -> /quotation/:id
- B2B_PARTNER ne respond kiya? -> "Accept" ya "Reject" ya "Negotiate"
- Accept karne par CONTRACT automatically ban jaata hai!

### Phase 4: Contracts Manage Karo
- /corporate/contracts par jao -> GET /api/contracts/corporate-contracts
- Contract click karo -> details dekho -> Accept/Reject
- /corporate/assigned-vehicles par assigned vehicles dekho

### Phase 5: Employees Manage Karo (/corporate-profile)
- "Employee Management" tab:
  - CSV upload se employees add karo
  - Manually bhi add karo
  - Route assign karo har employee ko
  - "Send Invitations" -> employees ko email jaayega register karne ke liye
  - Approve/Deactivate/Delete employees
- "Employee Bookings" tab: employees ki bookings dekho
- "Requirements" tab: naye transport requirements create karo
- "Billing" tab: invoices aur payment history
- Stats: Active Contracts, Total Employees, Active Routes
- Employee Feedback Summary: ratings aur feedback dekho

---

# ============================================================
# SECTION 5: B2B_PARTNER (Fleet/Transportation Company) FLOW
# ============================================================

## ENGLISH:

### After Login -> HomePage (/) shows B2B_PartnerProfilePage
### Also accessible at: /b2b-partner-profile

### Dashboard Tabs:

#### Tab: "Overview" (default)
- Component: B2B_Overview
- Summary: Total Vehicles, Active Contracts, Monthly Revenue, Pending Requirements
- API Call: GET /api/b2b-partner/dashboard

#### Tab: "Fleet" (Fleet & Drivers Management) -- IMPORTANT
- Component: B2B_FleetAndDrivers
- **Add Vehicle:**
  - Click "Add Vehicle" button
  - Fill: Vehicle Number, Type (Bus/Mini Bus/Sedan), Capacity, Registration, Insurance
  - API Call: POST /api/b2b-partner/vehicles
- **View Vehicles:**
  - API Call: GET /api/b2b-partner/vehicles
  - Each vehicle: number, type, capacity, status, assigned driver, assigned contract
- **Add Driver (B2B_PARTNER_DRIVER):**
  - Click "Add Driver" button
  - Fill: Name, Email, Phone, License Number, Password
  - API Call: POST /api/b2b-partner/drivers
  - THIS CREATES A B2B_PARTNER_DRIVER USER!
  - Driver can now login with those credentials
- **View Drivers:**
  - API Call: GET /api/b2b-partner/drivers
- **Assign Driver to Vehicle:**
  - API Call: PUT /api/b2b-partner/vehicles/:id/assign-driver

#### Tab: "Contracts" -- IMPORTANT
- Component: B2B_PartnerContractPage
- API Call: GET /api/contracts/b2b-contracts
- Shows all contracts with corporate clients: ACTIVE, PENDING, DRAFT, EXPIRED
- Click contract -> /b2b-partner/contracts/:id (B2B_PartnerContractDetails)
  - Full contract details, corporate client info, vehicles, pricing
  - API Call: GET /api/contracts/:id

#### Tab: "My Quotation" -- IMPORTANT
- Component: B2B_Quotation
- Shows quotation requests from CORPORATE managers
- API Call: GET /api/quotations/b2b-quotations
- Each quotation: corporate company name, requirements, vehicles needed
- **Respond to Quotation:**
  - Click "Respond" -> Fill pricing, terms, vehicle assignment
  - API Call: PUT /api/quotations/:id/respond
  - Corporate will see your response and can accept/reject

#### Tab: "Requirements"
- Component: RequirementsView
- Shows transport requirements posted by CORPORATE clients
- API Call: GET /api/requirements/b2b
- Can see demand and prepare proposals

#### Tab: "Analytics"
- Component: B2B_Analytics
- Revenue charts, fleet utilization, contract performance
- API Call: GET /api/b2b-partner/analytics

#### Tab: "Invoices"
- Component: B2B_Invoices
- Monthly invoices for corporate clients
- API Call: GET /api/b2b-partner/invoices

#### Tab: "Settings"
- Component: B2B_Settings
- Update company profile, business info
- API Call: PUT /api/users/profile

### Vehicle Assignment to Contracts (Separate Pages):

#### URL: /b2b-partner/vehicle-assignment (B2B_PartnerAssignmentUI)
- Assign vehicles to specific contracts
- API Call: GET /api/vehicle-assignments/b2b-partner
- API Call: POST /api/vehicle-assignments

#### URL: /b2b-partner/vehicle-assignmentlist (B2B_PartnerVehicleAssignmentList)
- View all vehicle assignments
- API Call: GET /api/vehicle-assignments/b2b-partner

#### URL: /b2b-partner/vehicle-assignmentform (B2B_PartnerVehicleAssignmentForm)
- Form to create new vehicle assignment
- Select contract, vehicle, driver, route, schedule
- API Call: POST /api/vehicle-assignments

---

## HINDI:

### Login ke baad -> HomePage (/) B2B_PartnerProfilePage dikhata hai

### Dashboard Tabs:

#### Tab: "Overview" - Summary (Vehicles, Contracts, Revenue)
#### Tab: "Fleet" -- BAHUT IMPORTANT
- "Add Vehicle" -> vehicle details -> POST /api/b2b-partner/vehicles
- "Add Driver" -> driver details -> POST /api/b2b-partner/drivers
  - YE B2B_PARTNER_DRIVER USER CREATE KARTA HAI!
- Driver ko vehicle assign karo: PUT /api/b2b-partner/vehicles/:id/assign-driver

#### Tab: "Contracts" -- IMPORTANT
- Sabhi corporate contracts -> GET /api/contracts/b2b-contracts
- Contract click karo -> /b2b-partner/contracts/:id -> details

#### Tab: "My Quotation" -- IMPORTANT
- Corporate managers ki quotation requests
- "Respond" -> pricing, terms bhejo -> PUT /api/quotations/:id/respond
- Corporate accept karega to CONTRACT ban jayega!

#### Tab: "Requirements" - Corporate clients ki demands
#### Tab: "Analytics" - Revenue charts, fleet utilization
#### Tab: "Invoices" - Monthly invoices
#### Tab: "Settings" - Profile update

### Vehicle Assignment:
- /b2b-partner/vehicle-assignment -> vehicles ko contracts me assign karo
- /b2b-partner/vehicle-assignmentform -> form se assignment create karo

---

# ============================================================
# SECTION 6: B2B_PARTNER_DRIVER FLOW
# ============================================================

## ENGLISH:

### How Account is Created:
- B2B_PARTNER creates driver from "Fleet" tab -> "Add Driver" button
- Driver receives credentials (email + password)
- Driver logs in at /login

### After Login -> HomePage (/) shows B2BPartnerDriverDashboard
### Also accessible at: /driver/b2b-dashboard

### Dashboard Tabs:

#### Tab: "Bookings" (default)
- Shows corporate employee bookings assigned to this driver
- API Call: GET /api/b2b-operations/driver-bookings
- Filter: confirmed, in_progress, completed
- Each booking: employee name, route, pickup/drop time, vehicle
- **Start Trip:** API Call: PUT /api/b2b-operations/start-trip/:bookingId
  - Location sharing auto-starts via Socket.io
- **Complete Trip:** API Call: PUT /api/b2b-operations/complete-trip/:bookingId
  - Location sharing stops

#### Tab: "Location Sharing"
- Toggle switch to share/stop GPS location
- Uses browser Geolocation API
- POST /api/driver-location/update (every 10 seconds)
- Socket.io: emit `driver-location-update` { lat, lng, driverId, driverType: "B2B" }
- Corporate employees can track the vehicle

#### Tab: "Notifications"
- Shows trip assignments, schedule changes
- Socket.io: listen for `new-booking-assigned`, `trip-cancelled`

#### Logout: "Log Out" button

---

## HINDI:

### Account Kaise Banta Hai:
- B2B_PARTNER "Fleet" tab me "Add Driver" se create karta hai
- Driver ko email + password milte hain -> /login par login

### Login ke baad -> B2BPartnerDriverDashboard

#### Tab: "Bookings" - Corporate employees ki assigned bookings
- Start Trip -> location sharing shuru
- Complete Trip -> trip khatam
#### Tab: "Location Sharing" - GPS toggle
#### Tab: "Notifications" - Trip assignments, changes
#### Logout button

---

# ============================================================
# SECTION 7: CORPORATE_EMPLOYEE (Company Staff Passenger) FLOW
# ============================================================

## ENGLISH:

### How Account is Created:
1. CORPORATE manager adds employee via "Employee Management" tab (CSV upload or manual)
2. Manager clicks "Send Invitations" -> employee receives email
3. Employee goes to /register -> selects CORPORATE_EMPLOYEE role
4. Enters company code/email -> registers
5. Manager approves from "Employee Management" tab

### After Login -> HomePage (/) shows EmployeeTripBooking component
### Full Dashboard at: /employee-dashboard (EmployeeDashboard page)

### EmployeeDashboard Tabs:

#### Tab: "Trip Info" (default)
- Shows assigned route, pickup/drop times, vehicle details, driver contact
- API Call: GET /api/corporate-employee-users/route
- Shows:
  - Route name & stops
  - Pickup time & location
  - Vehicle number & type
  - Driver name & phone
- **"Not Traveling Today" button:**
  - API Call: POST /api/corporate-employee-users/not-traveling-today
  - Marks absent for the day, seat freed

#### Tab: "My Bookings"
- Shows upcoming and active bookings
- API Call: GET /api/corporate-employee-users/dashboard
- Each booking: route, date, time, vehicle, status
- **Cancel Booking:**
  - API Call: POST /api/corporate-employee-users/booking { action: "cancel", bookingId }
- **Track Vehicle:** Real-time location of assigned vehicle
  - API Call: GET /api/driver-location/:driverId
  - Socket.io: join `track-driver-{driverId}`

#### Tab: "Travel History"
- Past completed trips
- API Call: GET /api/corporate-employee-users/dashboard (travelHistory field)
- Each trip: date, route, pickup/drop times, driver

#### Tab: "Rate & Feedback"
- Rate your trip (1-5 stars)
- Write feedback about driver, punctuality, cleanliness
- API Call: POST /api/corporate-employee-users/rate-trip { tripId, rating, feedback }
- Corporate manager sees this in "Employee Feedback Summary"

#### Tab: "Route Change Request"
- Request a different route/pickup point
- Fill form: reason, preferred route
- API Call: POST /api/corporate-employee-users/request-route-change
- Goes to Corporate manager for approval

#### Tab: "Notifications"
- Shows trip reminders, schedule changes, corporate announcements
- API Call: GET /api/notifications/user/:userId

#### Wallet Access: /wallet (shared wallet system)
- API Call: GET /api/wallet/balance

---

## HINDI:

### Account Kaise Banta Hai:
1. CORPORATE manager "Employee Management" tab se employee add karta hai (CSV ya manual)
2. "Send Invitations" -> employee ko email jaata hai
3. Employee /register par jaake CORPORATE_EMPLOYEE select karke register karta hai
4. Manager approve karta hai

### Login ke baad -> HomePage (/) EmployeeTripBooking dikhata hai
### Full Dashboard: /employee-dashboard

#### Tab: "Trip Info" - Assigned route, timings, vehicle, driver details
- "Not Traveling Today" -> aaj absent mark karo
#### Tab: "My Bookings" - Bookings, cancel, track vehicle
#### Tab: "Travel History" - Past rides
#### Tab: "Rate & Feedback" - Trip rate karo (1-5 stars), feedback likho
  - Corporate manager ko dikhai dega "Employee Feedback Summary" me
#### Tab: "Route Change Request" - Route change request bhejo
#### Tab: "Notifications" - Reminders, changes
#### Wallet: /wallet par jaake wallet access

---

# ============================================================
# SECTION 8: CORPORATE_DRIVER FLOW
# ============================================================

## ENGLISH:

### How Account is Created:
- Created by CORPORATE or B2B_PARTNER from fleet management
- Gets credentials (email + password)
- Logs in at /login

### After Login -> HomePage (/) shows CorporateDriverDashboard
### Also accessible at: /driver/corporate-dashboard

### Dashboard Tabs:

#### Tab: "Bookings" (default)
- Shows corporate employee bookings assigned to this driver
- API Call: GET /api/b2b-operations/driver-bookings (same as B2B driver)
- Filter: confirmed, in_progress, completed
- **Start Trip:** API Call: PUT /api/b2b-operations/start-trip/:bookingId
  - Location sharing auto-starts
- **Complete Trip:** API Call: PUT /api/b2b-operations/complete-trip/:bookingId

#### Tab: "Location Sharing"
- Same as B2B driver - GPS toggle
- POST /api/driver-location/update
- Socket.io: emit `driver-location-update` { driverType: "CORPORATE" }

#### Tab: "Notifications"
- Trip assignments, schedule updates
- Socket.io listeners

#### Logout: "Log Out" button

---

## HINDI:

### Account CORPORATE ya B2B_PARTNER se banta hai
### Login ke baad -> CorporateDriverDashboard
#### Tab: "Bookings" - Corporate employee trips, Start/Complete
#### Tab: "Location Sharing" - GPS toggle
#### Tab: "Notifications"

---

# ============================================================
# SECTION 9: ADMIN FLOW
# ============================================================

## ENGLISH:

### Login: /admin-login (AdminLoginPage)
- Enter admin email + password
- API Call: POST /api/auth/admin-login
- Redirected to /admin-dashboard

### AdminDashboardPage (URL: /admin-dashboard)

### Dashboard Tabs:

#### Tab: "Overview" (default)
- Component: AdminOverview
- Platform-wide stats: Total Users, Active Bookings, Revenue, Active Routes
- API Call: GET /api/admin/dashboard-stats
- Charts: user growth, revenue trends, booking volume

#### Tab: "B2C Management"
- Component: AdminB2CManagement
- Manage all B2C_PARTNERS: view list, approve/suspend
- API Call: GET /api/admin/b2c-partners
- View routes, bookings for each partner
- Approve new partner: PUT /api/admin/approve-partner/:id
- Suspend partner: PUT /api/admin/suspend-partner/:id

#### Tab: "Ride Pooling"
- Component: AdminRidePooling
- Monitor B2C ride pooling activity
- API Call: GET /api/admin/ride-pooling

#### Tab: "B2B Management"
- Component: AdminB2BListings
- Manage all B2B_PARTNERS: view fleet, contracts
- API Call: GET /api/admin/b2b-partners
- View contracts between B2B and Corporate
- Approve/suspend B2B partners

#### Tab: "Users"
- Component: AdminUsers
- View ALL users in system (all 9 roles)
- API Call: GET /api/admin/users
- Search, filter by role
- View user details, edit, deactivate
- API Call: PUT /api/admin/users/:id
- Delete user: DELETE /api/admin/users/:id

#### Tab: "Reports"
- Component: AdminReports
- Generate reports: revenue, utilization, user activity
- API Call: GET /api/admin/reports
- Download reports as PDF/CSV

#### Tab: "Finance"
- Component: AdminFinance
- Platform revenue, payment tracking, commission management
- API Call: GET /api/admin/finance

#### Tab: "Communications"
- Component: AdminComm
- Send notifications/announcements to users
- API Call: POST /api/admin/send-notification
- View notification history

#### Tab: "Ads"
- Component: AdminAds
- Manage advertisements on platform
- API Call: GET /api/admin/ads

#### Tab: "Payment Verification"
- Component: PaymentVerification
- Verify pending payments from users
- API Call: GET /api/admin/pending-payments
- Approve: PUT /api/admin/verify-payment/:id
- Reject: PUT /api/admin/reject-payment/:id

#### Tab: "Vehicle Approval"
- Component: AdminVehicleApproval
- Approve vehicles added by B2C/B2B partners
- API Call: GET /api/admin/vehicle-approvals
- Approve: PUT /api/admin/approve-vehicle/:id

#### Tab: "Settlement"
- Component: AdminSettlement
- Manage partner settlements and payouts
- API Call: GET /api/settlements
- Process settlement: POST /api/settlements/process

### Logout: "Log Out" button -> POST /api/auth/logout -> redirected to /admin-login

---

## HINDI:

### Login: /admin-login
- Admin email + password -> POST /api/auth/admin-login
- /admin-dashboard par redirect

### Dashboard Tabs:

#### Tab: "Overview" - Platform stats (Users, Bookings, Revenue, Routes)
#### Tab: "B2C Management" - B2C Partners manage (approve/suspend)
#### Tab: "Ride Pooling" - B2C ride pooling monitor
#### Tab: "B2B Management" - B2B Partners manage (fleet, contracts)
#### Tab: "Users" - Sabhi users (all 9 roles), search, filter, edit, delete
#### Tab: "Reports" - Revenue, utilization reports, download PDF/CSV
#### Tab: "Finance" - Revenue, payments, commission
#### Tab: "Communications" - Notifications/announcements bhejo
#### Tab: "Ads" - Advertisements manage
#### Tab: "Payment Verification" - Pending payments verify karo (approve/reject)
#### Tab: "Vehicle Approval" - Partners ke vehicles approve karo
#### Tab: "Settlement" - Partner payouts process karo
#### Logout -> /admin-login

---

# ============================================================
# SECTION 10: COMPLETE END-TO-END FLOWS
# ============================================================

## FLOW A: B2C Model (B2C_PARTNER -> COMMUTER -> B2C_PARTNER_DRIVER)

### ENGLISH:

**Step 1: B2C_PARTNER registers and sets up**
1. Partner registers at /register -> selects B2C_PARTNER
2. Logs in -> lands on B2C_PartnerProfilePage
3. Goes to "Vehicles" tab -> adds vehicle (POST /api/b2c-partner/vehicles)
4. Adds driver from "Vehicles" tab -> "Add Driver" (POST /api/b2c-partner/drivers) [B2C_PARTNER_DRIVER created]
5. Assigns driver to vehicle
6. Goes to "Routes" tab -> "Create New Route" -> fills route details (POST /api/b2c-partner/routes)
7. Sets monthly subscription price
8. Route is now LIVE and searchable!

**Step 2: COMMUTER searches and books**
1. Commuter registers at /register -> selects COMMUTER
2. Logs in -> lands on CommuterHomePage
3. Enters pickup, destination, date -> "Search Routes"
4. Sees the B2C_PARTNER's route in results
5. Clicks "Book Now" -> payment flow -> booking confirmed
6. Goes to /commuter-profile -> "My Rides" tab -> sees booking
7. On travel day: opens "My Rides" -> "Track Bus" for live location

**Step 3: B2C_PARTNER_DRIVER operates**
1. Driver logs in with credentials given by partner
2. Lands on B2CPartnerDriverDashboard
3. Sees assigned bookings in "Bookings" tab
4. Clicks "Accept" on booking
5. On trip day: goes to "Daily Trips" tab -> "Start Trip"
6. Location sharing starts -> commuter can track live
7. After ride: "Complete Trip"
8. Partner sees completed trip in "Trips" tab

**Step 4: B2C_PARTNER monitors**
1. Partner checks "Overview" -> updated stats
2. "Trips" tab -> sees booking status (accepted/completed)
3. "Earnings" tab -> sees revenue from the booking
4. "Route Requests" tab -> sees new route demands from commuters

---

### HINDI:

**Step 1: B2C_PARTNER register aur setup karta hai**
1. /register par register -> B2C_PARTNER select
2. Login -> B2C_PartnerProfilePage
3. "Vehicles" tab -> vehicle add karo
4. "Vehicles" tab -> "Add Driver" -> driver add karo [B2C_PARTNER_DRIVER ban gaya]
5. Driver ko vehicle assign karo
6. "Routes" tab -> "Create New Route" -> route details fill karo
7. Monthly subscription price set karo
8. Route ab LIVE hai, search me aayega!

**Step 2: COMMUTER search aur book karta hai**
1. /register par register -> COMMUTER select
2. Login -> CommuterHomePage
3. Pickup, destination, date enter -> "Search Routes"
4. B2C_PARTNER ka route dikhta hai
5. "Book Now" -> payment -> booking confirmed
6. /commuter-profile -> "My Rides" -> booking dikhti hai
7. Travel day: "Track Bus" -> live location

**Step 3: B2C_PARTNER_DRIVER operate karta hai**
1. Partner se mile credentials se login
2. B2CPartnerDriverDashboard
3. "Bookings" me assigned bookings -> "Accept"
4. Trip day: "Daily Trips" -> "Start Trip" -> location sharing shuru
5. Commuter track kar sakta hai
6. Ride khatam -> "Complete Trip"

**Step 4: B2C_PARTNER monitor karta hai**
1. "Overview" -> updated stats
2. "Trips" -> booking status
3. "Earnings" -> revenue
4. "Route Requests" -> naye demands

---

## FLOW B: B2B/Corporate Model (B2B_PARTNER <-> CORPORATE <-> CORPORATE_EMPLOYEE <-> B2B_PARTNER_DRIVER)

### ENGLISH:

**Step 1: B2B_PARTNER sets up fleet**
1. B2B Partner registers -> selects B2B_PARTNER
2. Login -> B2B_PartnerProfilePage
3. "Fleet" tab -> adds vehicles (buses, mini buses)
4. "Fleet" tab -> "Add Driver" creates B2B_PARTNER_DRIVER
5. Assigns drivers to vehicles
6. Fleet is ready!

**Step 2: CORPORATE searches and sends quotation**
1. Corporate registers -> selects CORPORATE
2. Login -> ServiceSelection page
3. Searches for vehicles (type, quantity, duration)
4. Browses B2B fleet owners in /search-results
5. Views fleet portfolio -> selects vehicles
6. Clicks "Request Quote" -> fills requirements
7. POST /api/quotations -> quotation sent to B2B_PARTNER!

**Step 3: B2B_PARTNER responds to quotation**
1. B2B Partner sees quotation in "My Quotation" tab
2. Reviews requirements
3. Clicks "Respond" -> sends pricing and terms
4. PUT /api/quotations/:id/respond

**Step 4: CORPORATE accepts quotation -> Contract created**
1. Corporate goes to /my-quotations -> sees B2B response
2. Opens quotation details -> reviews pricing
3. Clicks "Accept Quotation" -> PUT /api/quotations/:id/accept
4. CONTRACT automatically created!
5. Visible in /corporate/contracts

**Step 5: B2B_PARTNER assigns vehicles to contract**
1. B2B Partner sees contract in "Contracts" tab
2. Goes to /b2b-partner/vehicle-assignmentform
3. Selects contract -> assigns specific vehicles + drivers
4. POST /api/vehicle-assignments
5. Corporate can see assigned vehicles at /corporate/assigned-vehicles

**Step 6: CORPORATE adds employees**
1. Corporate goes to /corporate-profile -> "Employee Management" tab
2. Uploads CSV of employees -> POST /api/corporate-employees/upload-csv
3. Assigns routes to employees -> PUT /api/corporate-employees/:id/assign-route
4. Sends invitations -> POST /api/corporate-employees/send-invitations
5. Employees receive email with registration link

**Step 7: CORPORATE_EMPLOYEE registers and travels**
1. Employee opens /register -> selects CORPORATE_EMPLOYEE
2. Registers with company email
3. Corporate manager approves
4. Employee goes to /employee-dashboard
5. "Trip Info" tab -> sees assigned route, vehicle, driver
6. On travel day: gets notification -> boards vehicle
7. Can track vehicle location in "My Bookings" tab
8. If absent: clicks "Not Traveling Today"
9. After ride: rates trip in "Rate & Feedback" tab

**Step 8: B2B_PARTNER_DRIVER operates**
1. Driver logs in with credentials from B2B Partner
2. Sees bookings in "Bookings" tab
3. "Start Trip" -> GPS location sharing begins
4. Employees can track live location
5. "Complete Trip" -> trip finished

**Step 9: CORPORATE monitors**
1. "Employee Bookings" tab -> all employee trips
2. "Employee Feedback Summary" -> ratings from employees
3. "Billing" tab -> monthly invoices
4. Reports for HR: attendance, utilization

**Step 10: B2B_PARTNER invoices**
1. "Analytics" tab -> revenue and utilization data
2. "Invoices" tab -> generate monthly invoice for corporate
3. Contract renewal discussions

---

### HINDI:

**Step 1: B2B_PARTNER fleet setup**
1. Register -> B2B_PARTNER select
2. Login -> "Fleet" tab -> vehicles add karo
3. "Add Driver" -> B2B_PARTNER_DRIVER ban gaya
4. Drivers ko vehicles assign karo

**Step 2: CORPORATE search aur quotation bhejta hai**
1. Register -> CORPORATE select
2. Login -> ServiceSelection -> vehicles search karo
3. B2B fleet owners browse karo
4. "Request Quote" -> requirements bhejo
5. Quotation B2B_PARTNER ko gayi!

**Step 3: B2B_PARTNER quotation respond karta hai**
1. "My Quotation" tab me quotation dikhti hai
2. "Respond" -> pricing aur terms bhejo

**Step 4: CORPORATE accept karta hai -> CONTRACT banta hai**
1. /my-quotations -> B2B ka response dekho
2. "Accept Quotation" -> CONTRACT automatically ban gaya!
3. /corporate/contracts me dikhega

**Step 5: B2B_PARTNER vehicles assign karta hai contract me**
1. "Contracts" tab me contract dekho
2. /b2b-partner/vehicle-assignmentform -> vehicles + drivers assign karo
3. Corporate /corporate/assigned-vehicles par dekh sakta hai

**Step 6: CORPORATE employees add karta hai**
1. /corporate-profile -> "Employee Management" tab
2. CSV upload ya manual add
3. Har employee ko route assign karo
4. "Send Invitations" -> employees ko email jaayega

**Step 7: CORPORATE_EMPLOYEE register aur travel karta hai**
1. /register -> CORPORATE_EMPLOYEE select -> register
2. Manager approve karta hai
3. /employee-dashboard -> assigned route, vehicle, driver dekho
4. Travel day: notification -> board vehicle -> track location
5. Absent? "Not Traveling Today" click karo
6. Ride ke baad: rate karo, feedback do

**Step 8: B2B_PARTNER_DRIVER operate karta hai**
1. Login -> bookings dekho -> "Start Trip" -> location sharing
2. Employees track kar sakte hain -> "Complete Trip"

**Step 9: CORPORATE monitor karta hai**
1. "Employee Bookings" -> sabhi trips
2. "Employee Feedback Summary" -> ratings
3. "Billing" -> invoices
4. Reports: attendance, utilization

**Step 10: B2B_PARTNER invoicing**
1. "Analytics" -> revenue
2. "Invoices" -> monthly invoices
3. Contract renewal

---

# ============================================================
# SECTION 11: QUICK REFERENCE - ALL URLS & WHAT TO TEST
# ============================================================

| URL | Role | What to Test |
|-----|------|-------------|
| / | ALL | HomePage - renders role-specific dashboard |
| /register | PUBLIC | Registration with 5 roles |
| /login | PUBLIC | Login with email/password |
| /admin-login | PUBLIC | Admin login |
| /commuter-profile | COMMUTER | My Rides, Find Routes, Wallet, Travel History, Subscription, Alerts, Settings |
| /commuter/mybookings | COMMUTER | Direct bookings page |
| /wallet | COMMUTER, B2C, B2B, EMPLOYEE | Wallet - balance, add funds, withdraw, transactions |
| /wallet/payment/verify | Same | Wallet payment callback |
| /b2c-partner-profile | B2C_PARTNER | Overview, Trips, Daily Trips, Earnings, Vehicles, Routes, Route Requests, Account |
| /b2c-partner/bookings | B2C_PARTNER | Direct bookings page |
| /b2b-partner-profile | B2B_PARTNER | Overview, Fleet, Contracts, Quotations, Requirements, Analytics, Invoices, Settings |
| /b2b-partner/contracts | B2B_PARTNER | Direct contracts page |
| /b2b-partner/contracts/:id | B2B_PARTNER | Contract details |
| /b2b-partner/vehicle-assignment | B2B_PARTNER | Assign vehicles to contracts |
| /b2b-partner/vehicle-assignmentlist | B2B_PARTNER | View all assignments |
| /b2b-partner/vehicle-assignmentform | B2B_PARTNER | Create new assignment |
| /corporate-profile | CORPORATE | Company Profile, Contracts, Employee Mgmt, Bookings, Requirements, Billing, Settings |
| /corporate | CORPORATE | ServiceSelection search |
| /search-results | CORPORATE | B2B fleet owner search results |
| /fleet-portfolio/:id | CORPORATE | Fleet owner portfolio |
| /vehicle/:id | CORPORATE | Vehicle details |
| /view-single-vehicle-owner | CORPORATE | Vehicle owner details |
| /my-quotations | CORPORATE | All quotation requests |
| /quotation/:id | CORPORATE | Quotation details + accept/reject |
| /corporate/contracts | CORPORATE | All contracts |
| /corporate/contracts/:id | CORPORATE | Contract details |
| /corporate/assigned-vehicles | CORPORATE | Vehicles assigned by B2B |
| /corporate/bookings | CORPORATE | Employee bookings |
| /corporate/employee-management | CORPORATE | Employee management direct page |
| /employee-dashboard | CORPORATE_EMPLOYEE | Trip Info, Bookings, History, Feedback, Route Change, Notifications |
| /driver/b2c-dashboard | B2C_PARTNER_DRIVER | Bookings, Daily Trips, Location Sharing |
| /driver/b2b-dashboard | B2B_PARTNER_DRIVER | Bookings, Location Sharing, Notifications |
| /driver/corporate-dashboard | CORPORATE_DRIVER | Bookings, Location Sharing, Notifications |
| /driver/location-tracking | ALL DRIVERS | Dedicated location tracking page |
| /admin-dashboard | ADMIN | Overview, B2C, Ride Pool, B2B, Users, Reports, Finance, Comm, Ads, Payment Verify, Vehicle Approve, Settlement |
| /payment/callback | ALL | Payment verification callback |
