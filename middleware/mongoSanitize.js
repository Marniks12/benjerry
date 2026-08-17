// Aangepaste NoSQL Injection sanitize middleware, compatibel met Express 5.
// express-mongo-sanitize@2.x is niet compatibel met Express 5 omdat
// req.query in Express 5 een read-only getter is geworden.
// Deze middleware sanitizet req.body en req.params (waar we schrijftoegang hebben).

/**
 * Recursief verwijdert alle keys die beginnen met $ of . bevatten uit een object.
 * Dit voorkomt NoSQL Injection aanvallen zoals { "$gt": "" } in MongoDB queries.
 */
function sanitizeObject(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key of Object.keys(obj)) {
    // Verwijder keys die beginnen met $ (MongoDB operators) of . bevatten (dot notation)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }
    sanitized[key] = sanitizeObject(obj[key]);
  }
  return sanitized;
}

/**
 * Express middleware die req.body en req.params sanitizet tegen NoSQL Injection.
 */
function mongoSanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }

  if (req.params && typeof req.params === "object") {
    // req.params is in Express 5 ook potentieel read-only,
    // dus we sanitizen alleen de waarden (strings) als dat mogelijk is.
    for (const key of Object.keys(req.params)) {
      if (typeof req.params[key] === "string") {
        req.params[key] = req.params[key].replace(/[$]/g, "");
      }
    }
  }

  next();
}

module.exports = mongoSanitizeMiddleware;
