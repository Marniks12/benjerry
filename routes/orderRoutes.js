const express = require("express");
const rateLimit = require("express-rate-limit");

// Importeer de controllerfuncties. De routes bepalen de URL,
// de controller bevat de echte logica voor database-acties.
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Hergebruik de bestaande JWT-middleware voor admin-protected routes.
const authMiddleware = require("../middleware/authMiddleware");

// Rate limiter tegen spamming van bestellingen (max 15 bestellingen per minuut per IP).
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many order requests from this IP. Please wait a minute.",
  },
});

// Maak een router aan. Deze wordt later in server.js gekoppeld aan /api/orders.
const router = express.Router();

// POST /api/orders
// Endpoint om een nieuwe Ben & Jerry's bestelling te maken.
router.post("/", orderLimiter, createOrder);

// GET /api/orders
// Endpoint om alle bestellingen op te halen, nieuwste eerst.
router.get("/", getOrders);

// GET /api/orders/:id
// Endpoint om een specifieke bestelling op te halen.
router.get("/:id", getOrderById);

// PATCH /api/orders/:id/status en DELETE /api/orders/:id zijn admin-protected routes.
// Deze routes vereisen een geldige JWT voordat de controller wordt uitgevoerd.
router.patch("/:id/status", authMiddleware, updateOrderStatus);

// DELETE /api/orders/:id
// Endpoint om een bestelling te verwijderen.
router.delete("/:id", authMiddleware, deleteOrder);

// Exporteer de router zodat server.js deze kan gebruiken.
module.exports = router;
