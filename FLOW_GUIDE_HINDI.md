# 🚗 DriveMe - Complete Application Flow Guide (Hindi)

---

## 📋 विषय सूची (Table of Contents)
1. **COMMUTER** - आम यात्री (Normal Passenger)
2. **B2C_PARTNER** - व्यक्तिगत बस ऑपरेटर (Individual Bus Operator)
3. **B2B_PARTNER** - परिवहन कंपनी (Transportation Company)
4. **CORPORATE** - कॉर्पोरेट क्लाइंट (Company)
5. **CORPORATE_EMPLOYEE** - कर्मचारी (Employee)
6. **B2C_PARTNER_DRIVER** - व्यक्तिगत ड्राइवर (Individual Driver)
7. **B2B_PARTNER_DRIVER** - परिवहन कंपनी का ड्राइवर (Transportation Company Driver)
8. **CORPORATE_DRIVER** - कंपनी का ड्राइवर (Company Driver)
9. **ADMIN** - प्रशासक (Administrator)

---

# 🚀 FLOW 1: COMMUTER (आम यात्री)

## **चरण 1: वेबसाइट खोलें और खोज करें**

### आप क्या करते हैं:
1. **HomePage** पर जाएं
2. अपना **शुरुआती स्थान (Pick-up location)** चुनें
3. अपना **गंतव्य (Destination)** चुनें
4. **यात्रा की तारीख** चुनें
5. "**रूट खोजें**" बटन दबाएं

### बैकएंड में क्या होता है:
- API: `GET /routes/search`
- Database: सभी **B2C_PARTNER routes** खोजे जाते हैं
- Check: क्या यह रूट उपलब्ध है और सीटें खाली हैं

### Frontend में क्या दिखता है:
- **FindRoutes Component** में सभी उपलब्ध रूट्स दिखते हैं
- हर रूट में:
  - बस का प्रकार
  - निकलने का समय (Departure Time)
  - प्रति माह की कीमत
  - उपलब्ध सीटें
  - ड्राइवर की रेटिंग

---

## **चरण 2: रूट नहीं मिला तो क्या करें?**

### अगर कोई रूट उपलब्ध नहीं है:
1. **"इस रूट की मांग करें"** बटन दिखाई देगा
2. अपनी जानकारी भरें:
   - दैनिक यात्रा की आवश्यकता (कितने दिन चलना है)
   - प्राथमिकता (Priority)
   - अतिरिक्त जानकारी
3. **Submit करें**

### बैकएंड में:
- API: `POST /requirements`
- Database: आपकी मांग **Requirement** टेबल में save होती है
- B2B_PARTNER और B2C_PARTNER दोनों को यह notification मिलता है

---

## **चरण 3: साइन अप / लॉगिन करें**

### पहली बार यात्री हो तो:
1. **Register** पर क्लिक करें
2. अपने details भरें:
   - नाम
   - ईमेल
   - फोन नंबर
   - पासवर्ड
   - आवासीय पता
3. **Create Account** दबाएं
4. Email verification करें

### अगर पहले से account है:
1. **Login** करें
2. ईमेल और पासवर्ड से लॉगिन करें
3. 2FA (यदि enabled है) verify करें

### बैकएंड में:
- API: `POST /auth/register` या `POST /auth/login`
- Database: **User** टेबल में नया यूजर add होता है
- JWT Token जेनरेट होता है और localStorage में store होता है

---

## **चरण 4: रूट को सबस्क्राइब करें (Monthly Pass लें)**

### क्या करते हैं:
1. अपनी पसंद के रूट पर क्लिक करें
2. **"Monthly Pass लें"** बटन दबाएं
3. Plan चुनें:
   - **Full Month** (सभी दिन)
   - **Weekdays Only** (सोमवार-शुक्रवार)
   - **Weekends Only** (शनिवार-रविवार)
4. पेमेंट विधि चुनें:
   - **Credit/Debit Card**
   - **Wallet**
   - **TAP Payment** (UAE/Kuwait के लिए)
5. **Confirm Payment** दबाएं

### बैकएंड में:
- API: `POST /bookings/b2c`
- Database: 
  - **B2CPassengerBooking** में booking create होती है
  - Status: "PENDING" से शुरु होती है
- Payment processing होती है:
  - Stripe/TAP gateway से payment process होता है
  - Success पर status "CONFIRMED" हो जाती है

### Frontend में:
- **BookingModal** दिखता है
- Payment के बाद **Digital Pass** मिलता है
- Booking की details अपने **Dashboard** में दिखती हैं

---

## **चरण 5: रोज़ की यात्रा करें**

### हर दिन सुबह क्या करें:
1. **CommuterHomePage** या **CommuterProfilePage** खोलें
2. **"My Bookings"** या **"Active Passes"** सेक्शन में जाएं
3. आज के लिए यात्रा की जानकारी देखें:
   - पिकअप का समय
   - पिकअप का स्थान
   - ड्राइवर का नाम और फोन नंबर
