# Technical Project Report & Architecture Abstract
**Project Name:** GetResume AI — AI-Powered Resume Builder & Candidate Matching Platform  
**Architecture:** MERN Stack (MongoDB, Express.js, React.js, Node.js) with Tailwind CSS v4 & Groq AI Engine  

---

## 1. Project Abstract & Overview

**GetResume AI** is an enterprise-grade AI resume builder, diagnostic ATS optimizer, and candidate matching platform designed for students and job recruiters/admins.

Key capabilities include:
- **Interactive Resume Builder**: Drag/edit sections, live high-resolution preview, custom templates (Minimalist ATS default, Professional Classic, Modern, Ocean, Emerald).
- **Research-Backed ATS Diagnostics Engine**: Real-time 5-factor scoring model measuring keyword intersection, quantitative impact (Google XYZ formula), active verb usage, section completeness, and word count formatting.
- **AI Resume Optimization (Groq LLM)**: One-click AI enhancement of summaries, experience bullet points, and missing keyword integration.
- **Admin Candidate Recommendation System**: AI/ATS matching engine that automatically ranks all registered student resumes against open job postings for recruiters.
- **Real-Time Profile Synchronization**: Uniform synchronization between resume inputs, user profiles, and identity locks.
- **High-Fidelity PDF Exporter**: Dynamic HTML-to-PDF rendering with computed style resolution to preserve modern CSS styling.

---

## 2. Codebase File Structure & Module Directory

```
GETRESUMEAIFINAL-main/
├── client/                      # React Frontend Application (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable Component Architecture
│   │   │   ├── builder/        # Resume Builder forms, sidebars, & AI Panel
│   │   │   │   ├── AIPanel.jsx            # Groq AI optimizer interface & circular gauge
│   │   │   │   ├── AtsReportSidebar.jsx   # ATS Diagnostics Report side drawer
│   │   │   │   ├── ChatbotSidebar.jsx     # AI Assistant floating chat interface
│   │   │   │   ├── PreviewSection.jsx     # Live template preview renderer
│   │   │   │   └── forms/                 # Section input forms (PersonalInfo, Skills, Experience, etc.)
│   │   │   ├── common/         # Inputs, Buttons, Navbar, & ProtectedRoute
│   │   │   └── dashboard/      # Resume cards, sidebars, and template pickers
│   │   ├── context/            # React Contexts (AuthContext, ResumeContext)
│   │   ├── pages/              # Core Application Routes
│   │   │   ├── Builder/        # Main interactive Builder page (`/builder`)
│   │   │   ├── Dashboard/      # Main User Dashboard page (`/dashboard`)
│   │   │   ├── Jobs/           # Hiring Board & Admin Candidate Recommendations (`/jobs`)
│   │   │   ├── Landing/        # Public Hero & feature showcase (`/`)
│   │   │   ├── Profile/        # User Account Settings & Profile Sync (`/profile`)
│   │   │   ├── Templates/      # Resume Template Gallery (`/templates`)
│   │   │   └── Tests/          # Candidate Skill Assessment Modules (`/test`)
│   │   ├── ResumeTemplates/    # Dynamic HTML Resume Templates (ATS, Creative, Modern, Classic)
│   │   ├── routes/             # AppRouter route mapping & protection logic
│   │   ├── services/           # API integrations (authService, groqService)
│   │   ├── store/              # Zustand global state (`useResumeStore.js`)
│   │   └── utils/              # Client utilities (`atsScorer.js`, `pdfGenerator.js`)
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Node.js + Express.js Backend Application
    ├── src/
    │   ├── config/             # Database connection (`db.js`)
    │   ├── controllers/        # Business logic controllers
    │   │   ├── adminController.js # Admin user profile locking
    │   │   ├── aiController.js    # Groq AI resume generation & scoring endpoint
    │   │   ├── authController.js  # JWT Auth, OTP verification, Register/Login
    │   │   ├── jobController.js   # Job management & Admin candidate recommendation logic
    │   │   ├── resumeController.js# CRUD resume operations & ATS calculations
    │   │   ├── testController.js  # Skill test results logging & analytics
    │   │   └── userController.js  # User profile get/update endpoints
    │   ├── middleware/         # Auth guards (`authMiddleware.js`, `adminMiddleware.js`)
    │   ├── models/             # Mongoose schemas (User, Resume, Job, TestResult)
    │   ├── routes/             # Express API Route endpoints (`/api/...`)
    │   ├── services/           # Backend services (`atsService.js`, `groqService.js`)
    │   └── utils/              # Node helper scripts (`adminSeeder.js`)
    ├── .env                    # Environment variables & DB connection string
    └── package.json
```

