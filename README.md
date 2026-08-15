# SEO Audit Pro

A full-stack SEO auditing platform that analyzes websites, identifies common SEO issues, provides actionable recommendations, and presents audit results through an interactive dashboard.

## 🚀 Live Demo

**Frontend:**
https://seo-audit-pro-ruby.vercel.app

**GitHub Repository:**
https://github.com/divyasrikondetis-del/SEO-audit-pro

> **Note:** The backend API is deployed separately and is required for authentication and SEO audit functionality.

## ✨ Features

* 🔍 Website SEO auditing
* 📊 SEO score and score breakdown
* 🚨 SEO issue detection
* 💡 Actionable recommendations
* 📈 Interactive audit charts
* 📋 Detailed SEO reports
* 🔄 Audit comparison
* 🔐 User registration and login
* 🔑 JWT authentication
* 🔒 Password reset functionality
* 📱 Responsive React interface

## 🛠️ Tech Stack

### Frontend

* React
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
* MongoDB
* Mongoose
* Axios
* Cheerio
* JWT
* bcryptjs
* Nodemailer
* CORS
* dotenv

## 🏗️ Architecture

```text
User
  │
  ▼
React Frontend
  │
  │ API Requests
  ▼
Node.js + Express Backend
  │
  ├── Authentication
  ├── URL Validation
  ├── Website Fetching
  ├── HTML Parsing
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

## 🔎 SEO Audit

SEO Audit Pro analyzes submitted websites and evaluates important SEO factors such as:

* Page title
* Meta description
* Headings
* Links
* Images
* SEO-related HTML structure
* Other technical and on-page SEO factors

The system generates an overall score, detected issues, recommendations, and detailed reports.

## 📂 Project Structure

```text
SEO-audit-pro/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
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

## 💻 Local Development

### Clone

```bash
git clone https://github.com/divyasrikondetis-del/SEO-audit-pro.git
cd SEO-audit-pro
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Backend

Open another terminal:

```bash
cd server
npm install
npm run dev
```

## 🔐 Environment Variables

Environment variables are intentionally **not committed to GitHub**.

Create `server/.env` locally:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

If email functionality is enabled:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
```

For production, configure these values through your hosting provider's environment-variable settings.

## ☁️ Deployment

### Frontend

The frontend is deployed with Vercel:

**https://seo-audit-pro-ruby.vercel.app**

### Backend

The backend is deployed separately as a Node.js/Express web service.

Production environment variables are configured through the hosting platform rather than committed to the repository.

## 📌 Project Status

The project is actively developed as a personal portfolio and learning project.

### Completed

* Full-stack React + Express architecture
* User authentication
* SEO audit workflow
* SEO scoring
* Issue detection
* Recommendations
* Audit dashboard
* Audit reports
* Data visualization
* Password reset flow
* MongoDB integration
* GitHub repository
* Production frontend deployment

## 🎯 Purpose

SEO Audit Pro was developed to combine practical experience in:

* Technical SEO
* On-page SEO
* React development
* Node.js backend development
* REST APIs
* MongoDB
* Authentication
* Data visualization
* Full-stack application development

## 📄 License

This project is currently intended as a personal portfolio and learning project.
