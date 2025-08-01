require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
} catch (e) {
  console.error("❌ authRoutes error:", e.message);
}

try {
  const taskRoutes = require("./routes/taskRoutes");
  app.use("/api", taskRoutes);
} catch (e) {
  console.error("❌ taskRoutes error:", e.message);
}

// Health check
app.get("/", (req, res) => {
  res.json({ message: "✅ Personal Task Manager API is running 🚀" });
});

// 404 handler
// app.use("/*", (req, res) => {
//   res.status(404).json({ error: "❌ Route not found" });
// });

// Error handler
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});
