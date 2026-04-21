// ─── Donation Routes ───

const express = require("express");
const router = express.Router();
const { donate, getReceipt, getCampaignDonations } = require("../controllers/donations");
const { authenticate } = require("../middleware/auth");

const upload = require("../middleware/upload");

router.post("/", authenticate, upload.single("slip"), donate);
router.get("/receipt/:transactionId", authenticate, getReceipt);
router.get("/campaign/:campaignId", authenticate, getCampaignDonations);

module.exports = router;
