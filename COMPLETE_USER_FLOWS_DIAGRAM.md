# DriveMe Platform - Complete User Flows Diagram

## सभी 9 User Roles का एक दूसरे से संबंध (Inter-relationships)

```
┌─────────────────────────────────────────────────────────────────┐
│                        DRIVEME PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║               1. COMMUTER (यात्री)                       ║ │
│  ║  • Finds routes on homepage                             ║ │
│  ║  • Subscribes to routes (Monthly pass)                  ║ │
│  ║  • Travels daily and rates driver                       ║ │
│  ║  • Makes payment via Stripe/TAP/Wallet                 ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ B2C_PARTNER (route owner)                          ║ │
│  ║  ├─ B2C_PARTNER_DRIVER (picks him up)                  ║ │
│  ║  ├─ B2B_PARTNER (via corporate clients)                ║ │
│  ║  └─ ADMIN (for complaints/issues)                      ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║         2. B2C_PARTNER (Individual Bus Operator)         ║ │
│  ║  • Creates routes                                       ║ │
│  ║  • Adds vehicles and drivers                            ║ │
│  ║  • Sets pricing                                         ║ │
│  ║  • Manages daily trips                                  ║ │
│  ║  • Monitors drivers via GPS                             ║ │
│  ║  • Receives payment from commuters                      ║ │
│  ║  • Tracks earnings and revenue                          ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ COMMUTER (pays for rides)                          ║ │
│  ║  ├─ B2C_PARTNER_DRIVER (employees)                     ║ │
│  ║  └─ ADMIN (verification, disputes)                     ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║      3. B2C_PARTNER_DRIVER (Individual Driver)          ║ │
│  ║  • Assigned by B2C_PARTNER                              ║ │
│  ║  • Views today's trip assignments                       ║ │
│  ║  • Shares real-time GPS location                        ║ │
│  ║  • Picks up and drops commuters                         ║ │
│  ║  • Marks attendance automatically                       ║ │
│  ║  • Receives ratings from commuters                      ║ │
│  ║  • Gets paid monthly by B2C_PARTNER                     ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ B2C_PARTNER (employer)                             ║ │
│  ║  ├─ COMMUTER (picks up/drops)                          ║ │
│  ║  └─ GPS/Socket.io (location tracking)                  ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║        4. B2B_PARTNER (Transportation Company)          ║ │
│  ║  • Registers as transportation company                  ║ │
│  ║  • Receives requirements from CORPORATE                 ║ │
│  ║  • Creates quotations                                   ║ │
│  ║  • Wins contracts with CORPORATE                        ║ │
│  ║  • Manages multiple routes and corporate contracts      ║ │
│  ║  • Assigns drivers to specific corporate routes         ║ │
│  ║  • Tracks attendance and performance                    ║ │
│  ║  • Invoices corporate clients                           ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ CORPORATE (clients)                                ║ │
│  ║  ├─ CORPORATE_EMPLOYEE (transports)                    ║ │
│  ║  ├─ B2B_PARTNER_DRIVER (employees)                     ║ │
│  ║  └─ ADMIN (contracts, disputes)                        ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║      5. B2B_PARTNER_DRIVER (Corporate Fleet Driver)     ║ │
│  ║  • Hired by B2B_PARTNER                                 ║ │
│  ║  • Assigned to specific corporate routes                ║ │
│  ║  • Manages strict schedules                             ║ │
│  ║  • Shares real-time GPS with corporate                  ║ │
│  ║  • Marks attendance of corporate employees              ║ │
│  ║  • Receives payments from B2B_PARTNER                   ║ │
│  ║  • Rated by CORPORATE_EMPLOYEE                          ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ B2B_PARTNER (employer)                             ║ │
│  ║  ├─ CORPORATE_EMPLOYEE (passengers)                    ║ │
│  ║  ├─ CORPORATE (indirect - sees performance)            ║ │
│  ║  └─ Real-time GPS tracking                             ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║          6. CORPORATE (Company / HR Manager)            ║ │
│  ║  • Creates company account                              ║ │
│  ║  • Posts transportation requirements                    ║ │
│  ║  • Receives quotes from B2B_PARTNER                     ║ │
│  ║  • Accepts contracts and signs digitally                ║ │
│  ║  • Adds employees (bulk or manual)                      ║ │
│  ║  • Views daily attendance reports                       ║ │
│  ║  • Tracks route utilization                             ║ │
│  ║  • Receives monthly invoices                            ║ │
│  ║  • Pays B2B_PARTNER                                     ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ B2B_PARTNER (service provider)                     ║ │
│  ║  ├─ CORPORATE_EMPLOYEE (manages)                       ║ │
│  ║  ├─ CORPORATE_DRIVER (direct hire alternative)         ║ │
│  ║  ├─ B2B_PARTNER_DRIVER (sees performance)              ║ │
│  ║  └─ ADMIN (contract disputes)                          ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║        7. CORPORATE_EMPLOYEE (Company Employee)         ║ │
│  ║  • Invited by CORPORATE via email                       ║ │
│  ║  • Creates account using invitation link                ║ │
│  ║  • Views assigned route and pickup location             ║ │
│  ║  • Sees real-time driver location (GPS)                 ║ │
│  ║  • Gets picked up by B2B_PARTNER_DRIVER                ║ │
│  ║  • Attendance auto-marked when on vehicle               ║ │
│  ║  • Rates driver and vehicle                             ║ │
│  ║  • Can report complaints                                ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ CORPORATE (employer - manages)                     ║ │
│  ║  ├─ B2B_PARTNER_DRIVER (picks up daily)                ║ │
│  ║  ├─ CORPORATE_DRIVER (alternative)                     ║ │
│  ║  ├─ B2B_PARTNER (indirectly)                           ║ │
│  ║  └─ ADMIN (for complaints)                             ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║       8. CORPORATE_DRIVER (Company Driver)              ║ │
│  ║  • Hired directly by CORPORATE                          ║ │
│  ║  • Gets assigned to fixed route                         ║ │
│  ║  • Manages same employees every day                     ║ │
│  ║  • Shares GPS location with employees                   ║ │
│  ║  • Marks attendance for employees                       ║ │
│  ║  • Receives salary from CORPORATE                       ║ │
│  ║  • Rated by CORPORATE_EMPLOYEE                          ║ │
│  ║                                                          ║ │
│  ║  Interacts with:                                        ║ │
│  ║  ├─ CORPORATE (employer)                               ║ │
│  ║  ├─ CORPORATE_EMPLOYEE (passengers)                    ║ │
│  ║  └─ Real-time GPS tracking                             ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║              9. ADMIN (Administrator)                    ║ │
│  ║  • Verifies all new users and documents                 ║ │
│  ║  • Approves B2C_PARTNER registration                    ║ │
│  ║  • Approves B2B_PARTNER registration                    ║ │
│  ║  • Approves CORPORATE registration                      ║ │
│  ║  • Manages routes (suspend/activate)                    ║ │
│  ║  • Handles complaints from any user                     ║ │
│  ║  • Views financial reports                              ║ │
│  ║  • Monitors system performance                          ║ │
│  ║  • Resolves contract disputes                           ║ │
│  ║  • Manages payments and refunds                         ║ │
│  ║                                                          ║ │
│  ║  Interacts with: ALL OTHER USERS                        ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Transaction Flow - कैसे पैसा flow होता है?

```
FLOW A: B2C (व्यक्तिगत यात्रियों के लिए)
═════════════════════════════════════════

