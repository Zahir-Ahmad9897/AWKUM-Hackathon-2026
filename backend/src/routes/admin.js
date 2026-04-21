// ─── Admin Routes ───

const express = require("express");
const router = express.Router();
const { reviewNGO, getPendingNGOs, getStats, getAllUsers } = require("../controllers/admin");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

router.get("/stats", getStats);
router.get("/users", getAllUsers);
router.get("/ngo/pending", getPendingNGOs);
router.put("/ngo/:id/review", reviewNGO);

module.exports = router;
