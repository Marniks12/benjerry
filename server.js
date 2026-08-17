// Laad de environment variables uit het .env-bestand als eerste.
// Dit is nodig zodat process.env.PORT en process.env.MONGO_URI beschikbaar zijn
// voordat andere code deze waarden probeert te gebruiken.
require("dotenv").config();

// Importeer Express. Express gebruiken we om de API-server te maken.
const express = require("express");

// Importeer CORS. Hiermee mag de API requests accepteren van een frontend op een andere URL.
const cors = require("cors");

// Importeer de database-connectiefunctie uit config/db.js.
// Deze functie gebruikt Mongoose om verbinding te maken met MongoDB Atlas.
const connectDB = require("./config/db");

// Importeer de order routes. Deze routes bevatten alle endpoints voor bestellingen.
const orderRoutes = require("./routes/orderRoutes");

// Importeer de auth routes. Deze routes bevatten het login endpoint voor de admin.
const authRoutes = require("./routes/authRoutes");

// Importeer de JWT middleware voor beveiligde routes.
const authMiddleware = require("./middleware/authMiddleware");

// Importeer beveiligings- en performance-middleware.
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("./middleware/mongoSanitize");

// Maak een Express-applicatie aan.
const app = express();

const path = require("path");

// Bepaal op welke poort de server moet draaien.
const PORT = process.env.PORT || 3000;

// Beveilig de app met HTTP headers (tegen clickjacking, XSS, MIME-sniffing).
app.use(helmet({ contentSecurityPolicy: false }));

// Comprimeer API-responses (Gzip) voor een snellere laadtijd.
app.use(compression());

// Activeer CORS middleware voor alle routes.
app.use(cors());

// Zorg dat Express JSON-data uit requests kan lezen (beperkt tot 10kb tegen DoS payload aanvallen).
app.use(express.json({ limit: "10kb" }));

// Voorkom NoSQL Query Injection door $ en . te verwijderen uit req.body en req.params.
app.use(mongoSanitize);

// Koppel alle order endpoints aan /api/orders.
// Bijvoorbeeld: router.post("/") wordt hierdoor POST /api/orders.
app.use("/api/orders", orderRoutes);

// Koppel het admin login endpoint aan /api/auth.
// Bijvoorbeeld: router.post("/login") wordt hierdoor POST /api/auth/login.
app.use("/api/auth", authRoutes);

// Serveer statische bestanden van de frontend als dist map bestaat
const frontendDist = path.join(__dirname, "../benjerrys-frontend/dist");
app.use(express.static(frontendDist));

// Basisroute om snel te controleren of de API draait.
app.get("/api-status", (req, res) => {
  res.json({
    message: "Ben & Jerry's API is running",
  });
});

// SPA Fallback: Vang alle niet-API routes op en stuur index.html terug.
// Dit voorkomt 404 meldingen bij het herladen (F5/refresh) op routes zoals /login of /orders.
app.get(/(.*)/, (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  const indexPath = path.join(frontendDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({
        message: "Route not found",
      });
    }
  });
});

// Start de applicatie in een aparte async functie.
// We gebruiken async/await omdat de databaseverbinding een asynchrone actie is:
// Node.js moet wachten op MongoDB Atlas voordat de server veilig requests accepteert.
const startServer = async () => {
  // Verbind eerst met MongoDB Atlas.
  // connectDB() wordt voor app.listen() uitgevoerd, zodat de API niet start
  // wanneer er geen werkende databaseverbinding is.
  await connectDB();

  // Start de server pas nadat de databaseverbinding succesvol is.
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

// Roep de startfunctie aan.
// Als connectDB() mislukt, stopt config/db.js de applicatie met process.exit(1).
// Exit code 1 betekent dat het programma stopt door een fout, wat duidelijk is
// voor hostingplatformen, logs en ontwikkelaars.
startServer();
