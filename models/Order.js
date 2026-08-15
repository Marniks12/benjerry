// Importeer Mongoose. Mongoose gebruiken we om een schema en model
// te maken voor documenten in MongoDB.
const mongoose = require("mongoose");

// Maak een Schema aan. Een schema bepaalt welke velden een order heeft
// en welke validatieregels MongoDB via Mongoose moet toepassen.
const OrderSchema = new mongoose.Schema({
  // Naam van de klant.
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  // Adres waar de bestelling geleverd moet worden.
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },

  // E-mailadres van de klant met formaatvalidatie.
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },

  // De gekozen Ben & Jerry's smaak (alleen toegestane opties).
  flavor: {
    type: String,
    required: true,
    enum: ["vanilla", "chocolate", "strawberry", "cookie-dough"],
  },

  // De gekozen topping (alleen toegestane opties).
  topping: {
    type: String,
    required: true,
    enum: ["none", "chocolate", "sprinkles", "caramel"],
  },

  // Het gekozen hoorntje (alleen toegestane opties).
  cone: {
    type: String,
    required: true,
    enum: ["waffle", "chocolate", "sugar"],
  },

  // Aantal bolletjes. Standaard 1 bolletje nu scoops UI is verwijderd.
  scoops: {
    type: Number,
    min: 1,
    max: 3,
    default: 1,
  },

  // Prijs van de bestelling. min: 0 voorkomt negatieve prijzen.
  price: {
    type: Number,
    min: 0,
    required: true,
  },

  // Status van de bestelling. Standaard altijd "pending" bij nieuwe orders.
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "cancelled"],
    default: "pending",
  },

  // Aanmaakdatum van de bestelling.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Database index toevoegen op createdAt voor snelle sortering van bestellingen.
OrderSchema.index({ createdAt: -1 });

// Exporteer het Order model zodat controllers en routes het kunnen gebruiken.
module.exports = mongoose.model("Order", OrderSchema);