4. **Real-time Location** देखें - बस कहाँ है

### अगर आज यात्रा नहीं करना है:
1. बुकिंग पर **"Today की यात्रा छोड़ें"** या **"No Show"** दबाएं
2. तब सीट किसी और के लिए फ्री हो जाती है

### बैकएंड में:
- API: `GET /bookings/passenger` - सभी bookings fetch होती हैं
- API: `GET /booking/:bookingId/daily-trips` - आज की trips की जानकारी
- Socket.io के through real-time location updates आते हैं (Driver से)

---

## **चरण 6: महीने के अंत में नवीकरण (Renewal)**

### क्या ��ोता है:
1. महीने के अंत में आपको notification मिलता है
2. 3 विकल्प दिखते हैं:
   - **Auto-Renew** - अगले महीने के लिए automatically charge हो जाएगा
   - **Manually Renew** - आप अगले महीने दोबारा subscribe कर सकते हैं
   - **Cancel** - अब और यात्रा नहीं करनी है

### बैकएंड में:
- **Cron Job** हर रात 12 बजे चलता है (`subscriptionCron.js`)
- यह check करता है किसके subscriptions expire हो गए
- Auto-renew के लिए automatically charge करता है
- Database में **Subscription** status update होती है

---

# 💼 FLOW 2: B2C_PARTNER (व्यक्तिगत बस ऑपरेटर)

## **चरण 1: साइन अप करें**

### Registration के समय:
1. **Register** पर click करें
2. अपने details भरें:
   - नाम
   - ईमेल
   - फोन नंबर
   - बिज़नेस का नाम
   - बस की संख्या
   - Documents अपलोड करें:
     - बस का RC (Registration Certificate)
     - ड्राइविंग लाइसेंस
     - Insurance Document
     - Police Clearance
3. **Submit** दबाएं

### बैकएंड में:
- API: `POST /auth/register`
- Database: **User** में नया user (role: B2C_PARTNER)
- Documents को **File Storage** (Vercel Blob) में save किया जाता है
- Status: "PENDING_VERIFICATION" रहती है जब तक Admin verify न कर दे

---

## **चरण 2: पहला रूट बनाएं**

### क्या करते हैं:
1. Dashboard में **"Create New Route"** बटन दबाएं
2. Route की details भरें:
   - **Route Name**: जैसे "Downtown Express"
   - **From Location**: शुरुआती स्थान (Pickup Point)
   - **To Location**: गंतव्य
   - **Route Type**: 
     - One-way (सिर्फ सुबह या शाम)
     - Round-trip (सुबह जाना और शाम आना)
   - **Total Seats**: बस में कुल कितनी सीटें हैं
   - **Available Days**: कौन-कौन से दिन चलेगी (Mon-Fri, Daily, etc.)
   - **Start Time**: किस समय निकलेगी

### Advanced Options:
3. **Multiple Pickup Points** add करें:
   - जैसे: Point A (8:00 AM) → Point B (8:15 AM) → Final Destination (8:45 AM)
4. **Vehicle** select करें (जो आपने add किया हो)
5. **Driver** select करें (जो आपने add किया हो)

### बैकएंड में:
- API: `POST /b2c-trips/routes`
- Database: **B2CPartnerRoute** में नया route create होता है
- Fields:
  - partnerId: आपका ID
  - routeName, locations, schedule
  - totalSeats, pricing info
  - vehicleId, driverId

---

## **चरण 3: Monthly Subscription Price सेट करें**

### क्या करते हैं:
1. अपने create किए गए route पर क्लिक करें
2. **"Set Pricing"** या **"Pricing Plans"** सेक्शन खोलें
3. Price सेट करें:
   - **Full Month Price**: ₹5,000 (उदाहरण)
   - **Weekdays Only Price**: ₹3,500
   - **Weekends Only Price**: ₹2,000
4. **Save** दबाएं

### बैकएंड में:
- API: `PUT /b2c-trips/routes/:routeId/pricing`
- Database: **B2CPartnerRoute** में pricing field update होती है

---

## **चरण 4: Daily Trips Manage करें (Most Important)**

### हर दिन सुबह:
1. Dashboard पर जाएं
2. **"Today's Trips"** या **"Upcoming Trips"** सेक्शन खोलें
3. आज के सभी trips दिखते हैं:
   - Route name
   - Total seats
   - Booked seats (कितने यात्रियों ने subscribe किया)
   - Available seats for walk-ins

### Trip Status update करें:
4. Trip को यह status दें:
   - **"Started"** - यात्रा शुरु हो गई
   - **"In Progress"** - यात्रा चल रही है
   - **"Completed"** - यात्रा पूरी हो गई
   - **"Cancelled"** - यात्रा cancel करनी है

### अगर कोई यात्री नहीं आया:
5. **"Mark No-Show"** दबाएं
6. यह record रहता है कि यात्री आया नहीं

