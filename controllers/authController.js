// Importeer bcrypt om wachtwoorden veilig te controleren.
// bcrypt vergelijkt het ingevoerde wachtwoord met een hash uit .env.
// De echte admin password staat dus niet in de code en ook niet in Git.
const bcrypt = require("bcrypt");

// Importeer jsonwebtoken om na een succesvolle login een JWT te maken.
// Een JWT is een token dat de frontend later kan meesturen om te bewijzen
// dat de admin succesvol is ingelogd.
const jwt = require("jsonwebtoken");

// POST /api/auth/login
// Controleert de admin gebruikersnaam en het wachtwoord uit req.body.
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    // De admin gegevens komen uit environment variables.
    // Zo bewaren we geen username, password hash of JWT secret direct in de code.
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminUsername || !adminPasswordHash || !jwtSecret) {
      return res.status(500).json({
        message: "Authentication is not configured",
      });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (username !== adminUsername) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // bcrypt.compare() hasht het ingevoerde wachtwoord opnieuw met de salt
    // uit ADMIN_PASSWORD_HASH en vergelijkt het resultaat veilig met de hash.
    const passwordMatches = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (passwordMatches !== true) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // jwt.sign() maakt een token met beperkte admin-informatie.
    // Het token wordt ondertekend met JWT_SECRET, zodat de server later kan
    // controleren dat het token echt door deze API is gemaakt.
    const token = jwt.sign(
      {
        username: adminUsername,
        role: "admin",
      },
      jwtSecret,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    res.status(500).json({
      message: "Server error while logging in",
      error: error.message,
    });
  }
};

// Exporteer de loginfunctie zodat de auth routes deze kunnen gebruiken.
module.exports = {
  loginAdmin,
};
