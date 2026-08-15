const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const auditRoutes = require("./routes/auditRoutes");
const { errorMiddleware, notFound } = require("./middleware/errorMiddleware");

const app = express();

connectDB();

// ✅ UPDATE THIS SECTION
const allowedOrigins = [
  'https://seo-audit-pro-ruby.vercel.app',
  'https://seo-audit-pubbnh80b-divyasrikondetis-dels-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/audits", auditRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "SEO Audit Pro API is running 🚀",
  });
});

// Error handling middleware (add at the end)
app.use(notFound);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});