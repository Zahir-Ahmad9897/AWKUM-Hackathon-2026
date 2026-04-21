// ─── Donation Routes ───

const express = require("express");
const router = express.Router();
const { donate, getReceipt, getCampaignDonations } = require("../controllers/donations");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, donate);
router.get("/receipt/:transactionId", authenticate, getReceipt);
router.get("/campaign/:campaignId", authenticate, getCampaignDonations);

module.exports = router;
