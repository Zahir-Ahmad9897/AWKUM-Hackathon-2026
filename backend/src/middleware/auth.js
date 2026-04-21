// ─── JWT Authentication + Role Guard Middleware ───

const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

// Guard: crash early if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is not defined in environment variables.");
  process.exit(1);
}

/**
 * Verifies JWT token from Authorization header.
 * Attaches user object to req.user on success.
 * REQUIRED — returns 401 if no/invalid token.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

/**
 * OPTIONAL authentication — attaches req.user if token is present and valid,
 * but does NOT block the request if no token is provided.
 * Used for public routes that have role-aware behaviour (e.g. campaign list).
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // No token — continue as guest
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (user) req.user = user; // Attach if found; silently skip if not
    next();
  } catch {
    // Invalid/expired token — treat as guest, don't block
    next();
  }
};

/**
 * Role-based access control.
 * Usage: authorize("ADMIN", "NGO")
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = { authenticate, optionalAuthenticate, authorize };
