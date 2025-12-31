require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* ---------- CORS ---------- */
app.use(
  cors({
    origin: [
      "https://todo-app-3ssw.vercel.app",
      "https://todo-app-bay-nine-21.vercel.app",
      /\.vercel\.app$/, // Allow all vercel.app subdomains
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "content-type",
      "authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

/* ---------- MongoDB (safe for serverless) ---------- */
let isConnected = false;

async function connectDB() {
  // Check if already connected and connection is ready
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not set");
  }

  try {
    // Close existing connection if any before reconnecting
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
}

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error: error.message });
  }
});

/* ---------- Routes ---------- */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/todos"));

/* ---------- Health check ---------- */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Export for Vercel serverless
module.exports = app;
