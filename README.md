# Online Quiz & Assessment Platform (Quizora)

Quizora is a secure, responsive, and high-fidelity full-stack web application designed for conducting modern MCQ-based digital examinations. Built with a robust **Node.js & Express** backend and a dynamic **React + Vite** frontend, the platform features premium glassmorphism styling, interactive analytics dashboards, and an automated grading engine.

---

## Technical Architecture Overview

### 1. Unified Database Adapter Layer
The system implements a transparent database adapter supporting both **SQLite** and **MySQL**.
* **Zero-Configuration SQLite (Default)**: On first start, the server automatically boots, creates `database.sqlite` in the background, parses the migrations (`schema.sql`), and populates the database with comprehensive seed data (`seed.sql`). This ensures the app is testable instantly with `npm start`!
* **Production MySQL Option**: A single variable flag in `.env` (`DB_TYPE=mysql`) instantly swaps the database layer to connect to a MySQL pool, allowing seamless enterprise deployment.

### 2. Robust Anti-Cheat & Timing Engines
* **Answer Concealment**: Question options are shared with active sessions, but actual correct letters and explanations are explicitly filtered out on the backend server. Correct responses are only fetched once the attempt is finalized and submitted.
* **Timeout Submissions**: Exam attempt records store strict end times calculated using the quiz duration. If a candidate attempts to select options past their time limit, the backend automatically flags the exam session, calculates their score, and locks the interface.
* **Auto-Saving Options**: Selected choices are synced to the database on every click (using debounce auto-saves), preventing data loss in case of browser crashes.

### 3. Pedagogy & Gamification Details
* **Podium rankings**: The Leaderboard displays a beautiful visual podium for the top 3 scorers of each quiz, along with global aggregated candidate points standing.
* **Explanatory References**: Upon score compilation, candidates can review each question side-by-side with their selection. Options are highlighted in green (correct) or red (incorrect), accompanied by an explanatory review box.
* **Negative Marking**: The scoring algorithm applies negative marking penalty coefficients (customized per quiz) to aggregate final points.

---

## Directory Structure

```text
online-quiz-platform/
├── backend/
│   ├── scratch/
│   │   └── test-api.js      # Automated REST API lifecycle verification tests
│   ├── src/
│   │   ├── config/          # Dynamic db.js configuration (SQLite/MySQL support)
│   │   ├── controllers/     # Authentication, Quizzes, Attempts, & Analytics controllers
│   │   ├── middleware/      # JWT security validation & Admin access guards
│   │   ├── routes/          # Express API route mapping
│   │   └── database/        # schema.sql and seed.sql SQL resources
│   ├── .env                 # Environment variables config
│   ├── package.json         # Backend dependencies list
│   └── server.js            # Node backend entry point
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, protect blocks, SVG timers
│   │   ├── context/         # AuthContext and ThemeContext state systems
│   │   ├── services/        # api.js client-side AJAX fetch mapping
│   │   ├── styles/          # Custom Vanilla CSS animations & glass panels
│   │   ├── pages/           # Home, Dashboards, Leaderboards, Admin modals, SVG charts
│   │   ├── App.jsx          # Dynamic state-based page router and protection
│   │   └── main.jsx         # React mounting entry point
│   ├── index.html           # Web template and premium fonts loading
│   ├── vite.config.js       # Vite configuration with proxy overrides
│   └── package.json         # Frontend dependencies list
└── README.md                # Platform documentation guide
```

---

## Step-by-Step Launch & Execution

### Prerequisites
- **Node.js** (v16.0 or higher) installed on your system.
- **npm** (v7.0 or higher) or **yarn**.

---

### Step 1: Initialize Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install standard node modules:
   ```bash
   npm install
   ```
3. Start the node server:
   ```bash
   npm run dev
   ```
   *The server will initialize `database.sqlite` automatically inside `src/database/` and bind to `http://localhost:5000`.*

---

### Step 2: Initialize Frontend Application
1. Open a new separate terminal tab.
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install standard frontend modules:
   ```bash
   npm install
   ```
4. Start the Vite hot-reloading dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the address shown in the terminal (usually **`http://localhost:5173`**).

---

### Step 3: Login with Demo Seed Accounts
To explore the application immediately without signing up, use these seeded test accounts:

#### 1. Student Candidate Account
* **Email**: `user@quizplatform.com`
* **Password**: `userpassword`
* **Features**: Browse active assessments, attempt timed quizzes with animated SVG timers, real-time auto-saves, review completed results with explanation blocks, track leaderboard standing, view score timeline charts.

#### 2. Administration Manager Account
* **Email**: `admin@quizplatform.com`
* **Password**: `adminpassword`
* **Features**: Comprehensive CRUD dashboard, create/update/delete quizzes, add single questions, drag-and-drop CSV bulk question importer, global platform participation statistics, comparative SVG score averages graphs, candidate completed exams log.

---

## (Optional) Transitioning to Production MySQL
If you would like to test the application on a native **MySQL** database server:

1. Connect to your local MySQL instance and run:
   ```sql
   CREATE DATABASE quiz_platform;
   ```
2. Import the schemas and seeds inside the database:
   ```bash
   mysql -u root -p quiz_platform < backend/src/database/schema.sql
   mysql -u root -p quiz_platform < backend/src/database/seed.sql
   ```
3. Open `backend/.env` and update the configuration variables:
   ```env
   DB_TYPE=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=quiz_platform
   ```
4. Restart your backend server. It will seamlessly connect to MySQL!

---

## Automated Integration Testing
To run an automated test verifying the entire backend REST API lifecycle:
1. Make sure the backend server is running in a terminal.
2. Open another terminal in the `backend/` directory.
3. Run the verification script:
   ```bash
   node scratch/test-api.js
   ```
   *The script will execute a register-login-catalog-attempt-autosave-scoring sequence and output pass/fail results for each phase!*