### बैकएंड में:
- API: `GET /b2c-trips/trips/today` - आज के सभी trips
- Database: **B2CPartnerTrip** से सभी trips fetch होते हैं
- API: `PUT /b2c-trips/trips/:tripId/status` - status update करते समय
- Socket.io के through यात्रियों को real-time updates मिलते हैं

---

## **चरण 5: Vehicle और Driver Manage करें**

### Vehicle Add करना:
1. **"Vehicles"** सेक्शन में जाएं
2. **"Add New Vehicle"** दबाएं
3. Details भरें:
   - Model name (जैसे "Hyundai Isuzu Bus")
   - License Plate
   - Total Capacity (सीटें)
   - Documents (RC, Insurance, Fitness)
4. **Upload** दबाएं

### Driver Add करना:
1. **"Drivers"** सेक्शन में जाएं
2. **"Add New Driver"** दबाएं
3. Details भरें:
   - नाम
   - फोन नंबर
   - License number
   - Experience (वर्षों में)
   - Documents (DL, Police Clearance)
4. **Upload** दबाएं

### बैकएंड में:
- API: `POST /b2c-partner/vehicles`
- Database: **B2CPartnerVehicle** में vehicle add होता है
- API: `POST /b2c-partner/drivers`
- Database: **B2CPartnerDriver** में driver add होता है

---

## **चरण 6: Earnings और Revenue देखें**

### Dashboard में Earnings सेक्शन:
1. **"Earnings"** tab खोलें
2. यह दिखता है:
   - Total monthly revenue
   - Per route revenue breakdown
   - Active subscribers count
   - Commission breakdown

### बैकएंड में:
- API: `GET /b2c-partner/earnings`
- Database: सभी **B2CPassengerBooking** records count होते हैं
- Calculation: Total bookings × subscription price

---

## **चरण 7: Route Request से नए Routes बनाएं**

### क्या दिखता है:
1. Dashboard में **"Route Requests"** सेक्शन
2. Commuters से आई हुई सभी route requests दिखती हैं
3. Request में:
   - From-To location
   - कितने लोगों ने request दिया
   - कौन-कौन से दिन चाहिए

### क्या करते हैं:
1. एक request चुनें
2. अगर यह route आप चलाना चाहते हैं तो **"Create Route from Request"** दबाएं
3. Automatically यह details भर जाते हैं
4. बाकी जानकारी add करें और save करें

### बैकएंड में:
- API: `GET /requirements/open` - सभी open requirements
- API: `POST /b2c-trips/routes/from-requirement` - नया route create करना

---

# 🏢 FLOW 3: CORPORATE (कंपनी का मालिक / HR Manager)

## **चरण 1: Company Account Register करें**

### क्या करते हैं:
1. **Register** पर क्लिक करें
2. **"I'm a Company"** option चुनें
3. Company की details भरें:
   - Company name
   - Industry type
   - Office address (multiple addresses हो सकते हैं)
   - Employee count
   - Tax ID / GST number
   - HR manager का नाम
4. **Documents upload करें:**
   - Company registration certificate
   - GST certificate
   - Office proof (utility bill)
5. **Submit** दबाएं

### बैकएंड में:
- API: `POST /auth/register` (with role: CORPORATE)
- Database: **User** में नया company user
- **CorporateProfile** में company details
- Status: "PENDING_VERIFICATION" (Admin के लिए)

---

## **चरण 2: B2B Partner से Contract करें**

### क्या दिखता है:
1. Dashboard में **"Get Transportation"** या **"Partner Quotes"** सेक्शन
2. सभी available **B2B_PARTNER** companies की list

### क्या करते हैं:
1. एक B2B partner को चुनें
2. अपनी requirement दें:
   - कितने employees को transport चाहिए
   - कौन-कौन से locations से pickup
   - Office location
   - Shift timings
   - Route preferences
3. **Request Quote** दबाएं

### बैकएंड में:
- API: `POST /requirements`
- Database: **CorporateRequirement** में requirement save होती है
- B2B partners को notification मिलता है

---

## **चरण 3: Quote देखें और Contract करें**

### क्या दिखता है:
1. B2B partner से quote आता है जिसमें:
   - Monthly price
   - Vehicle details
   - Driver details
   - Service terms
   - Insurance coverage
2. **"View Details"** पर क्लिक करके पूरा proposal देख सकते हो

### क्या करते हैं:
1. अगर quote ठीक लगे तो **"Accept Quote"** दबाएं
2. Digital contract upload होगा
3. Contract को review करके **"Sign Contract"** दबाएं
4. Payment दें

### बैकएंड में:
- API: `POST /contracts` - नया contract create होता है
- Database: **Contract** में सभी details save होती हैं
- Email: दोनों parties को contract के लिए notification

---

## **चरण 4: Employees को Add करें**

### दो तरीके:

**तरीका 1: Manual Add करना**
1. **"Manage Employees"** सेक्शन खोलें
2. **"Add Employee"** दबाएं
3. Details भरें:
   - Name
   - Email
   - Employee ID
   - Department
   - Residential area
   - Assigned route