COMMUTER
   ↓ (Payment: Subscribe for monthly pass)
   ↓
STRIPE/TAP/WALLET GATEWAY
   ↓ (Payment Success)
   ↓
B2C_PARTNER (85-90%)
└─ B2C_PARTNER_DRIVER Salary (from B2C_PARTNER)
       (हर trip के लिए commission या monthly salary)

ADMIN Commission (10-15%)
└─ Platform maintenance & support


FLOW B: B2B (Corporate माध्यम से)
═════════════════════════════════════════

CORPORATE
   ↓ (Pays monthly invoice)
   ↓
B2B_PARTNER (के लिए payment)
└─ B2B_PARTNER_DRIVER Salary (from B2B_PARTNER)
└─ Vehicles & Operations (maintained by B2B_PARTNER)

ADMIN Commission
└─ Platform maintenance

Alternative:
CORPORATE
   ↓
CORPORATE_DRIVER Salary (direct hire)
```

---

## Data Flow - कैसे information flow होता है?

```
REAL-TIME UPDATES (Socket.io के through):
════════════════════════════════════════

Driver Location Updates (GPS)
   ↓ (Every 10 seconds)
   ↓
B2B_PARTNER_DRIVER → All CORPORATE_EMPLOYEE passengers
B2C_PARTNER_DRIVER → All COMMUTER passengers
CORPORATE_DRIVER → All CORPORATE_EMPLOYEE


