// ─── Report Routes ───

const express = require("express");
const router = express.Router();
const { create, list, resolve } = require("../controllers/reports");
const { authenticate, authorize } = require("../middleware/auth");

// Any authenticated user can create a report
router.post("/", authenticate, create);

// Admin-only: list all reports, resolve/dismiss
router.get("/", authenticate, authorize("ADMIN"), list);
router.put("/:id/resolve", authenticate, authorize("ADMIN"), resolve);

module.exports = router;