4. **Invite** दबाएं

**तरीका 2: CSV Upload करना (Bulk)**
1. **"Bulk Upload"** option चुनें
2. CSV file में ये columns होने चाहिए:
   - Employee ID, Name, Email, Department, Area, Route
3. File upload करें
4. System automatically सभी को invite करेगा

### बैकएंड में:
- API: `POST /corporate/employees` - एक employee
- API: `POST /corporate/employees/bulk` - कई employees
- Database: **CorporateEmployee** में employees add होते हैं
- Email: हर employee को signup link मिलता है

---

## **चरण 5: Daily Management और Monitoring**

### Dashboard पर क्या दिखता है:
1. **Active Employees**: कितने employees daily transport use कर रहे हैं
2. **Daily Attendance**: 
   - कौन-कौन आज pickup पर चढ़ा
   - कौन-कौन नहीं आया
   - Attendance report
3. **Route Utilization**: हर route पर कितने employees
4. **Issues & Complaints**: अगर कोई issue है

### क्या कर सकते हो:
1. किसी employee की attendance check कर सकते हो
2. Route को change कर सकते हो
3. New employee को mid-month add कर सकते हो
4. Complaints देख सकते हो

### बैकएंड में:
- API: `GET /corporate/attendance` - attendance report
- Database: जब भी कोई employee pickup पर चढ़ता है तब mark होता है
- API: `GET /corporate/routes/utilization` - route usage stats

---

## **चरण 6: Monthly Billing और Payment**

### क्या होता है:
1. हर महीने के अंत में invoice generate होता है
2. Invoice में:
   - Active employees count
   - Per employee charge
   - Total charge
   - Any additional costs
   - Discount (if any)
3. Invoice को download कर सकते हो
4. Online payment कर सकते हो या wire transfer

### बैकएंड में:
- API: `GET /corporate/invoices` - सभी invoices
- Database: **Invoice** में सभी details
- **Payment processing** - payment gateway से

---

# 🚌 FLOW 4: B2B_PARTNER (Transportation Company)

## **चरण 1: Company Registration**

### क्या करते हैं:
1. **Register** दबाएं
2. **"I'm a Transportation Company"** option चुनें
3. Company details:
   - Company name
   - Fleet size (कितनी buses हैं)
   - Years in operation
   - Headquarters address
   - Authorized person details
4. **Documents upload:**
   - Company registration
   - Bus insurance certificates
   - Driver licenses (company के साथ काम करने वाले drivers के)
   - GST certificate
5. **Submit** करें

### बैकएंड में:
- API: `POST /auth/register` (role: B2B_PARTNER)
- Database: **User**, **B2BPartnerProfile** में data
- Status: "PENDING_VERIFICATION"

---

## **चरण 2: Corporate Client से Quote Request पाएं**

### क्या दिखता है:
1. Dashboard में **"Incoming Requirements"** सेक्शन
2. Corporate companies से आई हुई requirements:
   - Location
   - Employee count
   - Shift timings
   - Special requirements
3. **View Details** पर क्लिक करके पूरी requirement देख सकते हो

---

## **चरण 3: Quote Generate करें**

### क्या करते हैं:
1. एक requirement को चुनें
2. **"Create Quote"** दबाएं
3. अपना pricing और terms दें:
   - **Per seat monthly price**
   - **Vehicle type** जो use करेंगे
   - **Driver details**
   - **Service guarantees** (punctuality, etc.)
   - **Insurance coverage**
4. Contract draft attach करें
5. **Send Quote** दबाएं

### बैकएंड में:
- API: `POST /quotations`
- Database: **Quotation** में quote details
- Email: Corporate client को notification
- **Quotation status**: "DRAFT" → "SENT" → "ACCEPTED"

---

## **चरण 4: Contract Management**

### Quote Accept होने के बाद:
1. Signed contract receive होता है
2. **"View Contract"** दबाकर details देख सकते हो
3. अपनी side से accept करते हो
4. Contract अब active हो जाता है

### बैकएंड में:
- API: `POST /contracts/:contractId/accept`
- Database: **Contract** में status update होत�� है
- Start date से service शुरु हो जाती है

---

## **चरण 5: Fleet और Driver Management**

### Vehicles Add करना:
1. **"Fleet Management"** सेक्शन खोलें
2. **"Add Vehicle"** दबाएं
3. Details:
   - Model, Capacity, License Plate
   - Maintenance records
   - Insurance validity
   - Documents

### Drivers Add करना:
1. **"Driver Management"** खोलें
2. **"Add Driver"** दबाएं
3. Driver की complete profile:
   - License, Experience, Background check
   - Training certificates
   - Documents

### बैकएंड में:
- API: `POST /b2b-partner/vehicles`
- API: `POST /b2b-partner/drivers`
- Database: **B2BPartnerVehicle**, **B2BPartnerDriver**

---

