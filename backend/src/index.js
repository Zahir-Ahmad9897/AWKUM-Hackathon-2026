// ─── TrustFund Backend Server ───
// Express + Socket.IO entry point

require("dotenv").config();

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// ─── App Setup ───

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store io instance on app so controllers can access it
app.set("io", io);

// ─── Middleware ───

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// FIX (W8): Reduced body limit from 10mb to a sensible 1mb
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─── Static Files (Uploads) ───
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Rate Limiters ───
// FIX (W6): Rate limiting extended to donation + reports (not just auth)

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    success: false,
    message: "Too many attempts. Please try again after 15 minutes.",
  },
});

const donationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: "Too many donation attempts. Please wait a moment.",
  },
});

const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many reports submitted. Please try again later.",
  },
});

// ─── Routes ───

const authRoutes = require("./routes/auth");
const campaignRoutes = require("./routes/campaigns");
const donationRoutes = require("./routes/donations");
const withdrawalRoutes = require("./routes/withdrawals");
const ngoRoutes = require("./routes/ngo");
const adminRoutes = require("./routes/admin");
const reportRoutes = require("./routes/reports");
const statsRoutes = require("./routes/stats");

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationLimiter, donationRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportLimiter, reportRoutes);
app.use("/api/stats", statsRoutes); // Public — no auth needed

// ─── Health Check ───

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    },
  });
});

// ─── 404 Handler ───

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ───

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ─── Socket.IO Connection ───

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Client joins a campaign room to get targeted real-time updates
  socket.on("join-campaign", (campaignId) => {
    socket.join(`campaign-${campaignId}`);
    console.log(`📢 ${socket.id} joined campaign-${campaignId}`);
  });

  socket.on("leave-campaign", (campaignId) => {
    socket.leave(`campaign-${campaignId}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🏦 TrustFund Backend Server           ║
  ║   🌐 http://localhost:${PORT}              ║
  ║   📡 Socket.IO ready                    ║
  ║   🔧 Environment: ${(process.env.NODE_ENV || "development").padEnd(12)}       ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