---

## 3. Detailed Technology Stack Breakdown

### Frontend Technologies (`/client`)
- **React.js (v18.x)**: Component-driven UI framework powering single-page application (SPA) reactivity.
- **Vite**: Ultra-fast frontend build tool and dev server with instant Hot Module Replacement (HMR).
- **Tailwind CSS (v4.x)**: Utility-first CSS framework for modern glassmorphism, responsive grids, and typography.
- **Zustand**: Fast, scalable state management store (`useResumeStore.js`) managing live resume drafts, template state, and auto-sync.
- **Axios**: Promise-based HTTP client for making API requests with credentials and authorization headers.
- **Lucide React**: Premium icon set providing consistent UI icons (`Sparkles`, `Users`, `Loader2`, `CheckCircle2`, etc.).
- **html2pdf.js**: Client-side PDF generation library using HTML5 Canvas & jsPDF with computed style resolution.
- **React Router DOM (v6.x)**: Client-side routing library supporting dynamic route switching and route guards (`ProtectedRoute`).

### Backend Technologies (`/server`)
- **Node.js**: Asynchronous JavaScript runtime environment powering server-side execution.
- **Express.js (v4.x)**: Lightweight web application framework handling RESTful API routing and HTTP request/response pipelines.
- **Mongoose ODM**: Object Data Modeling library providing schema validation, population, and type casting for MongoDB.
- **MongoDB Atlas**: Managed NoSQL document database storing user profiles, resumes, job postings, and skill test logs.
- **Groq Cloud AI SDK**: High-speed LLM integration running Llama 3 models for resume optimization and scoring.
- **Nodemailer**: SMTP email module sending 6-digit OTP codes for user registration verification.

---

## 4. Middleware Architecture & Registry

### What is Middleware?
In Express.js, **middleware** functions execute during the HTTP request-response cycle. They have access to the Request object (`req`), Response object (`res`), and the `next` function in the application pipeline. 

Middleware functions can:
1. Execute custom code (logging, rate-limiting, authentication verification).
2. Modify `req` and `res` objects (e.g. attaching `req.user` after token decryption).
3. End the request-response cycle early (e.g. returning `401 Unauthorized` or `403 Forbidden`).
4. Call `next()` to pass control to the next handler in the chain.

### Complete Middleware Registry Used in GetResume AI:

| Middleware | Source File | Type / Scope | Function & Mechanism |
| :--- | :--- | :--- | :--- |
| `protect` | `server/src/middleware/authMiddleware.js` | Custom / Protected Routes | Intercepts requests, extracts `Authorization: Bearer <token>`, verifies JWT signature via `JWT_SECRET`, retrieves user document from MongoDB (excluding password), attaches `req.user`, or returns `401 Unauthorized`. |
| `adminOnly` | `server/src/middleware/adminMiddleware.js` | Custom / Admin Routes | Evaluates `req.user.isAdmin`. If `false`, halts execution immediately and returns `403 Forbidden. Admin privileges required.` |
| `errorHandler` | `server/src/middleware/errorMiddleware.js` | Custom / Global | Intercepts unhandled backend errors, formats error messages into clean JSON, and suppresses verbose stack traces in production (`NODE_ENV === 'production'`). |
| `helmet()` | `helmet` package | Global Security | Sets HTTP security headers (XSS Protection, Content-Security-Policy, Frameguard, Hide Powered-By). Called in `server/src/app.js` (line 19). |
| `mongoSanitize()` | `express-mongo-sanitize` | Global Security | Strips `$` and `.` characters from incoming request bodies and query parameters to block NoSQL Injection attacks. Called in `app.js` (line 22). |
| `hpp()` | `hpp` package | Global Security | Prevents HTTP Parameter Pollution attacks by ignoring duplicate query string parameters. Called in `app.js` (line 34). |
| `globalLimiter` | `express-rate-limit` | Global Security | Enforces rate limits (200 requests / 15 mins per IP) across all `/api/*` endpoints to prevent DoS attacks. Called in `app.js` (lines 37–44). |
| `cors()` | `cors` package | Global Security | Restricts API access strictly to trusted origins (`http://localhost:5173`, `http://localhost:5174`) with credentials enabled. Called in `app.js` (lines 25–28). |
| `cookieParser()` | `cookie-parser` | Global Utility | Parses HTTP cookies attached to requests into `req.cookies`. Called in `app.js` (line 16). |
| `express.json()` | Express Built-in | Global Utility | Parses incoming JSON payloads and enforces a 1MB max body limit. Called in `app.js` (line 31). |