## **चरण 6: Route Assignment और Daily Operations**

### Route Assignment:
1. Corporate contract के लिए routes design करो:
   - Multiple pickup points
   - Schedule timings
   - Vehicle assignment
2. **"Assign Route"** दबाकर route को contract के साथ link करो

### Daily Trip Management:
1. **"Daily Trips"** tab खोलो
2. आज के सभी trips दिखते हैं
3. हर trip के लिए:
   - Vehicle check करो
   - Driver assign करो
   - Passenger count verify करो
   - Start trip देकर tracking शुरु करो
   - Complete trip करो
   - Attendance mark करो

### बैकएंड में:
- API: `GET /b2b-partner/trips/daily`
- API: `POST /b2b-partner/trips/:tripId/start`
- API: `POST /b2b-partner/trips/:tripId/complete`
- Database: **Trip** status, attendance updates
- Socket.io: Real-time location updates drivers से

---

## **चरण 7: Driver Dashboard और Location Tracking**

### Driver के लिए:
1. B2B Partner driver role से login करें
2. **"Today's Trips"** में assigned trips दिखते हैं
3. Trip शुरु करने से:
   - GPS location sharing activate हो जाती है
   - Location हर 10 सेकंड update होती है
4. Trip complete करते समय:
   - Attendance automatically mark होती है
   - Payment processing होती है

### बैकएंड में:
- API: `POST /driver/trips/:tripId/start` - Location sharing enable
- API: `POST /driver/location` - Location updates (Real-time)
- Socket.io: Location updates broadcast होते हैं
- Database: **DriverLocation** table में सभी updates

---

## **चरण 8: Reporting और Billing**

### Reports देखना:
1. **"Reports"** सेक्शन में:
   - Daily attendance reports
   - Route efficiency reports
   - Vehicle utilization
   - Driver performance

### Billing:
1. **"Invoicing"** खोलो
2. Month के लिए invoice auto-generate होता है
3. Invoice में:
   - Active days count
   - Per day rate
   - Total amount
4. Corporate को invoice भेज सकते हो

### बैकएंड में:
- API: `GET /b2b-partner/reports`
- API: `GET /b2b-partner/invoices`
- Database: सभी **Trip** records count होती हैं
- Calculation: Number of days × per day rate

---

# 👥 FLOW 5: CORPORATE_EMPLOYEE (कर्मचारी / यात्री)

## **चरण 1: Company से Invite पाना**

### क्या होता है:
1. अपने company के HR से email invite मिलता है
2. Email में एक link होता है
3. Link पर click करते हो

---

## **चरण 2: Account Create करना**

### Sign Up पेज पर:
1. अपनी details:
   - Name (company के records से pre-filled हो सकता है)
   - Employee ID
   - Residential address
   - Phone number
   - Password set करो
2. **Create Account** दबाओ
3. Email verification करो

### बैकएंड में:
- API: `POST /corporate-employees/register`
- Database: **CorporateEmployee** में record create होता है
- Role: "CORPORATE_EMPLOYEE" assign होता है

---

## **चरण 3: Assigned Route देखना**

### Dashboard खोलते ही:
1. **"My Route"** या **"Transportation"** सेक्शन
2. अपना assigned route दिखता है:
   - Pickup time
   - Pickup location
   - Drop location
   - Vehicle details
   - Driver name और contact
   - Expected arrival time

---

## **चरण 4: Daily Travel**

### हर दिन सुबह:
1. App खोलो
2. **"Today's Trip"** सेक्शन में:
   - Route details
   - Bus location (Real-time GPS tracking)
   - Driver contact
3. Bus के आने से 5 min पहले notification मिलता है
4. Time पर pickup point पर पहुँचो

### Travel के दौरान:
1. Location tracking देख सकते हो
2. Driver से contact कर सकते हो
3. Any issue report कर सकते हो

### बैकएंड में:
- API: `GET /corporate-employee/today-trip` - आज की trip info
- Socket.io: Real-time location updates आते हैं
- Database: Attendance automatic mark होती है जब employee ride करता है

---

## **चरण 5: Ratings और Feedback**

### Trip के बाद:
1. **"Rate Your Trip"** modal खुलता है
2. Rating दो:
   - Driver rating (1-5 stars)
   - Vehicle cleanliness
   - Route quality
   - Punctuality
3. Optional comment/complaint
4. **Submit** करो

### बैकएंड में:
- API: `POST /trips/:tripId/ratings`
- Database: **Rating** में save होता है
- Driver की overall rating update होती है

---

## **चरण 6: Other Features**

### Travel History:
1. **"My Travel History"** से सभी पिछली trips देख सकते हो
2. हर trip के लिए:
   - Date, time
   - Route details
   - Your rating

### Complaints:
1. **"Report Issue"** से कोई problem report कर सकते हो:
   - Driver behavior
   - Vehicle issues
   - Route timing
   - Other complaints

