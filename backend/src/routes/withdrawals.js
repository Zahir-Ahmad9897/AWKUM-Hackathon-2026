// ─── Withdrawal Routes ───

const express = require("express");
const router = express.Router();
const { request, getForCampaign, review } = require("../controllers/withdrawals");
const { authenticate, authorize } = require("../middleware/auth");

router.post("/", authenticate, request);
router.get("/campaign/:campaignId", authenticate, getForCampaign);
router.put("/:id/review", authenticate, authorize("NGO", "ADMIN"), review);

module.exports = router;
