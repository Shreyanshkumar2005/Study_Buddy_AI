# StudyBuddy – AI Study Assistant
> **MERN Stack Capstone Project (Topic #10)**

StudyBuddy is a comprehensive AI-powered study companion designed for students and educators. Students can create and organize rich academic notes, generate structured executive summaries, and produce interactive multiple-choice practice quizzes with automated scoring and detailed explanations. Administrators have access to a real-time analytics dashboard powered by MongoDB aggregation pipelines to monitor daily AI utilization, request latency, and user activity.

---

## 📑 Table of Contents
1. [Project Overview & Key Features](#-key-features)
2. [Mandatory Evaluation Checklist](#-mandatory-evaluation-checklist)
3. [Architecture & Tech Stack](#-architecture--tech-stack)
4. [Project Structure](#-project-structure)
5. [Environment Variables](#-environment-variables)
6. [Quick Start & Setup Guide](#-quick-start--setup-guide)
7. [Default Demo Credentials](#-default-demo-credentials)
8. [API Documentation](#-api-documentation)
9. [Database Schema & Aggregations](#-database-schema--aggregations)
10. [Postman Collection](#-postman-collection)

---

## 🌟 Key Features

### For Students
- **Smart Note Management:** Full CRUD operations for academic notes with categories, subjects, and tag-based searching and filtering.
- **AI-Powered Summaries:** Server-side synthesis utilizing the Fetch API to produce executive summaries and core conceptual takeaways.
- **Interactive Practice Quizzes:** Automatically generates multiple-choice quizzes derived from note content with instant scoring, feedback, and explanations.
- **Request History & Audit:** Review all previously generated AI summaries and practice tests without consuming redundant quota.

### For Administrators
- **Telemetry & Aggregation:** Real-time analytics displaying **requests per user per day**, feature breakdown (summaries vs. quizzes), and daily volume trends.
- **Role-Based Access Control (RBAC):** Strict middleware protecting administrative routes from unauthorized access.
- **User Directory:** Overview of all registered accounts and role privileges.

### Backend Infrastructure
- **Custom Rate-Limiting Middleware:** In-memory sliding-window rate limiter built from scratch (no external packages) to prevent AI quota abuse.
- **Secure Dual-Token Authentication:** Passwords hashed with `bcrypt` (10 rounds); short-lived JWT access tokens (15m) and persistent refresh tokens (7d).
- **Centralized Error Handling:** Global middleware with standardized HTTP error responses catching Mongoose validation errors, duplicate keys, expired tokens, and upstream AI failures.

---

## 🏆 Mandatory Evaluation Checklist

| Requirement | Implementation in StudyBuddy | Verified |
|---|---|:---:|
| **MVC Folder Structure** | `models/`, `controllers/`, `routes/`, `middleware/`, `config/`, `utils/` | ✅ |
| **Environment Variables** | Handled in `.env` (guarded by `.gitignore`, with `.env.example` provided) | ✅ |
| **Bcrypt & Dual JWT Tokens** | Bcrypt hashing + access tokens (`15m`) & refresh tokens (`7d`) | ✅ |
| **Protected & RBAC Routes** | `verifyToken` middleware + `requireRole('admin')` guard | ✅ |
| **Mongoose Validation & Relational Modeling** | Relational references (`User` → `Note` → `AIRequest`), schema validation | ✅ |
| **Aggregation Pipelines & Indexing** | Requests per user per day aggregation pipeline; compound and text indexes | ✅ |
| **Custom Rate-Limiting** | Student-built sliding window middleware chained on AI endpoints | ✅ |
| **Server-Side Fetch API AI Call** | Standard `fetch` integration to Gemini REST API with intelligent offline fallback | ✅ |
| **Centralized Error Handling** | Global Express error handler returning clean JSON error responses | ✅ |
| **React Frontend** | React + React Router + Context API (`AuthContext`, `NoteContext`) + controlled forms | ✅ |
| **Postman Collection & ER Diagram** | `studybuddy_postman_collection.json` & `DATABASE_SCHEMA.md` | ✅ |

---

## 🛠 Architecture & Tech Stack

- **Backend:** Node.js, Express 5, MongoDB, Mongoose 9, BcryptJS, JSONWebToken, Dotenv, CORS
- **Frontend:** React 19, React Router v7, Context API, Lucide Icons, Vite
- **AI Service:** Google Gemini REST API (called using native Fetch API) + local deterministic synthesis fallback
- **Testing:** Integration E2E suite (`npm run test:e2e`) + Postman Collection

---

## 📂 Project Structure

```text
capstone_project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── adminController.js    # Aggregation pipelines & administrative metrics
│   │   ├── aiController.js       # AI summary & quiz generation endpoints
│   │   ├── authController.js     # Register, login, refresh token, profile
│   │   └── noteController.js     # Notes CRUD, filtering, and search
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification
│   │   ├── errorHandler.js       # Centralized error handler
│   │   ├── rateLimiter.js        # Custom in-memory rate-limiting middleware
│   │   └── roleMiddleware.js     # Role-based access control (RBAC)
│   ├── models/
│   │   ├── AIRequest.js          # AI generation audit log schema & indexes
│   │   ├── Note.js               # Study note schema with compound & text indexes
│   │   └── User.js               # User account schema with bcrypt pre-save hook
│   ├── routes/
│   │   ├── adminRoutes.js        # Admin protected routes
│   │   ├── aiRoutes.js           # Chained AI generation routes
│   │   ├── authRoutes.js         # Authentication routes
│   │   └── noteRoutes.js         # Notes CRUD routes
│   ├── utils/
│   │   ├── aiService.js          # Native Fetch API AI client & fallback generator
│   │   └── tokenUtils.js         # JWT token generator and verification helpers
│   ├── .env.example              # Template for environment variables
│   ├── package.json              # Backend dependencies and scripts
│   ├── seed.js                   # Database seeder with sample notes & AI telemetry
│   ├── server.js                 # Express application entry point
│   └── test_integration.js       # Comprehensive E2E automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/           # Navbar, ProtectedRoute, NoteModal, QuizModal, SummaryModal
│   │   ├── context/              # AuthContext.jsx, NoteContext.jsx
│   │   ├── pages/                # Login, Register, NotesDashboard, AIHistoryPage, AdminDashboard
│   │   ├── services/             # api.js (Fetch API wrapper with auto-refresh interceptor)
│   │   ├── App.jsx               # App routes & layout
│   │   ├── index.css             # Polished custom stylesheet
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html
│   ├── package.json
│   └── vite.config.js            # Vite config with backend proxy
├── DATABASE_SCHEMA.md            # Database schema details & Mermaid ER Diagram
├── studybuddy_postman_collection.json # Exported Postman API collection
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```ini
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/studybuddy
JWT_ACCESS_SECRET=studybuddy_jwt_access_super_secret_key_2026
JWT_REFRESH_SECRET=studybuddy_jwt_refresh_super_secret_key_2026
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MINUTES=15
```

> **Note:** If `GEMINI_API_KEY` is omitted or empty, the built-in deterministic AI synthesis engine automatically handles requests so all features run seamlessly out of the box!

---

## 🚀 Quick Start & Setup Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB instance (local or MongoDB Atlas)

### 2. Backend Setup
```bash
cd backend
npm install

# Seed the database with sample users, notes, and AI telemetry
npm run seed

# Run the automated E2E integration test suite
npm run test:e2e

# Start the backend server
npm run dev
# Server will be listening on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start the Vite development server
npm run dev
# Frontend will be running on http://localhost:3000
```

---

## 👥 Default Demo Credentials

Pre-populated via `npm run seed`:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Student** | `student@studybuddy.test` | `Password123!` | Create notes, AI summaries, AI practice quizzes, view history |
| **Student 2** | `sarah.student@university.edu` | `Password123!` | Personal notes & AI generation |
| **Admin** | `admin@studybuddy.test` | `AdminPass123!` | Full admin telemetry, aggregation metrics, user directory |

*The login page also provides one-click demo login buttons for quick testing.*

---

## 📡 API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (returns user + tokens) |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `POST` | `/api/auth/refresh` | Public | Exchange refresh token for fresh access token |
| `GET` | `/api/auth/me` | Protected | Get authenticated profile |
| `POST` | `/api/auth/logout` | Protected | Invalidate refresh token and logout |

### Notes Management (`/api/notes`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/notes` | Protected | List user notes (supports `?search=`, `?subject=`, pagination) |
| `GET` | `/api/notes/subjects` | Protected | Retrieve unique subjects for current user |
| `GET` | `/api/notes/:id` | Protected | Get note details by ID (ownership checked) |
| `POST` | `/api/notes` | Protected | Create new note (title, content, subject, tags) |
| `PUT` | `/api/notes/:id` | Protected | Update existing note |
| `DELETE`| `/api/notes/:id` | Protected | Delete note |

### AI Assistant (`/api/ai`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/ai/summary/:noteId` | Protected + Rate Limited | Generates executive summary and bullet points |
| `POST` | `/api/ai/questions/:noteId`| Protected + Rate Limited | Generates structured multiple-choice quiz questions |
| `GET` | `/api/ai/history` | Protected | List past AI requests with pagination |

### Admin Telemetry (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/overview` | Admin Only | System-wide counts (users, notes, requests) |
| `GET` | `/api/admin/usage-stats`| Admin Only | **MongoDB Aggregation: requests per user per day** |
| `GET` | `/api/admin/users` | Admin Only | Directory of registered users and roles |

---

## 📊 Database Schema & Aggregations

Refer to [DATABASE_SCHEMA.md](file:///Users/shreyansh/Documents/web_dev/capstone_project/DATABASE_SCHEMA.md) for complete Mermaid diagrams, compound indexes, text indexes, and detailed aggregation pipelines.

---

## 📬 Postman Collection

Import the included Postman collection:
```
studybuddy_postman_collection.json
```
The collection includes pre-configured environment variables (`baseUrl`, `accessToken`, `refreshToken`, `noteId`) and test scripts that automatically capture and persist authentication tokens.

---

## 🚀 Production Deployment Guide

### Option 1: Full-Stack Single-Service on Render (Recommended)
This deploys both the Node/Express backend and React frontend together on a single Render Web Service:

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Create a Free MongoDB Atlas Database:**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
   - In "Database Access", create a database user and password.
   - In "Network Access", allow access from anywhere (`0.0.0.0/0`).
   - Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studybuddy?retryWrites=true&w=majority`
3. **Create a New Web Service on Render:**
   - Connect your GitHub repository.
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. **Set Environment Variables in Render Dashboard:**
   - `PORT`: `5001` (or leave default, Render sets `PORT` automatically)
   - `MONGODB_URI`: `your_mongodb_atlas_connection_string`
   - `JWT_ACCESS_SECRET`: `any_long_random_string`
   - `JWT_REFRESH_SECRET`: `any_different_long_random_string`
   - `GEMINI_API_KEY`: `your_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-3-flash-preview`
   - `RATE_LIMIT_MAX_REQUESTS`: `50`
   - `RATE_LIMIT_WINDOW_MINUTES`: `15`
5. **Click "Deploy Web Service":**
   Render builds the React frontend, starts Express, and serves both the API (`/api/*`) and React application seamlessly from your Render URL!

---

### Option 2: Decoupled Deploy (Backend on Render + Frontend on Vercel)

1. **Deploy Backend on Render:**
   - Create a Web Service pointing to your repo.
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - Add your environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`, etc.).
   - Copy your deployed backend URL: e.g. `https://studybuddy-api.onrender.com`.

2. **Deploy Frontend on Vercel:**
   - Import your repo on [vercel.com](https://vercel.com).
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Environment Variables:**
     - `VITE_API_BASE_URL`: `https://studybuddy-api.onrender.com`
   - Click **Deploy**.
   *(The included `frontend/vercel.json` and `frontend/public/_redirects` automatically handle client-side SPA route rewrites).*
