# 🏗️ DriveMe - Architecture & Quick Start Guide

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       COMMUTER/USERS                             │
│  (Web: React, Mobile: React Native via Expo)                    │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS/WebSocket
┌────────────────▼────────────────────────────────────────────────┐
│                    FRONTEND (React + Redux)                      │
├─────────────────────────────────────────────────────────────────┤
│ Components:                                                       │
│ ├─ Pages (10+ role-based dashboards)                            │
│ ├─ Modals (Booking, Payment, Schedule)                          │
│ ├─ Charts & Analytics                                            │
│ └─ Real-time Location Tracking                                   │
└────────────────┬────────────────────────────────────────────────┘
                 │ REST API + Socket.io
┌────────────────▼────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                    │
├─────────────────────────────────────────────────────────────────┤
│ API Routes:                                                       │
│ ├─ /auth - Authentication                                        │
│ ├─ /bookings - Booking management                                │
│ ├─ /b2c-trips - B2C route & trip management                      │
│ ├─ /b2b-partner - B2B operations                                 │
│ ├─ /corporate - Corporate operations                             │
│ ├─ /admin - Admin controls                                       │
│ ├─ /wallet - Payment & balance                                   │
│ └─ /notifications - Real-time events                             │
├─────────────────────────────────────────────────────────────────┤
│ Controllers:                                                      │
│ ├─ bookingController (Booking CRUD)                              │
│ ├─ b2cTripController (Trip management)                           │
│ ├─ contractController (Contract handling)                        │
│ ├─ walletController (Payment processing)                         │
│ └─ adminController (System management)                           │
├─────────────────────────────────────────────────────────────────┤
│ Services:                                                         │
│ ├─ tripGenerationService (Auto-create daily trips)               │
│ ├─ emailService (Notifications)                                  │
│ ├─ socketService (Real-time events)                              │
│ ├─ paymentService (Payment processing)                           │
│ └─ notificationService (Alerts)                                  │
├─────────────────────────────────────────────────────────────────┤
│ Cron Jobs (Background Tasks):                                    │
│ ├─ subscriptionCron (Monthly renewal)                            │
│ └─ tripGenerationCron (Daily trip creation)                      │
└────────────────┬────────────────────────────────────────────────┘
                 │ MongoDB Driver
┌────────────────▼────────────────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                        │
├─────────────────────────────────────────────────────────────────┤
│ Collections:                                                      │
│ ├─ Users (All user accounts)                                     │
│ ├─ B2CPartnerRoute (B2C routes)                                  │
│ ├─ B2CPartnerTrip (Daily trips)                                  │
│ ├─ B2CPassengerBooking (B2C bookings)                            │
│ ├─ CorporateBooking (Corporate bookings)                         │
│ ├─ CorporateEmployee (Company employees)                         │
│ ├─ Contract (Service contracts)                                  │
│ ├─ Quotation (Price quotes)                                      │
│ ├─ Wallet (User balance)                                         │
│ ├─ Transaction (Payment history)                                 │
│ ├─ Notification (User alerts)                                    │
│ └─ And 15+ more...                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES INTEGRATION                        │
├─────────────────────────────────────────────────────────────────┤
│ ├─ Stripe (Payment processing - Global)                          │
│ ├─ TAP Payments (Middle East payments)                           │
│ ├─ SendGrid/SMTP (Email notifications)                           │
│ ├─ Twilio (SMS notifications)                                    │
│ ├─ Google Maps API (Location & routing)                          │
│ ├─ AWS S3 / Vercel Blob (File storage)                           │
│ ├─ Firebase Cloud Messaging (Push notifications)                 │
│ └─ Socket.io (WebSocket server)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 User Role Architecture

```
                    ┌─────────────────────┐
                    │   SUPER ADMIN        │
                    │  (System Master)     │
                    └────────────┬─────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   COMMUTER   │         │   B2C_PARTNER│         │ B2B_PARTNER  │
│  (Passenger) │         │ (Individual) │         │  (Company)   │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       │                        │                        │
  Subscribe to            Operate routes         Manage contracts
  routes                  Manage drivers         Manage fleet
  Track bus              Track earnings         Generate reports
  Rate drivers            Rate passengers       Manage drivers
  Pay monthly             Accept bookings       Track vehicles

┌──────────────────────────────────────────────────────────────────┐
│                         CORPORATE                                │
│                    (Company/Organization)                         │
└──────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
 ┌─────────────┐         ┌─────────────┐
 │ CORPORATE   │         │  CORPORATE  │
 │  EMPLOYEE   │         │   DRIVER    │
 │  (Commuter) │         │  (Operator) │
 └─────────────┘         └─────────────┘
   
   Travel daily      Share location
   Rate rides       Complete trips
   Provide feedback  Track earnings
   Report issues    Manage schedule

┌──────────────────────────────────────────────────────────────────┐
│                    ADMIN & SUPPORT                               │
│           (Platform Management & Oversight)                      │
└──────────────────────────────────────────────────────────────────┘

   Verify users       Monitor payments      Resolve disputes
   Approve routes     Check compliance      Generate reports
   Ban bad actors     Track fraud           Manage promotions
```