---

## 5. Database Architecture & Schema Specifications

The system uses **MongoDB Document Storage** managed via Mongoose schemas:

### A. User Schema (`User.js`)
- `name` (String, required): User's legal account name.
- `email` (String, required, unique): Account email address.
- `password` (String, required, hashed via `bcryptjs`).
- `isAdmin` (Boolean, default: `false`): Admin privileges flag.
- `profileLocked` (Boolean, default: `false`): Identity locking state.
- `isVerified` (Boolean, default: `false`): Email OTP verification status.
- `otp` / `otpExpiry` (String/Date, `select: false`): Temporary OTP storage.
- Sub-document arrays: `education`, `experience`, `internships`, `skills`, `projects`.

### B. Resume Schema (`Resume.js`)
- `userId` (ObjectId, ref: `'User'`): Owner reference.
- `title` (String, required): Resume document title.
- `template` (String, default: `'ats-alice'`): Selected template identifier.
- `personalInfo` (Object): Pre-filled name, email, phone, linkedin, location.
- `summary` (String), `skills` (Array of Strings).
- `experience`, `internships`, `education`, `projects` (Arrays of Objects).
- `atsScore` (Number): Calculated Research-Backed ATS compatibility score.

### C. Job Schema (`Job.js`)
- `title`, `company`, `location`, `description`, `salary` (Strings).
- `requirements` (Array of Strings).
- `createdBy` (ObjectId, ref: `'User'`): Admin publisher reference.
- `applicants` (Array of Sub-documents): `{ userId, resumeId, status, appliedAt }`.

### D. TestResult Schema (`TestResult.js`)
- `userId` (ObjectId, ref: `'User'`), `resumeId` (ObjectId, ref: `'Resume'`).
- `score` (Number), `correctAnswers` (Number), `totalQuestions` (Number).
- `switchStrikes` (Number): Tab-switching proctoring violation count.
- `answers` (Array of Objects): Detailed question & response choices.

---

## 6. Authentication & Security Architecture

### Authentication Workflow
1. **User Registration**: `POST /api/auth/register` creates user with `isVerified: false`, generates a 6-digit OTP code, saves hashed OTP to DB with 10-minute expiry, and emails the code via Nodemailer.
2. **OTP Verification**: `POST /api/auth/verify-otp` validates the submitted code. On match, sets `isVerified: true` and issues a signed JWT token.
3. **Password Security**: `userSchema.pre('save')` automatically hashes plain-text passwords using `bcrypt.hash()` with 10 salt rounds. `matchPassword()` compares login entries via `bcrypt.compare()`.
4. **Token Handling**: Signed JWT containing `user.id` is returned to the client and stored in `localStorage`. Sent on every API call via `Authorization: Bearer <token>`.

---

## 7. How to Login as Admin & Access Admin Controls

1. **Credentials in `.env`**:
   - **Email**: `admin@getresume.ai`
   - **Password**: `AdminSecurePass123!`

2. **Admin Controls Unlocked**:
   - **Hiring Board (`/jobs`)**: Admin features **Post Job Opening**, **Check Applicants Checklist**, and **🤖 View Candidate Recommendations**.
   - **User Profile (`/profile`)**: Admin panel displaying **Admin Privileges Active** and identity lock toggles.
