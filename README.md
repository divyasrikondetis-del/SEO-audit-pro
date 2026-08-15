# SEO Audit Pro

A full-stack SEO auditing platform that analyzes websites, identifies common SEO issues, provides actionable recommendations, and presents audit results through an interactive dashboard.

## 🚀 Overview

SEO Audit Pro is a web application designed to help website owners and SEO learners understand the technical and on-page SEO health of a website.

Users can enter a website URL and generate an SEO audit containing important checks, an overall SEO score, issues, recommendations, and visual reports.

The project combines a React frontend with a Node.js/Express backend and MongoDB database.

## ✨ Features

### 🔍 SEO Website Auditing

* Analyze submitted website URLs
* Crawl and inspect website HTML
* Check important on-page SEO elements
* Identify SEO issues
* Generate actionable recommendations
* Calculate an overall SEO score
* Display detailed audit results

### 📊 Dashboard & Reports

* Interactive SEO dashboard
* Audit history
* SEO score visualization
* Score breakdown
* Charts and data visualization
* SEO issue cards
* Recommendations
* Audit comparison
* Detailed audit reports

### 🔐 Authentication

* User registration
* User login
* JWT-based authentication
* Password hashing with bcrypt
* Protected application features
* Forgot-password functionality
* Temporary password email functionality
* Password reset flow

### 🎨 User Interface

* Responsive React interface
* Tailwind CSS styling
* Reusable UI components
* Animated interactions with Framer Motion
* Toast notifications
* Responsive dashboard and reports

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* React Router
* Tailwind CSS
* Axios
* React Hook Form
* Chart.js
* Recharts
* Framer Motion
* React Icons
* React Hot Toast
* Day.js

### Backend

* Node.js
* Express.js
* Axios
* Cheerio
* CORS
* dotenv
* JWT
* bcryptjs
* Mongoose
* Nodemailer

### Database

* MongoDB
* Mongoose

### Development Tools

* Git
* GitHub
* VS Code
* Nodemon
* ESLint

## 🏗️ Project Architecture

```text
SEO-audit-pro/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   └── seo/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── styles/
│       └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   └── server.js
│
└── .gitignore
```

## 🔄 How It Works

```text
User
  │
  ▼
React Frontend
  │
  │ API Request
  ▼
Express Backend
  │
  ├── Authentication
  │
  ├── URL Validation
  │
  ├── Website Fetching
  │
  ├── HTML Parsing
  │
  └── SEO Analysis
  │
  ▼
MongoDB
  │
  ▼
Audit Results
  │
  ▼
Interactive Dashboard
```

## 🔎 SEO Audit Process

The backend uses HTTP requests and HTML parsing to inspect submitted websites.

The audit service processes website information and evaluates SEO-related factors before generating the audit result.

The application then presents the results through:

* Overall SEO score
* Individual SEO checks
* Detected issues
* Recommendations
* Score breakdown
* Charts
* Detailed reports

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/divyasrikondetis-del/SEO-audit-pro.git
cd SEO-audit-pro
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Start the frontend

```bash
npm run dev
```

### 4. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

### 5. Configure environment variables

Create:

```text
server/.env
```

and add the required configuration.

### 6. Start the backend

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

## 📌 Current Project Status

The project is currently under active development.

### Completed

* Full-stack React + Express architecture
* User authentication
* SEO audit workflow
* SEO score and issue reporting
* Audit dashboard
* Audit reports
* Data visualization
* Password reset flow
* MongoDB integration
* GitHub repository

## 🎯 Purpose

SEO Audit Pro was developed as a practical project to combine:

* SEO knowledge
* Web development
* Technical SEO
* Data analysis
* API development
* Database management
* User authentication

## 📄 License

This project is currently intended as a personal portfolio and learning project.