---

## 🔄 Data Flow Diagram

### **Booking Creation Flow**
```
Commuter Searches Route
        │
        ▼
API: GET /routes/search
        │
        ▼
Database: Query B2CPartnerRoute
        │
        ▼
Frontend: Show available routes
        │
        ▼
Commuter Clicks "Subscribe"
        │
        ▼
BookingModal Opens
        │
        ├─ Commuter selects plan (Full Month / Weekdays)
        │
        ▼
Commuter enters Payment Method
        │
        ├─ Stripe (Card) / TAP (Middle East) / Wallet
        │
        ▼
API: POST /bookings/b2c
        │
        ├─ Verify route availability
        ├─ Calculate commission
        ├─ Create booking record
        │
        ▼
Payment Gateway Processing
        │
        ├─ Success ✓: Booking Status = "CONFIRMED"
        │
        ├─ Failure ✗: Booking Status = "CANCELLED"
        │
        ▼
API: POST /wallet/transaction (record payment)
        │
        ▼
Email: Booking confirmation to passenger
        │
        ▼
Socket.io: Notify B2C Partner of new booking
        │
        ▼
Commuter gets Digital Pass
```

### **Daily Trip Generation Flow**
```
Cron Job: Every day at 12:00 AM
        │
        ▼
Fetch all active B2CPartnerRoute records
        │
        ├─ Check if today matches schedule (Mon-Fri, etc.)
        │
        ▼
For each route with today's schedule:
        │
        ├─ Create B2CPartnerTrip record
        ├─ Set trip status = "SCHEDULED"
        ├─ Fetch all confirmed bookings for this route
        ├─ Pre-allocate seats to subscribers
        │
        ▼
Email: Notification to all passengers
        │
        ├─ "Your trip is ready tomorrow at 8:00 AM"
        │
        ▼
Socket.io: Broadcast trip creation to B2C Partner
        │
        └─ Partner can now manage available seats
```

### **Real-Time Location Flow**
```
Driver starts trip
        │
        ▼
API: PUT /trips/:id/start
        │
        ├─ Update trip status = "STARTED"
        ├─ Enable GPS location sharing
        │
        ▼
Driver's browser: Get location every 10 seconds
        │
        │ navigator.geolocation.getCurrentPosition()
        │
        ▼
API: POST /driver/location
        │
        ├─ Save location to DriverLocation table
        ├─ Emit Socket.io event
        │
        ▼
Socket.io Broadcast to all passengers in this trip
        │
        ├─ Passengers see real-time bus location on map
        │
        ▼
Driver completes trip
        │
        ▼
API: PUT /trips/:id/complete
        │
        ├─ Stop location tracking
        ├─ Update trip status = "COMPLETED"
        ├─ Mark attendance for all passengers
        ├─ Calculate driver payment
        │
        ▼
Email: Trip summary to driver & passengers
```

---

## 🗄️ Database Schema Overview

### **Core Collections**

#### **Users**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed with bcrypt),
  role: String (COMMUTER|B2C_PARTNER|B2B_PARTNER|CORPORATE|ADMIN),
  profilePhoto: String (URL),
  documents: [{
    type: String,
    url: String,
    verificationStatus: String
  }],
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### **B2CPartnerRoute**
```javascript
{
  _id: ObjectId,
  b2cPartnerId: ObjectId (ref: User),
  routeName: String,
  fromLocation: String,
  toLocation: String,
  stops: [{
    location: String,
    time: String
  }],
  tripType: String (ONE_WAY|ROUND_TRIP),
  totalSeats: Number,
  availableDays: [String],
  monthlyPrice: Number,
  status: String (ACTIVE|INACTIVE),
  createdAt: Date
}
```

#### **B2CPartnerTrip**
```javascript
{
  _id: ObjectId,
  b2cPartnerId: ObjectId (ref: User),
  routeId: ObjectId (ref: B2CPartnerRoute),
  vehicleId: ObjectId (ref: B2CPartnerVehicle),
  driverId: ObjectId (ref: B2CPartnerDriver),
  tripDate: Date,
  status: String (SCHEDULED|STARTED|COMPLETED|CANCELLED),
  totalSeats: Number,
  bookedSeats: Number,
  startTime: String,
  endTime: String
}
```

#### **B2CPassengerBooking**
```javascript
{
  _id: ObjectId,
  passengerId: ObjectId (ref: User),
  b2cPartnerId: ObjectId (ref: User),
  routeId: ObjectId (ref: B2CPartnerRoute),
  bookingStatus: String (PENDING|CONFIRMED|COMPLETED|CANCELLED),
  planType: String (FULL_MONTH|WEEKDAYS_ONLY|WEEKENDS_ONLY),
  amount: Number,
  paymentMethod: String (CARD|WALLET|TAP),
  transactionId: String,
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean
}
```