### Wallet (यदि Premium employee हो):
1. **"Wallet"** से balance देख सकते हो
2. Extra travel के लिए add-on charges pay कर सकते हो

### बैकएंड में:
- API: `GET /corporate-employee/travel-history`
- API: `POST /complaints`
- API: `GET /wallet/balance`

---

# 🚗 B2C_PARTNER_DRIVER (व्यक्तिगत ड्राइवर)

## **चरण 1: B2C Partner के लिए Register करें**

### क्या होता है:
1. B2C Partner आपको add करता है अपने Fleet में
2. आपको invitation email मिलता है
3. आप उस link से sign up करते हो

### Sign Up में:
- नाम, फोन, address
- License number और validity
- Experience
- Documents (DL, Police Clearance)

### बैकएंड में:
- API: `POST /b2c-partner/drivers`
- Database: **B2CPartnerDriver** में record
- Role: "B2C_PARTNER_DRIVER" assign होता है

---

## **चरण 2: Daily Trip Accept करना**

### हर सुबह:
1. **"Today's Trips"** section खोलो
2. B2C Partner ने आपको जो routes assign किए उन सभी trips दिखते हैं:
   - Route name
   - Pickup points
   - Passenger names (जो confirmed हो गए)
   - Pickup time
   - Drop-off locations

### क्या करते हो:
1. **"Accept Trip"** दबाओ
2. Vehicle condition check करो (pre-trip checklist):
   - Fuel level
   - Tire condition
   - AC/Heater working
   - Safety equipment
3. सभी कुछ ठीक हो तो **"Trip Ready"** mark करो

### बैकएंड में:
- API: `GET /b2c-trips/driver/daily-assignments` - आपके trips
- API: `POST /b2c-trips/trips/:tripId/accept` - Trip accept करना
- Database: **B2CPartnerTrip** status update होती है

---

## **चरण 3: Trip शुरु करना और Location Sharing**

### Trip के दिन:
1. सभी passengers को pickup point पर pick करो
2. सभी आ जाने के बाद **"Start Trip"** दबाओ
3. तुरंत **Location Sharing** activate हो जाती है:
   - GPS location हर 10 सेकंड update होता है
   - सभी passengers को real-time location दिखता है
   - B2C Partner को भी दिखता है

### Travel के दौरान:
- रूट follow करो जो दिया गया है
- Intermediate stops पर सही समय पर रुको
- Final destination पर सभी को drop करो

### बैकएंड में:
- API: `POST /b2c-trips/trips/:tripId/start` - Trip शुरु करना
- API: `POST /driver/location` - Location updates (Real-time, every 10 seconds)
- Socket.io: Location broadcast होता है
- Database: **DriverLocation** में सभी coordinates save होते हैं

---

## **चरण 4: Trip Complete करना**

### Trip खत्म होने पर:
1. Final destination पर सभी passengers को drop करो
2. **"Trip Completed"** दबाओ
3. Passengers count confirm करो (जो चढ़े थे)
4. Trip का feedback/notes add कर सकते हो (optional)

### क्या update होता है:
- Location sharing automatically बंद हो जाती है
- Attendance सभी passengers के लिए automatically mark हो जाती है
- Trip duration और distance automatically calculate होते हैं

### बैकएंड में:
- API: `POST /b2c-trips/trips/:tripId/complete`
- Database: **B2CPartnerTrip** status: "COMPLETED"
- **Attendance** table में सभी passengers की entries
- Payment processing तुरंत होती है

---

## **चरण 5: Ratings और Reviews मिलना**

### Trip के बाद:
1. Passengers आपको rate कर सकते हैं:
   - Driving quality
   - Vehicle condition
   - Behavior
   - Punctuality
2. आपकी overall rating update होती है
3. अगर कोई complaint आए तो notification मिलता है

### बैकएंड में:
- API: `GET /driver/ratings` - आपकी सभी ratings
- Database: **DriverRating** से average calculate होता है
- Low rating पर alert B2C Partner को

---

## **चरण 6: Earnings और Payment**

### महीने के अंत में:
1. **"Earnings"** section में:
   - Total trips completed
   - Total passengers served
   - Total earnings
   - Commission breakdown
2. Payment directly आपके bank account में जाती है

### बैकएंड में:
- API: `GET /driver/earnings`
- Database: सभी **B2CPartnerTrip** records calculate होती हैं
- Formula: Per trip rate × Number of trips × Commission percentage

---

# 👨‍💼 B2B_PARTNER_DRIVER (परिवहन कंपनी का ड्राइवर)

## **चरण 1: B2B Partner के लिए Join करना**

### Registration:
1. B2B Partner (transportation company) आपको add करता है
2. आपको email invitation मिलता है
3. Sign up करते हो अपनी details के साथ:
   - Full name
   - Phone number
   - License number (Driving License)
   - License expiry date
   - Years of experience
   - Documents (DL, Police Clearance, Medical Certificate)

### बैकएंड में:
- API: `POST /b2b-partner/drivers`
- Database: **B2BPartnerDriver** में record
- Role: "B2B_PARTNER_DRIVER"

