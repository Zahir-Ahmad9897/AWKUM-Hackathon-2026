// ─── Donations Controller ───
// Handles: donate, getReceipt, getCampaignDonations
// Emits real-time events via Socket.IO

const { z } = require("zod");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../utils/prisma");

// ─── Validation ───

const donateSchema = z.object({
  campaignId: z.number().int().positive(),
  amount: z.number().min(100, "Minimum donation is PKR 100"),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().optional().default(false),
});

// ─── POST /api/donations ───

const donate = async (req, res) => {
  try {
    const payload = {
      campaignId: parseInt(req.body.campaignId),
      amount: parseFloat(req.body.amount),
      message: req.body.message,
      isAnonymous: req.body.isAnonymous === 'true' || req.body.isAnonymous === true
    };
    const validated = donateSchema.parse(payload);

    // Verify campaign exists and is accepting donations
    const campaign = await prisma.campaign.findUnique({
      where: { id: validated.campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    if (campaign.status !== "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "This campaign is not accepting donations.",
      });
    }

    // Generate fake transaction ID (simulated payment)
    const transactionId = `TF-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Check if slip was uploaded
    const slipUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // FIX (Flaw #2): Auto-complete logic is now INSIDE the transaction
    // to prevent race conditions when multiple donors hit the goal simultaneously.
    const newAmount = campaign.currentAmount + validated.amount;
    const isNowComplete = newAmount >= campaign.goalAmount;

    const [donation, updatedCampaign] = await prisma.$transaction([
      prisma.donation.create({
        data: {
          campaignId: validated.campaignId,
          userId: req.user.id,
          amount: validated.amount,
          message: validated.message || null,
          isAnonymous: validated.isAnonymous,
          slipUrl: slipUrl,
          transactionId,
        },
        include: {
          user: { select: { id: true, name: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.campaign.update({
        where: { id: validated.campaignId },
        data: {
          currentAmount: { increment: validated.amount },
          // Atomically mark as COMPLETED if goal reached
          ...(isNowComplete && { status: "COMPLETED" }),
        },
      }),
    ]);

    // ─── Socket.IO: Emit real-time event ───
    const io = req.app.get("io");
    if (io) {
      io.to(`campaign-${validated.campaignId}`).emit("new-donation", {
        campaignId: validated.campaignId,
        amount: validated.amount,
        donorName: validated.isAnonymous ? "Anonymous" : donation.user.name,
        campaignTitle: donation.campaign.title,
        currentAmount: updatedCampaign.currentAmount,
        goalAmount: updatedCampaign.goalAmount,
        isCompleted: isNowComplete,
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        donation: {
          ...donation,
          user: validated.isAnonymous
            ? { id: 0, name: "Anonymous" }
            : donation.user,
        },
        receipt: {
          transactionId,
          amount: validated.amount,
          campaignName: donation.campaign.title,
          date: donation.createdAt,
          slipUrl: donation.slipUrl,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Donation error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/donations/receipt/:transactionId ───

const getReceipt = async (req, res) => {
  try {
    const donation = await prisma.donation.findUnique({
      where: { transactionId: req.params.transactionId },
      include: {
        campaign: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found.",
      });
    }

    // Only the donor or admin can view receipt
    if (donation.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this receipt.",
      });
    }

    return res.json({
      success: true,
      data: {
        transactionId: donation.transactionId,
        amount: donation.amount,
        campaignName: donation.campaign.title,
        donorName: donation.isAnonymous ? "Anonymous" : donation.user.name,
        date: donation.createdAt,
        message: donation.message,
      },
    });
  } catch (error) {
    console.error("Get receipt error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/donations/campaign/:campaignId ───

const getCampaignDonations = async (req, res) => {
  try {
    const donations = await prisma.donation.findMany({
      where: { campaignId: parseInt(req.params.campaignId) },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask anonymous donors
    const masked = donations.map((d) => ({
      ...d,
      user: d.isAnonymous ? { id: 0, name: "Anonymous" } : d.user,
    }));

    return res.json({
      success: true,
      data: masked,
    });
  } catch (error) {
    console.error("Get campaign donations error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { donate, getReceipt, getCampaignDonations };
