// Importeer Express zodat we een aparte router kunnen maken voor order endpoints.
const express = require("express");

// Importeer de controllerfuncties. De routes bepalen de URL,
// de controller bevat de echte logica voor database-acties.
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Maak een router aan. Deze wordt later in server.js gekoppeld aan /api/orders.
const router = express.Router();

// POST /api/orders
// Endpoint om een nieuwe Ben & Jerry's bestelling te maken.
router.post("/", createOrder);

// GET /api/orders
// Endpoint om alle bestellingen op te halen, nieuwste eerst.
router.get("/", getOrders);

// GET /api/orders/:id
// Endpoint om een specifieke bestelling op te halen.
router.get("/:id", getOrderById);

// PATCH /api/orders/:id/status
// Endpoint om alleen de status van een bestelling te wijzigen.
router.patch("/:id/status", updateOrderStatus);

// DELETE /api/orders/:id
// Endpoint om een bestelling te verwijderen.
router.delete("/:id", deleteOrder);

// Exporteer de router zodat server.js deze kan gebruiken.
module.exports = router;
