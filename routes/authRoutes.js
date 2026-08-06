// Importeer Express zodat we een aparte router kunnen maken voor auth endpoints.
const express = require("express");

// Importeer de auth controller. De controller bevat de loginlogica.
const { loginAdmin } = require("../controllers/authController");

// Maak een router aan. Deze wordt later in server.js gekoppeld aan /api/auth.
const router = express.Router();

// POST /api/auth/login
// Endpoint waarmee alleen de admin kan inloggen en een JWT ontvangt.
router.post("/login", loginAdmin);

// Exporteer de router zodat server.js deze kan gebruiken.
module.exports = router;
