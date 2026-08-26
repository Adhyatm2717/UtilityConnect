# UtilityConnect — Mall & Home Utility Services Aggregator

A platform that connects customers with verified local service providers like electricians, plumbers, carpenters, tailors, and maintenance staff — for homes, apartments, and commercial/mall spaces.

---

## Tech Stack

| Layer      | Technology          |
|------------|---------------------|
| Frontend   | React.js + Vite     |
| Styling    | Tailwind CSS        |
| Backend    | Node.js + Express   |
| Database   | MongoDB + Mongoose  |
| API Style  | REST                |

---

## Folder Structure

```
mall-home-utility-services/
├── client/               # React frontend
│   ├── public/
│   └── src/
│       ├── components/   # Reusable UI components (Header, etc.)
│       ├── pages/        # Full pages (Home, Services, etc.)
│       ├── services/     # API call functions
│       ├── App.jsx       # Router + layout
│       └── main.jsx      # Entry point
│
├── server/               # Express backend
│   ├── config/           # DB connection
│   ├── controllers/      # Route handler logic
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express routes
│   └── server.js         # Server entry point
│
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Install Frontend Dependencies

```bash
cd client
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your values:

```bash
cd server
copy .env.example .env
```

Then edit `.env` with your MongoDB URI.

---

## Running the App

### Start the Frontend

```bash
cd client
npm run dev
```

Runs at: http://localhost:5173

### Start the Backend

```bash
cd server
npm start
```

Runs at: http://localhost:5000

---

## Required Environment Variables (server/.env)

| Variable      | Description                          |
|---------------|--------------------------------------|
| `PORT`        | Port for the Express server (default 5000) |
| `MONGODB_URI` | Your MongoDB connection string       |

---

## API Health Check

```
GET http://localhost:5000/api/health
```

Response:
```json
{ "message": "Server is running" }
```
