// Importeer Mongoose zodat we ObjectId's kunnen controleren.
const mongoose = require("mongoose");

// Importeer het bestaande Order model. Via dit model praten we met de orders collectie.
const Order = require("../models/Order");

// Deze lijst bepaalt welke statussen een bestelling mag hebben.
// Zo gebruiken we dezelfde toegestane waarden als in het Mongoose model.
const allowedStatuses = ["pending", "processing", "shipped", "cancelled"];

// Controleer of een id een geldig MongoDB ObjectId formaat heeft.
// Ongeldige id's geven we terug als 400, omdat de input van de client fout is.
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/orders
// Maakt een nieuwe bestelling aan met de data uit req.body.
const createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);

    // 201 betekent dat er succesvol een nieuwe resource is aangemaakt.
    res.status(201).json(order);
  } catch (error) {
    // ValidationError betekent dat verplichte velden ontbreken of waarden ongeldig zijn.
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid order input",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Server error while creating order",
    });
  }
};

// GET /api/orders
// Haalt alle bestellingen op en sorteert ze met de nieuwste bestelling eerst.
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching orders",
    });
  }
};

// GET /api/orders/:id
// Haalt een enkele bestelling op via het id uit de URL.
const getOrderById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching order",
    });
  }
};

// PATCH /api/orders/:id/status
// Wijzigt alleen de status van een bestaande bestelling.
const updateOrderStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    if (!req.body || !Object.hasOwn(req.body, "status")) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const status =
      typeof req.body.status === "string"
        ? req.body.status.trim()
        : req.body.status;

    // Controleer expliciet of de status een van de toegestane waarden is.
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
        allowedStatuses,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    console.error("ERROR MESSAGE:", error.message);

    res.status(500).json({
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};

// DELETE /api/orders/:id
// Verwijdert een bestelling uit de database.
const deleteOrder = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid order id",
      });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting order",
    });
  }
};

// Exporteer alle controllerfuncties zodat de routes ze kunnen gebruiken.
module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
