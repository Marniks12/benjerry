// Importeer Mongoose. Mongoose gebruiken we om een schema en model
// te maken voor documenten in MongoDB.
const mongoose = require("mongoose");

// Maak een Schema aan. Een schema bepaalt welke velden een order heeft
// en welke validatieregels MongoDB via Mongoose moet toepassen.
const OrderSchema = new mongoose.Schema({
  // Naam van de klant. required betekent dat dit veld verplicht is.
  customerName: {
    type: String,
    required: true,
  },

  // Adres waar de bestelling geleverd moet worden.
  address: {
    type: String,
    required: true,
  },

  // E-mailadres van de klant, bijvoorbeeld voor bevestiging van de bestelling.
  email: {
    type: String,
    required: true,
  },

  // De gekozen Ben & Jerry's smaak.
  flavor: {
    type: String,
    required: true,
  },

  // De gekozen topping voor de bestelling.
  topping: {
    type: String,
    required: true,
  },

  // Het gekozen hoorntje of bakje.
  cone: {
    type: String,
    required: true,
  },

  // Aantal bolletjes. min en max zorgen ervoor dat alleen 1, 2 of 3 geldig is.
  scoops: {
    type: Number,
    min: 1,
    max: 3,
    required: true,
  },

  // Prijs van de bestelling. min: 0 voorkomt negatieve prijzen.
  price: {
    type: Number,
    min: 0,
    required: true,
  },

  // Status van de bestelling. enum beperkt de waarde tot vaste opties.
  // default: "pending" betekent dat een nieuwe bestelling standaard pending is.
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "cancelled"],
    default: "pending",
  },

  // Aanmaakdatum van de bestelling. Date.now vult automatisch de huidige datum in.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Exporteer het Order model zodat controllers en routes het kunnen gebruiken.
module.exports = mongoose.model("Order", OrderSchema);
