# 🚚 FleetTrack Enterprise — Commercial Fleet Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6.0%2B-brightgreen.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-v18.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.3-06B6D4.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**FleetTrack Enterprise** is a high-performance, full-stack fleet management and telemetry analytics solution designed for commercial logistics operations. Built with a robust **Node.js/Express** REST API, a hybrid **MongoDB** and **MariaDB/MySQL** database architecture, and a modern **React 18** frontend, FleetTrack enables real-time vehicle monitoring, driver lifecycle tracking, dispatch telemetry, compliance enforcement, and operational analytics.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication:** Secure stateless authentication using JSON Web Tokens with encrypted password hashing (`bcryptjs`).
- **Granular Roles:** Explicit permission barriers for `Admin`, `Manager`, and `Driver` roles.
- **Protected Routes:** Context-aware routing on both API endpoints and React UI routes.

### 🚛 2. Fleet Vehicle Management
- Full lifecycle CRUD operations for commercial assets (`VIN`, `Make`, `Model`, `Year`, `Fuel Type`, `Status`).
- Dynamic operational status tracking (`Active`, `Maintenance`, `In-Transit`, `Decommissioned`).
- High-efficiency MongoDB indexing for ultra-fast query responses across thousands of fleet assets.

### 👨‍✈️ 3. Driver Roster & Compliance Lifecycle
- Driver profile management including Commercial Driver's License (`CDL`) numbers and expiration alerts.
- Dynamic driver safety scoring based on telemetry event histories.
- Automated document expiration background jobs and automated flag warnings.

### 📍 4. Trip Dispatch & GPS Telemetry
- Real-time trip creation, origin/destination tracking, and driver assignment.
- Odometer logs and fuel efficiency calculation per trip.

### 🛠️ 5. Maintenance Logs & Cost Analytics
- Comprehensive service history tracking for preventative and corrective repairs.
- Cost reporting broken down by vehicle category, vendor, and scheduled intervals.

### 📊 6. Relational Analytics (MariaDB/MySQL Integration)
- Dual-database strategy: Unstructured telemetry in MongoDB; structured, financial, and fuel telemetry in MariaDB/MySQL.
- High-speed SQL indexing (`idx_fuel_vin_date`) and optimized queries for fuel consumption analytics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v18+) |
| **Framework** | Express.js |
| **Primary NoSQL Database** | MongoDB (v6.0+) via Mongoose ODM |
| **Relational Database** | MariaDB / MySQL via `mysql2/promise` |
| **Frontend UI** | React 18, Vite, Tailwind CSS |
| **Icons & Visuals** | Lucide React |
| **HTTP Client** | Axios (with Request Interceptors) |
| **State Management** | React Context API (`AuthContext`) |

---

## 📐 System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    React 18 Frontend                    │
│             (Vite + Tailwind CSS + Lucide)              │
└────────────────────────────┬────────────────────────────┘
                             │
                      REST API (HTTP/JSON)
                             │
┌────────────────────────────▼────────────────────────────┐
│                  Express.js API Server                  │
│   ┌───────────────────┬─────────────────────────────┐   │
│   │ Auth Middleware   │ Advanced Query Pagination   │   │
│   └───────────────────┴─────────────────────────────┘   │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
  Mongoose ODM │                           │ mysql2 Pool
               ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     MongoDB Database      │ │  MariaDB / MySQL Database │
│  (Users, Vehicles, Trips, │ │     (Fuel Telemetry &     │
│       Maintenance)        │ │    Financial Logs)        │
└───────────────────────────┘ └───────────────────────────┘
```

---

## 📁 Repository Structure

```text
FleetTrack/
├── backend/
│   ├── config/             # Database connection pools (Mongo & MySQL)
│   ├── controllers/        # Express route handlers
│   ├── middleware/         # Auth, RBAC, and Pagination middleware
│   ├── models/             # Mongoose schemas & data models
│   ├── routes/             # REST API endpoint definitions
│   ├── seed.js             # Seed script for initial Admin initialization
│   ├── server.js           # Express application entry point
│   └── package.json
├── frontend/
│   ├── public/             # Static web assets
│   ├── src/
│   │   ├── components/     # Reusable UI components (Sidebar, Navbar, Cards)
│   │   ├── context/        # React Auth Context Provider
│   │   ├── pages/          # View Pages (Dashboard, Vehicles, Drivers, etc.)
│   │   ├── services/       # Axios API client setup
│   │   └── App.jsx         # Main React application router
│   └── package.json
└── docs/
    └── progress.md         # Complete Development Milestones Log
```

---

## 🚀 Local Installation & Setup

Follow these steps to run FleetTrack Enterprise natively on your local development machine without containerization.

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)
- **MongoDB Server** (v6.0+ running locally on port `27017`)
- **MySQL / MariaDB** (Optional, running locally on port `3306`)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/FleetTrack.git
cd FleetTrack
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Path: backend/.env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/FleetTrack
MONGODB_URI=mongodb://127.0.0.1:27017/FleetTrack

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_2026
JWT_EXPIRE=1d

# Relational SQL Config (Optional / Local)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=fleettrack_sql
```

---

### Step 3: Install Dependencies & Seed Database

1. **Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Seed Default Admin Account:**
   Execute the seed script to create the initial administrative credentials:
   ```bash
   node seed.js
   ```

   *Output:*
   ```text
   MongoDB Connected for Seeding...
   ✅ Admin user created/reset successfully!
   -----------------------------------
    Email:    admin@fleettrack.com
    Password: Admin@123
   -----------------------------------
   ```

3. **Frontend Dependencies:**
   In a new terminal window:
   ```bash
   cd frontend
   npm install
   ```

---

### Step 4: Run Application

Start both the backend server and frontend development server:

* **Terminal 1 — Express Backend:**
  ```bash
  cd backend
  npm run dev
  ```
  *Backend will start on `http://localhost:5000`*

* **Terminal 2 — React Frontend:**
  ```bash
  cd frontend
  npm run dev
  ```
  *Frontend will be available at `http://localhost:5173`*

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@fleettrack.com` | `Admin@123` | Full Access (Vehicles, Drivers, Maintenance, Dispatch, Analytics) |

---

## 🔗 Key REST API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new fleet user
- `POST /api/auth/login` — Authenticate user and receive JWT
- `GET /api/auth/me` — Get current logged-in user context

### 🚛 Vehicle Management (`/api/vehicles`)
- `GET /api/vehicles` — Get paginated list of vehicles (supports `?page=1&limit=10&status=Active`)
- `POST /api/vehicles` — Add new fleet asset (`Admin` / `Manager`)
- `GET /api/vehicles/:id` — Get single vehicle details
- `PUT /api/vehicles/:id` — Update vehicle telemetry/status
- `DELETE /api/vehicles/:id` — Remove vehicle from roster (`Admin` only)

### 👨‍✈️ Driver Management (`/api/drivers`)
- `GET /api/drivers` — Fetch all driver profiles
- `POST /api/drivers` — Create driver profile
- `PUT /api/drivers/:id` — Update driver safety score or CDL info

### 📍 Dispatch & Trips (`/api/trips`)
- `GET /api/trips` — Fetch dispatch logs
- `POST /api/trips` — Create new trip dispatch

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details