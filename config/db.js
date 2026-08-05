// Importeer Mongoose. Deze library gebruiken we om verbinding te maken
// met MongoDB en om later met modellen en collecties te werken.
const mongoose = require("mongoose");

// connectDB is een async functie omdat het verbinden met MongoDB tijd kost.
// Met async/await kunnen we wachten tot de verbinding gelukt of mislukt is.
const connectDB = async () => {
  try {
    // MONGO_URI komt uit het .env-bestand via process.env.
    // Zo staat de database-url niet hardcoded in de code.
    await mongoose.connect(process.env.MONGO_URI);

    // Als mongoose.connect geen fout geeft, is de verbinding succesvol.
    console.log("MongoDB Atlas connection successful");
  } catch (error) {
    // Als de verbinding mislukt, tonen we een duidelijke foutmelding.
    console.error(`MongoDB Atlas connection failed: ${error.message}`);

    // Stop de server/applicatie, want zonder database kan de API niet veilig verder.
    process.exit(1);
  }
};

// Exporteer de functie zodat server.js deze kan importeren en uitvoeren.
module.exports = connectDB;
