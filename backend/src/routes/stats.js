// ─── Public Stats Route ───
// No authentication required — safe to expose aggregate counts only

const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    const [
      totalCampaigns,
      totalDonations,
      totalDonationAmount,
      totalUsers,
    ] = await Promise.all([
      prisma.campaign.count({ where: { status: { in: ["VERIFIED", "COMPLETED"] } } }),
      prisma.donation.count(),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.user.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalCampaigns,
        totalDonations,
        totalDonationAmount: totalDonationAmount._sum.amount || 0,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Public stats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
});

module.exports = router;
