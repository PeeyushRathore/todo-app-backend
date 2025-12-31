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
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

/* ---------- MongoDB (safe for serverless) ---------- */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

connectDB().catch(console.error);

/* ---------- Routes ---------- */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/todos", require("./routes/todos"));

/* ---------- Health check ---------- */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

module.exports = app;