#### **CorporateBooking**
```javascript
{
  _id: ObjectId,
  employeeId: ObjectId (ref: CorporateEmployee),
  corporateId: ObjectId (ref: User),
  contractId: ObjectId (ref: Contract),
  routeId: ObjectId (ref: Route),
  travelDate: Date,
  bookingStatus: String,
  status: String (ATTENDED|NO_SHOW)
}
```

#### **Contract**
```javascript
{
  _id: ObjectId,
  corporateId: ObjectId (ref: User),
  b2bPartnerId: ObjectId (ref: User),
  quotationId: ObjectId (ref: Quotation),
  monthlyPrice: Number,
  employeeCount: Number,
  routes: [ObjectId],
  startDate: Date,
  endDate: Date,
  status: String (DRAFT|ACTIVE|COMPLETED|TERMINATED),
  terms: String
}
```

---

## 🚀 Quick Start Guide

### **For Developers: Setup Instructions**

#### **1. Clone Repository**
```bash
git clone <repo-url>
cd DriveMe
```

#### **2. Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/driveme

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
TAP_SECRET_KEY=sk_...

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_specific_password

# File Storage
VERCEL_BLOB_TOKEN=blob_...

# Payment URLs
PAYMENT_RETURN_URL=http://localhost:3000/payment-callback

# Node Environment
NODE_ENV=development
PORT=5000
```

Start backend:
```bash
npm start
# Backend runs on http://localhost:5000
```

#### **3. Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_KEY=pk_live_...
```

Start frontend:
```bash
npm start
# Frontend runs on http://localhost:3000
```

#### **4. Database Setup**
- Create MongoDB Atlas account
- Create cluster
- Get connection string
- Add to `.env`

#### **5. Payment Gateway Setup**
- Create Stripe account → Get keys
- Create TAP Payments account → Get keys
- Add to `.env`

#### **6. Run Seeds** (Optional)
```bash
cd backend
npm run seed
# This adds sample data for testing
```

---

### **For Users: Testing the App**

#### **Test COMMUTER Account**
```
Email: commuter@test.com
Password: Test@123
Role: COMMUTER
```

Steps:
1. Login
2. Go to "Find Routes"
3. Search for any route
4. Click "Subscribe"
5. Complete payment
6. Check booking in "My Rides"

#### **Test B2C_PARTNER Account**
```
Email: b2c@test.com
Password: Test@123
Role: B2C_PARTNER
```

Steps:
1. Login
2. Go to "Create New Route"
3. Fill route details
4. Set pricing
5. Check in "My Routes"
6. Go to "Today's Trips"
7. Manage trip status

#### **Test CORPORATE Account**
```
Email: corporate@test.com
Password: Test@123
Role: CORPORATE
```

Steps:
1. Login
2. Go to "Get Transportation"
3. Send requirement to B2B Partner
4. Wait for quote
5. Accept quote & sign contract
6. Add employees
7. Check attendance dashboard

#### **Test ADMIN Account**
```
Email: admin@driveme.com
Password: Admin@123
Role: ADMIN
```

Steps:
1. Login
2. Go to Admin Dashboard
3. Verify users
4. Check payments
5. View reports

---

## 🧪 API Testing with Postman

### **Import Collection**
1. Open Postman
2. Import collection from: `backend/postman_collection.json`

### **Common API Endpoints**

**Authentication**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

**Search Routes**
```
GET /api/routes/search?from=Location1&to=Location2&date=2024-02-15
```

**Create Booking**
```
POST /api/bookings/b2c
Body: {
  "routeId": "...",
  "planType": "FULL_MONTH",
  "paymentMethod": "CARD"
}
```

**Get My Bookings**
```
GET /api/bookings/passenger
```

**Create Route** (B2C Partner)
```
POST /api/b2c-trips/routes
Body: {
  "routeName": "...",
  "fromLocation": "...",
  "toLocation": "...",
  ...
}
```

---

## 📊 System Statistics

- **Total API Endpoints**: 120+
- **Database Collections**: 25+
- **React Components**: 150+
- **Redux Slices**: 10+
- **Frontend Pages**: 30+
- **Backend Controllers**: 15+
- **Cron Jobs**: 2
- **Socket.io Events**: 20+
- **Payment Gateways**: 3

---

## ✅ Verification Checklist Before Launch

- [ ] All environment variables set correctly
- [ ] Database connected and indexes created
- [ ] Payment gateways configured
- [ ] Email service working
- [ ] File uploads working
- [ ] Socket.io connection working
- [ ] All users can register
- [ ] All user roles can login
- [ ] Booking flow complete
- [ ] Payment processing working
- [ ] Real-time location tracking working
- [ ] Cron jobs running
- [ ] Admin dashboard functional
- [ ] Reports generating correctly
- [ ] All error handling in place
- [ ] HTTPS/SSL configured

---

**For detailed API documentation, see**: `/backend/API_DOCUMENTATION.md`

**For database schema details, see**: `/backend/DATABASE_SCHEMA.md`

**For complete flow guide in Hindi, see**: `/FLOW_GUIDE_HINDI.md`

Ready to launch! 🎉