Booking & Availability Updates:
════════════════════════════════

COMMUTER books → B2C_PARTNER sees (seat occupied)
CORPORATE adds employee → B2C_PARTNER sees (new passenger)
Driver completes trip → CORPORATE sees (attendance marked)


Notifications:
════════════════════════════════

COMMUTER: "Bus arriving in 5 minutes"
B2C_PARTNER: "New booking received"
CORPORATE_EMPLOYEE: "Driver location updated"
CORPORATE: "Daily attendance report ready"
B2B_PARTNER: "New corporate requirement"
ADMIN: "Document verification pending"
```

---

## Complete API Endpoint Mapping

### Authentication
```
POST /auth/register         → सभी users के लिए sign up
POST /auth/login            → सभी users के लिए login
POST /auth/logout           → सभी users के लिए logout
POST /auth/verify-email     → Email verification
POST /auth/forgot-password  → Password recovery
```

### COMMUTER Routes
```
GET  /routes/search         → Routes खोजना
POST /bookings/b2c          → Monthly pass लेना
GET  /bookings/passenger    → अपनी bookings देखना
GET  /bookings/:id/daily-trips  → आज की trip info
POST /trips/:id/ratings     → Trip rate करना
POST /requirements          → Route request करना
GET  /wallet/balance        → Wallet balance
POST /wallet/add-funds      → Add money to wallet
```

### B2C_PARTNER Routes
```
POST /b2c-trips/routes      → नया route बनाना
GET  /b2c-trips/routes      → अपने सभी routes
PUT  /b2c-trips/routes/:id  → Route edit करना
GET  /b2c-trips/trips/today → आज की trips
PUT  /b2c-trips/trips/:id/status → Trip status update
POST /b2c-partner/vehicles  → Vehicle add करना
POST /b2c-partner/drivers   → Driver add करना
GET  /b2c-partner/earnings  → Earnings देखना
GET  /requirements/open     → Route requests देखना
```

### B2C_PARTNER_DRIVER Routes
```
GET  /b2c-trips/driver/daily-assignments → आपकी trips
POST /b2c-trips/trips/:id/start          → Trip शुरु करना
POST /b2c-trips/trips/:id/complete       → Trip खत्म करना
POST /driver/location                     → Location update करना
GET  /driver/ratings                      → आपकी ratings
GET  /driver/earnings                     → महीने की earnings
```

### B2B_PARTNER Routes
```
GET  /requirements/open     → Corporate requirements
POST /quotations            → Quote बनाना
POST /contracts             → Contract बनाना
POST /b2b-partner/vehicles  → Fleet add करना
POST /b2b-partner/drivers   → Driver add करना
GET  /b2b-partner/trips/daily → आज की trips
GET  /b2b-partner/reports   → Performance reports
GET  /b2b-partner/invoices  → Monthly invoices
```

### B2B_PARTNER_DRIVER Routes
```
GET  /b2b-driver/assignments        → आपकी contracts & routes
GET  /b2b-driver/daily-trips        → आज की trips
POST /b2b-driver/trips/:id/start    → Trip शुरु करना
POST /b2b-driver/trips/:id/complete → Trip खत्म करना
POST /driver/location               → Location update करना
GET  /b2b-driver/monthly-statement  → महीने की earnings
```

### CORPORATE Routes
```
POST /corporate/requirements      → Transportation requirement
GET  /quotations                  → Quotes from B2B_PARTNER
POST /contracts                   → Accept contract
POST /corporate/employees         → Employee add करना
POST /corporate/employees/bulk    → Bulk upload करना
GET  /corporate/attendance        → Attendance report
GET  /corporate/routes/utilization → Route usage stats
GET  /corporate/invoices          → Monthly invoices
POST /corporate/invoices/:id/pay  → Payment करना
```

### CORPORATE_EMPLOYEE Routes
```
GET  /corporate-employee/today-trip → आज की trip info
GET  /corporate-employee/travel-history → सभी trips का history
POST /trips/:id/ratings            → Trip rate करना
POST /complaints                    → Issue report करना
GET  /wallet/balance               → Wallet balance (if applicable)
```

### CORPORATE_DRIVER Routes
```
GET  /corporate-driver/assignment  → आपकी assigned route
GET  /corporate-driver/daily-trip  → आज की trip
POST /corporate-driver/trip/start  → Trip शुरु करना
POST /corporate-driver/trip/complete → Trip खत्म करना
POST /driver/location              → Location update करना
GET  /corporate-driver/salary      → Monthly salary
```

### ADMIN Routes
```
GET  /admin/users           → सभी users list
POST /admin/users/:id/verify → User verification
POST /admin/users/:id/block  → User को block करना
GET  /admin/routes          → सभी routes
POST /admin/routes/:id/suspend → Route को suspend करना
GET  /admin/complaints      → सभी complaints
POST /admin/complaints/:id/resolve → Complaint resolve करना
GET  /admin/financial-reports → Financial reports
GET  /admin/contracts       → Contract disputes
```

---

## Database Tables और उनका उपयोग

```
Authentication & Profiles:
├─ User (सभी users)
├─ B2CPartnerProfile
├─ B2BPartnerProfile
├─ CorporateProfile
├─ CorporateEmployee
├─ DriverProfile (generic)