---

## **चरण 2: Assigned Contracts और Routes देखना**

### Dashboard खोलते ही:
1. **"My Contracts"** section
2. यह दिखता है कि आप किस corporate client के लिए काम करते हो:
   - Corporate name
   - Assigned route
   - Working days
   - Shift timing
   - Vehicle assigned

### क्या information मिलता है:
- Route details (from-to location)
- Pickup and drop points
- Schedule (कौन से दिन, कौन सा समय)
- Employee list (कितने employees pick करने हैं)

### बैकएंड में:
- API: `GET /b2b-driver/assignments` - आपकी contracts
- Database: **Contract** से linked routes fetch होते हैं

---

## **चरण 3: Daily Trip Management**

### हर सुबह:
1. **"Today's Trips"** खोलो
2. आपको अपनी assigned routes की सभी trips दिखती हैं:
   - Employee count जिन्हें pick करना है
   - Pickup locations
   - Pickup time
   - Drop location

### Pre-Trip Checks:
1. Vehicle का condition check करो
2. Fuel, tires, AC सब check करो
3. **"Ready for Trip"** mark करो

### Trip शुरु करना:
1. सभी employees को right locations पर pick करो
2. सभी के बाद **"Start Trip"** दबाओ
3. GPS location sharing activate हो जाता है
4. Corporate को भी location दिखता है

### बैकएंड में:
- API: `GET /b2b-driver/daily-trips` - आपके trips
- API: `POST /b2b-driver/trips/:tripId/start`
- API: `POST /driver/location` - Real-time location updates
- Socket.io: Live tracking for corporate employee

---

## **चरण 4: During Trip - Attendance Marking**

### Hर pickup point पर:
1. Employee चढ़ते ही उन्हें app में mark करो
2. अगर कोई नहीं आया तो **"Mark as No-Show"** करो
3. यह information corporate को जाती है

### Route के दौरान:
- सभी intermediate stops को accurately follow करो
- Location continuously update होती है
- Corporate employees को push notification मिलते हैं

### बैकएंड में:
- API: `POST /attendance/mark`
- Database: **Attendance** में सभी entries
- Email: Corporate को daily attendance report

---

## **चरण 5: Trip Complete और Handoff**

### Office/Drop location पर:
1. सभी employees को safely drop करो
2. **"Complete Trip"** दबाओ
3. Final passenger count confirm करो
4. Any issues note करो (vehicle issue, delay, etc.)

### क्या automatically होता है:
- Location sharing बंद हो जाती है
- Attendance सभी के लिए finalized हो जाती है
- Trip duration और distance calculate होता है
- Payment के लिए ready हो जाता है

### बैकएंड में:
- API: `POST /b2b-driver/trips/:tripId/complete`
- Database: **Trip** status: "COMPLETED", **Attendance** finalized
- Notifications: Corporate को completion confirmation

---

## **चरण 6: Ratings और Performance**

### End of trip:
1. Corporate employees आपको rate कर सकते हैं:
   - Driving quality
   - Punctuality
   - Vehicle condition
   - Behavior/Professionalism
2. Average rating calculate होती है

### Performance Tracking:
1. B2B Partner को आपका performance दिखता है:
   - On-time arrival percentage
   - No-show complaints
   - Safety record
   - Customer ratings

### बैकएंड में:
- API: `GET /b2b-driver/performance`
- Database: सभी trips के metrics aggregate होते हैं

---

## **चरण 7: Monthly Payments और Reports**

### Month के अंत में:
1. **"Payment & Reports"** section
2. दिखता है:
   - Total days worked
   - Total trips completed
   - Total passengers transported
   - Per day rate
   - Gross earning
   - Any deductions (fuel, maintenance, etc.)
   - Net payment

### Payment Method:
- Direct bank transfer
- या company के माध्यम से check

### बैकएंड में:
- API: `GET /b2b-driver/monthly-statement`
- Database: सभी **Trip** records aggregate होती हैं
- Calculation: Days worked × Daily rate - Deductions

---

# 🚗 CORPORATE_DRIVER (कंपनी का ड्राइवर)

## **चरण 1: Company द्वारा Hire करना**

### Registration:
1. Corporate company आपको hire करता है
2. आपको invitation मिलता है
3. Sign up करते हो:
   - Personal details
   - License information
   - Experience
   - Documents

### बैकएंड में:
- API: `POST /corporate/drivers`
- Database: **CorporateDriver** record
- Role: "CORPORATE_DRIVER"

---

## **चरण 2: Assigned Routes और Employees**

### Dashboard:
1. अपना **"Assigned Route"** देख सकते हो:
   - Which location to which location
   - Pickup and drop points
   - Schedule (कौन से दिन, कौन सा समय)
   - Total employees to transport

### Employee List:
1. **"My Passengers"** section
2. सभी employees की list जिन्हें हर दिन pick करना है

