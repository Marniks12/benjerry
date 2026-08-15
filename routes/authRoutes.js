const express = require("express");
const rateLimit = require("express-rate-limit");

// Importeer de auth controller. De controller bevat de loginlogica.
const { loginAdmin } = require("../controllers/authController");

// Rate limiter tegen brute-force hackers op het login endpoint (max 5 pogingen per 15 min per IP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts from this IP. Please try again after 15 minutes.",
  },
});

// Maak een router aan. Deze wordt later in server.js gekoppeld aan /api/auth.
const router = express.Router();

// POST /api/auth/login
// Endpoint waarmee alleen de admin kan inloggen en een JWT ontvangt.
router.post("/login", loginLimiter, loginAdmin);

// Exporteer de router zodat server.js deze kan gebruiken.
module.exports = router;