Routes & Schedules:
├─ B2CPartnerRoute (B2C के routes)
├─ B2CPartnerTrip (B2C की daily trips)
├─ B2BPartnerRoute (B2B के routes - corporate contracts)
├─ B2BPartnerTrip (B2B की daily trips)
├─ CorporateRoute (CORPORATE के assigned routes)

Vehicles & Drivers:
├─ B2CPartnerVehicle
├─ B2CPartnerDriver
├─ B2BPartnerVehicle
├─ B2BPartnerDriver
├─ CorporateVehicle
├─ CorporateDriver

Bookings & Contracts:
├─ B2CPassengerBooking (COMMUTER bookings)
├─ Contract (B2B agreements)
├─ Quotation (B2B proposals)
├─ CorporateRequirement (CORPORATE की मांग)
├─ EmployeeRoute (CORPORATE_EMPLOYEE के assigned routes)

Operations:
├─ Attendance (daily attendance)
├─ DriverLocation (real-time GPS)
├─ Notification
├─ Rating & Review
├─ Complaint

Financial:
├─ Wallet
├─ Transaction
├─ Invoice
├─ Payment
```

---

## Real-Time Features (Socket.io)

```
Channels:
═════════

driver-location-:driverId
  → Broadcast driver की location हर 10 सेकंड में
  → Listeners: COMMUTER, CORPORATE, CORPORATE_EMPLOYEE

notifications-:userId
  → Push notifications for all users
  → Updates on bookings, trips, payments

availability-:routeId
  → Seat availability updates
  → Real-time for all COMMUTERs viewing that route

attendance-:contractId
  → Live attendance marking for CORPORATE_DRIVER/B2B_PARTNER_DRIVER
  → CORPORATE को live updates

trip-updates-:tripId
  → Trip status, location, time updates
  → Real-time for all participants
