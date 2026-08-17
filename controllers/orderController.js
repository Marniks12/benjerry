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

const ALLOWED_FLAVORS = ["vanilla", "chocolate", "strawberry", "cookie-dough"];
const ALLOWED_TOPPINGS = ["none", "chocolate", "sprinkles", "caramel"];
const ALLOWED_CONES = ["waffle", "chocolate", "sugar"];

const TOPPING_PRICES = {
  none: 0,
  chocolate: 1,
  sprinkles: 0.5,
  caramel: 1,
};

const CONE_PRICES = {
  waffle: 0,
  chocolate: 1,
  sugar: 0.5,
};

// Functie om HTML tags te strippen uit string input tegen Stored XSS-aanvallen.
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
};

// POST /api/orders
// Maakt een nieuwe bestelling aan met de data uit req.body.
const createOrder = async (req, res) => {
  try {
    const { customerName, address, email, flavor, topping, cone } = req.body || {};

    const cleanName = sanitizeString(customerName);
    const cleanAddress = sanitizeString(address);
    const cleanEmail = sanitizeString(email);

    const cleanFlavor = sanitizeString(flavor).toLowerCase();
    const cleanTopping = sanitizeString(topping).toLowerCase();
    const cleanCone = sanitizeString(cone).toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({ message: "Customer name is required (max 100 characters)" });
    }
    if (!cleanAddress || cleanAddress.length > 300) {
      return res.status(400).json({ message: "Address is required (max 300 characters)" });
    }
    if (!cleanEmail || cleanEmail.length > 100 || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ message: "A valid email address is required (max 100 characters)" });
    }
    if (!ALLOWED_FLAVORS.includes(cleanFlavor)) {
      return res.status(400).json({ message: "Invalid flavor selection", allowedFlavors: ALLOWED_FLAVORS });
    }
    if (!ALLOWED_TOPPINGS.includes(cleanTopping)) {
      return res.status(400).json({ message: "Invalid topping selection", allowedToppings: ALLOWED_TOPPINGS });
    }
    if (!ALLOWED_CONES.includes(cleanCone)) {
      return res.status(400).json({ message: "Invalid cone selection", allowedCones: ALLOWED_CONES });
    }

    // Herbereken de prijs veilig op de server op basis van de configuratie.
    const calculatedPrice = 5 + (TOPPING_PRICES[cleanTopping] || 0) + (CONE_PRICES[cleanCone] || 0);

    const orderData = {
      customerName: cleanName,
      address: cleanAddress,
      email: cleanEmail,
      flavor: cleanFlavor,
      topping: cleanTopping,
      cone: cleanCone,
      scoops: 1,
      price: calculatedPrice,
      status: "pending", // Klant mag status niet bepalen; altijd pending.
    };

    const order = await Order.create(orderData);

    // 201 betekent dat er succesvol een nieuwe resource is aangemaakt.
    res.status(201).json(order);
  } catch (error) {
    // ValidationError betekent dat verplichte velden ontbreken of waarden ongeldig zijn.
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid order input",
      });
    }

    res.status(500).json({
      message: "Server error while creating order: " + (error.stack || error.message || error),
    });
  }
};

// GET /api/orders
// Haalt alle bestellingen op en sorteert ze met de nieuwste bestelling eerst (met lean() voor maximale snelheid).
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

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

    const order = await Order.findById(req.params.id).lean();

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

    res.status(500).json({
      message: "Server error while updating order status",
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
