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

## 3. Key Feature Specifications & Component Breakdown

### A. Resume Builder (`/builder`)
- **Default Template**: Minimalist ATS (`ats-alice`).
- **State Management**: Zustand store (`useResumeStore.js`) handles transient edits, section toggling, and auto-syncing.
- **Identity Lock**: Registered user name & email are pre-filled and locked to prevent identity spoofing across resumes.

### B. Research-Backed ATS Diagnostics Engine
- Located in `client/src/utils/atsScorer.js` and `server/src/services/atsService.js`.
- Evaluates resumes across 5 categories:
  1. **Keyword Intersection (40 pts)**: Matches standard tech stack keywords against job description terms.
  2. **Quantitative Impact (20 pts)**: Parses metrics, percentages, dollar figures, and volume indicators (Google XYZ rule).
  3. **Active Writing Style (10 pts)**: Detects strong action verbs (e.g. *spearheaded*, *architected*).
  4. **Structure Completeness (15 pts)**: Ensures phone, LinkedIn, summary, skills, and experience sections are present.
  5. **Length & Formatting (15 pts)**: Checks optimal word count density (450–900 words).

### C. Admin Candidate Recommendation Engine (`/jobs`)
- Endpoint: `GET /api/jobs/:id/recommendations`
- Ranks all student resumes in the database against the job description using the ATS scoring model.
- Automatically deduplicates multiple resumes per student (retaining their highest match).
- Displays candidate score gauges, matched/missing keywords, and a direct button to load the candidate's resume into the builder.

### D. High-Fidelity PDF Exporter
- Located in `client/src/utils/pdfGenerator.js`.
- Solves Tailwind CSS v4 `oklch()` rendering issues by cloning the target DOM node and baking computed styles inline before passing to `html2pdf.js`.

---

## 4. How to Login as Admin & Access Admin Controls

1. **Credentials in `.env`**:
   - **Email**: `admin@getresume.ai`
   - **Password**: `AdminSecurePass123!`

2. **Admin Controls Unlocked**:
   - **Hiring Board (`/jobs`)**: Admin features **Post Job Opening**, **Check Applicants Checklist**, and **🤖 View Candidate Recommendations**.
   - **User Profile (`/profile`)**: Admin panel displaying **Admin Privileges Active** and identity lock toggles.