```

---

## Complete User Journey Map

```
A USER'S COMPLETE JOURNEY:

DAY 1: REGISTRATION
────────────────────
User → HomePage → Register → Choose Role → Fill Details → 
Verify Email → Account Created → Dashboard

DAY 2: FIRST ACTION
──────────────────
COMMUTER: Search routes → Find favorite → Check Schedule → Add to Wishlist
B2C_PARTNER: Create First Route → Set Pricing → Add Vehicle → Add Driver
CORPORATE: Post Requirement → Receive Quotes → Compare → Accept Best
B2B_PARTNER: See Requirement → Create Proposal → Send Quote → Await Decision

DAY 3: FIRST TRANSACTION
────────────────────────
COMMUTER: Choose Plan (Full/Weekdays/Weekends) → Payment → Get Digital Pass
B2C_PARTNER: Launch Route → Create First Daily Trip
CORPORATE: Sign Contract → Add First Employee Batch
B2B_PARTNER: Quote Accepted → Create Vehicles & Drivers

DAY 4: FIRST OPERATION
──────────────────────
COMMUTER: Check Dashboard → See Today's Trip → Get Pickup Location
B2C_PARTNER: Check Bookings → Send Trip Details to Driver
B2C_PARTNER_DRIVER: Accept Trip → Pick up Commuters → Share Location
CORPORATE: See Employee List → Monitor Today's Attendance
B2B_PARTNER_DRIVER: Pick up Corporate Employees → Complete Trip

DAY 5: FIRST RATING
──────────────────
COMMUTER: Complete Trip → Rate Driver (stars & feedback)
B2C_PARTNER_DRIVER: See Ratings → Receive Payment
CORPORATE: Check Attendance Report → Monitor Route Performance
B2B_PARTNER: Receive First Invoice from Contract

DAY 30: FIRST RENEWAL/BILLING
──────────────────────────────
COMMUTER: Auto-Renewal Notification → Confirm/Cancel
B2C_PARTNER: Check Monthly Earnings → Request Withdrawal
CORPORATE: Receive Invoice → Pay Online/Wire Transfer
B2B_PARTNER: Send Invoice to CORPORATE → Follow up on Payment

DAY 60+: OPTIMIZATION
────────────────────
COMMUTER: Have preferred routes → Auto-renew → Travel regularly
B2C_PARTNER: Optimize routes → Manage multiple drivers → Track earnings
CORPORATE: Multiple employees → Full visibility → Cost analysis
B2B_PARTNER: Multiple contracts → Scale operations → Performance tracking
```

---

## Summary Table: User Roles at a Glance

| Role | Sign Up | Primary Action | Earns | Pays | Interacts With | Key Challenge |
|------|---------|----------------|-------|------|----------------|---------------|
| COMMUTER | Email/Phone | Subscribe Routes | N/A | Monthly Pass | B2C Partners | Finding right route |
| B2C_PARTNER | Documents | Create Routes | Per Booking | Commission | Commuters, Drivers | Driver management |
| B2C_PARTNER_DRIVER | Email | Drive Daily | Per Trip | Employer | Commuters | On-time delivery |
| B2B_PARTNER | Company Docs | Win Contracts | Per Contract | Commission | Corporates | Contract execution |
| B2B_PARTNER_DRIVER | License/Docs | Transport Employees | Salary | Employer | Corp Employees | Attendance accuracy |
| CORPORATE | Tax ID | Hire Transport | N/A | Monthly | B2B Partner or Drivers | Cost optimization |
| CORPORATE_DRIVER | DL/Docs | Drive Fixed Route | Salary | Employer | Employees | Schedule adherence |
| CORPORATE_EMPLOYEE | Email Link | Travel Daily | N/A | Employer | Drivers | Reliability |
| ADMIN | System | Verify & Manage | N/A | Platform | All Users | System integrity |

---

**यह document सभी 9 user roles का complete flow दिखाता है और कैसे वह एक दूसरे से interact करते हैं।**
