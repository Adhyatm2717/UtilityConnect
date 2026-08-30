# UtilityConnect — Mall & Home Utility Services Aggregator

UtilityConnect is a full-stack web platform connecting residential customers and commercial mall facilities with verified local utility service professionals (Electricians, Plumbers, Carpenters, Tailors, Maintenance Staff).

---

## Problem Statement

Locating trustworthy, skilled utility service providers for home repairs and commercial facility upkeep is traditionally fragmented and unreliable. Customers face pricing ambiguity, unverified service quality, and a lack of job tracking. UtilityConnect bridges this gap by aggregating verified local providers into a single platform featuring real-time status tracking, role-based access control, ratings, dispute management, and commercial maintenance dispatch.

---

## Key Features

### Customer
- **Service Discovery**: Browse utility categories (Electrician, Plumber, Carpenter, Tailor, Maintenance) with search and filters.
- **Provider Profiles**: View verified provider details, experience, skills, pricing, and ratings.
- **Booking Flow**: Multi-step service booking with schedule selection and location details saved directly to MongoDB.
- **Customer Dashboard**: Overview of active upcoming bookings, status tracker timeline, service history, and recommended providers.
- **Reviews & Ratings**: Submit 1–5 star reviews and feedback on completed bookings; automatically updates provider average rating.
- **Dispute Resolution**: Raise complaints on bookings for admin review.

### Service Provider
- **Provider Registration & Profile**: Register with service categories; manage pricing, skills, experience, location, and bio.
- **Availability Toggle**: Instant switch between "Available" and "Unavailable" persisted in MongoDB.
- **Job Management**: Incoming request management (**Accept** / **Reject**), active job updates (**Start Job** → **Mark as Completed**).
- **Commercial Maintenance Jobs**: Receive and manage assigned mall maintenance requests alongside residential bookings.
- **Earnings Breakdown**: Live calculation of earnings (Today, Week, Month, Total) computed from MongoDB data.

### Admin
- **Admin Dashboard**: Real-time platform metrics (Total Users, Verified Providers, Pending Approvals, Active Bookings, Completed Jobs, Average Rating).
- **Provider Verification**: Review pending provider applications with **Approve** and **Reject** controls. Only verified providers appear in customer discovery.
- **Booking Monitoring**: System-wide booking surveillance with status, service, and date filtering.
- **Dispute Management**: Inspect customer disputes and mark them **Under Review** or **Resolved**.
- **System Analytics**: Platform breakdown of users, provider statuses, bookings, and commercial requests.

### Commercial / Mall Maintenance
- **Mall Dashboard**: Commercial maintenance management overview (Open Requests, Assigned, In Progress, Completed Today, High Priority).
- **Create Maintenance Request**: Log facility requests with Mall Name, Floor, Unit/Area, Service Type, Priority (Low, Medium, High, Emergency), and Description.
- **Provider Assignment**: Assign verified technicians to commercial requests.
- **Commercial Request Tracking**: Visual status progression (`Requested` → `Assigned` → `In Progress` → `Completed`).

---

## Technology Stack

- **Frontend**: React.js, JavaScript, HTML5, CSS3, Tailwind CSS, Vite, React Router
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs
- **Database**: MongoDB, Mongoose ODM
- **API Architecture**: REST APIs with role-based middleware (`customer`, `provider`, `admin`)

---

## Project Structure

```text
UtilityConnect/
├── client/                     # React Frontend
│   ├── public/
│   └── src/
│       ├── components/         # Header, Rating, FilterPanel, ProtectedRoute, Booking steps
│       ├── context/            # AuthContext (JWT & User state)
│       ├── data/               # Static provider seed data
│       ├── pages/              # Home, ServiceListing, ProviderProfile, BookingFlow,
│       │                       # CustomerDashboard, BookingDetails, ProviderDashboard,
│       │                       # AdminDashboard, CommercialDashboard, LoginPage, SignupPage
│       ├── App.jsx             # React Router setup & protected routes
│       └── main.jsx            # Entry point
│
└── server/                     # Express Backend
    ├── config/                 # Database connection (db.js)
    ├── controllers/            # authController, bookings, providers, reviews, adminController, maintenanceController, disputeController
    ├── middleware/             # auth.js (verifyToken, requireRole)
    ├── models/                 # User, Provider, Booking, Review, Service, Dispute, MaintenanceRequest
    ├── routes/                 # auth, bookings, providers, reviews, admin, maintenance, disputes
    ├── scripts/                # Seed script
    └── server.js               # Express server entry point
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port `27017` or MongoDB Atlas URI)

### Installation

1. **Clone Repository & Install Server Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install Client Dependencies**:
   ```bash
   cd ../client
   npm install
   ```

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and update values:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/utilityconnect
JWT_SECRET=utilityconnect_dev_secret_key_2026
JWT_EXPIRES_IN=7d
```

---

## Running Locally

### Start Backend Server
```bash
cd server
npm start
# or with file watching:
npm run dev
```
Backend runs at: `http://localhost:5001`

### Start Frontend Client
```bash
cd client
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## API Health Check

```http
GET http://localhost:5001/api/health
```
Response:
```json
{ "message": "Server is running" }
```

---

## Future Enhancements
- **Online Payment Gateway**: Integration with Razorpay / Stripe for online digital payments.
- **Native Mobile Application**: iOS and Android mobile apps using React Native.
- **AMC Contracts**: Annual Maintenance Contracts for residential societies and malls.
- **Real-Time Messaging**: WebSockets / Socket.io for direct chat between customer and provider.
- **AI Recommendations**: Machine learning recommendation engine based on location proximity and user history.
