# SensAI - Full Stack MERN AI Career Coach Platform

SensAI is a complete, production-ready AI-powered Career Coach platform built strictly using the MERN stack (MongoDB, Express, React, Node.js). It empowers job seekers with tools like an AI Resume Builder (with live ATS scoring), an AI Cover Letter Generator, and an AI Interview Prep portal (with mock interview question generation and interactive answer grading powered by Google Gemini API).

## Tech Stack

- **Frontend:** React.js, React Router DOM, Tailwind CSS, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT (JSON Web Tokens) for Session Management, Bcrypt.js for Password Hashing
- **AI Integrations:** Google Gemini API (via `@google/generative-ai` SDK)

---

## Folder Structure

```text
sensAI/
├── backend/                  # Node/Express API Server
│   ├── config/               # Database Connection configuration
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT Authentication & Error Handlers
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # API route definitions
│   ├── services/             # AI service wrappers (Gemini API)
│   ├── .env                  # Server environment variables
│   └── package.json          # Server dependencies
│
└── frontend/                 # React Vite Client
    ├── public/               # Static assets
    ├── src/
    │   ├── components/       # Layouts, Private/Public routes
    │   ├── context/          # Authentication provider Context
    │   ├── hooks/            # Custom React Hooks
    │   ├── pages/            # View pages (Dashboard, Resume, etc.)
    │   ├── utils/            # Axios instance and helpers
    │   ├── App.jsx           # Routing configuration
    │   ├── index.css         # Styling and custom theme variables
    │   └── main.jsx          # React app entry mounting
    ├── tailwind.config.js    # Tailwind layout variables
    ├── vite.config.js        # Vite port configurations
    └── package.json          # Client dependencies
```

---

## Setup & Installation

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** running locally or via MongoDB Atlas
- **Google Gemini API Key** (obtainable from Google AI Studio)

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Open the `.env` file and set the required variables:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/sensai
   JWT_SECRET=your_jwt_secret_phrase
   GEMINI_API_KEY=your_actual_google_gemini_api_key
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The client will start running locally at `http://localhost:3000`.

---

## MERN Core API Routes

- **Authentication (`/api/auth`)**
  - `POST /signup` - Register a new user.
  - `POST /login` - Login user and issue JWT token.
  - `GET /me` - Validate session and get profile completion status.
- **Profiles (`/api/profile`)**
  - `GET /` - Fetch current user's profile metadata.
  - `POST /` - Save or update onboarding parameters (marks user profile completed).
- **Resumes (`/api/resume`)**
  - `GET /` - Fetch current resume document.
  - `POST /generate` - Trigger AI engine to construct resume and compute ATS compatibility.
  - `PUT /` - Manually save markdown changes.
- **Cover Letters (`/api/coverletter`)**
  - `GET /` - List all past cover letters.
  - `POST /generate` - AI-tailor cover letter based on company, title, and job details.
  - `DELETE /:id` - Remove a cover letter draft.
- **Mock Interviews (`/api/interview`)**
  - `GET /` - Fetch interview prep history.
  - `POST /start` - Initiate questions for a given category (Technical or Behavioral).
  - `POST /submit/:id` - Grade typed responses and return score and improvement advice.
- **Industry Insights (`/api/insights`)**
  - `GET /:industry` - Fetch analytics, salary data, and trends.
