// ─── NGO Routes ───

const express = require("express");
const router = express.Router();
const { apply, verifyCampaign, getPendingCampaigns } = require("../controllers/ngo");
const { authenticate, authorize } = require("../middleware/auth");

// Any authenticated user can apply to become NGO
router.post("/apply", authenticate, apply);

// NGO-only routes
router.get("/campaigns/pending", authenticate, authorize("NGO"), getPendingCampaigns);
router.put("/campaigns/:id/verify", authenticate, authorize("NGO"), verifyCampaign);

module.exports = router;