### बैकएंड में:
- API: `GET /corporate-driver/assignment` - आपकी route info
- Database: Route details corporate contract से fetch होती हैं

---

## **चरण 3: Daily Operations - Exactly B2B के जैसे**

### हर दिन:
1. Morning में **"Today's Trip"** खोलो
2. Vehicle check करो
3. Pickup points पर जाओ और employees को pick करो
4. **"Start Trip"** करो - GPS activate हो जाती है
5. Route follow करो
6. Employees को final destination पर drop करो
7. **"Complete Trip"** करो

### Attendance:
- हर employee को mark करते हो जब वह चढ़ता है
- Corporate को real-time attendance दिखती है

### बैकएंड में:
- API: `GET /corporate-driver/daily-trip`
- API: `POST /corporate-driver/trip/start`
- API: `POST /corporate-driver/trip/complete`
- Socket.io: Real-time location updates

---

## **चरण 4: Ratings और Feedback**

### Employees rate कर सकते हैं आपको
- Punctuality
- Behavior
- Vehicle cleanliness
- Safe driving

### Performance visible है:
- अपना average rating देख सकते हो
- Company को भी आपका performance दिखता है

---

## **चरण 5: Monthly Salary और Benefits**

### Month के अंत:
1. **"Payroll"** section में:
   - Days worked
   - Salary amount
   - Allowances
   - Deductions
   - Net salary

### Direct bank transfer होती है

---

# 🔐 ADMIN PANEL - Complete Overview

## Admin के पास ये सभी powers हैं:

### 1. **User Management**
- सभी users देख सकते हैं
- Users को verify कर सकते हैं
- Suspicious accounts को block कर सकते हैं

### 2. **B2C Route Management**
- सभी routes की list देख सकते हैं
- Route को suspend/activate कर सकते हैं
- Reports देख सकते हैं

### 3. **Contract Management**
- सभी contracts देख सकते हैं
- Contract disputes handle कर सकते हैं
- Billing issues resolve कर सकते हैं

### 4. **Financial Reports**
- Payment collection status
- Commission breakdown
- Revenue analytics
- Refund management

### 5. **Complaint Management**
- सभी complaints देख सकते हैं
- Priority set कर सकते हैं
- Resolution track कर सकते हैं

### 6. **Analytics & Reports**
- Active users count
- Daily bookings
- Revenue trends
- Growth metrics

---

## 🔄 Real-Time Features (सभी के लिए)

### Socket.io के through:
1. **Location Tracking** - Drivers का GPS location
2. **Notifications** - Real-time push notifications
3. **Chat** - Driver से direct communication
4. **Availability Updates** - Seats की real-time status

---

## 💳 Payment Flow (सभी के लिए)

### Payment Methods:
1. **Credit/Debit Card** - Stripe gateway
2. **Wallet** - In-app balance
3. **TAP Payment** - Middle East payments
4. **Wire Transfer** - B2B के लिए

### Refund Process:
1. Cancellation करते ही refund initiate होता है
2. 3-5 business days में amount wallet में आता है
3. या bank account में transfer होता है

---

## ✅ All Major API Endpoints

### Auth APIs:
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`

### Booking APIs:
- `POST /bookings/b2c` - B2C booking
- `GET /bookings/passenger` - यात्री की bookings
- `GET /bookings/partner` - B2C Partner की bookings

### Trip APIs:
- `GET /b2c-trips/trips/today` - आज की trips
- `POST /b2c-trips/trips/:id/start` - Trip शुरु करना
- `POST /b2c-trips/trips/:id/complete` - Trip खत्म करना

### Corporate APIs:
- `POST /corporate/employees` - Employee add करना
- `GET /corporate/attendance` - Attendance report
- `GET /corporate/invoices` - Billing invoices

---

## 🎯 Summary: हर User की सफलता की रणनीति

### **COMMUTER**: अपनी subscription सही समय पर renew करो, कोई issue हो तो report करो
### **B2C_PARTNER**: Daily trips सही से manage करो, quality maintain करो, drivers को properly guide करो
### **B2C_PARTNER_DRIVER**: Safely और on-time सभी passengers को pick-drop करो, location sharing सही से करो
### **B2B_PARTNER**: Contracts properly execute करो, employees के लिए best service दो, reports on time submit करो
### **B2B_PARTNER_DRIVER**: Punctuality maintain करो, attendance properly mark करो, corporate को good experience दो
### **CORPORATE**: Employees को proper support दो, payment on time करो, performance track करो
### **CORPORATE_DRIVER**: Schedule का पालन करो, employees का care लो, safe driving maintain करो
### **CORPORATE_EMPLOYEE**: Regularly travel करो, feedback दो, issues report करो, rating दो
### **ADMIN**: सभी users को support दो, disputes resolve करो, quality maintain करो, system को smooth रखो

---

**अंतिम नोट**: हर user role के लिए proper communication और support system है। अगर कोई issue है तो Support section में contact कर सकते हो।
