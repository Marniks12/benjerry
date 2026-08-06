// Importeer jsonwebtoken om JWT tokens te controleren.
const jwt = require("jsonwebtoken");

// Middleware is een functie die tussen de request en de uiteindelijke route handler zit.
// Deze middleware controleert of de request een geldige admin JWT meestuurt.
const authMiddleware = (req, res, next) => {
  try {
    // De Authorization header wordt gebruikt om login-informatie mee te sturen.
    // Bij JWT authenticatie is het standaard formaat: Authorization: Bearer <JWT_TOKEN>
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const authorizationParts = authorizationHeader.split(" ");

    // "Bearer" betekent dat de client een token meestuurt als bewijs van login.
    // De header moet exact uit twee delen bestaan: "Bearer" en daarna het JWT token.
    if (
      authorizationParts.length !== 2 ||
      authorizationParts[0] !== "Bearer" ||
      !authorizationParts[1]
    ) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    const token = authorizationParts[1];

    // Een JWT is een ondertekend token met data, bijvoorbeeld username en role.
    // jwt.verify() controleert of het token geldig is, niet verlopen is,
    // en echt ondertekend werd met dezelfde JWT_SECRET als bij het inloggen.
    // JWT_SECRET moet geheim blijven, omdat hiermee tokens worden vertrouwd.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // req.user bevat vanaf hier de decoded JWT-data.
    // Latere route handlers kunnen hiermee weten welke admin is ingelogd.
    req.user = decodedToken;

    // next() geeft de request door aan de volgende middleware of route handler.
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Exporteer de middleware zodat routes deze later kunnen gebruiken.
module.exports = authMiddleware;
