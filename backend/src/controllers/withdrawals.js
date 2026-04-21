// ─── Withdrawals Controller ───
// Handles: request, getForCampaign, review (approve/reject)

const { z } = require("zod");
const prisma = require("../utils/prisma");

// ─── Validation ───

const withdrawalSchema = z.object({
  campaignId: z.number().int().positive(),
  amount: z.number().positive("Amount must be positive"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
});

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reason: z.string().optional(),
});

// ─── POST /api/withdrawals ───

const request = async (req, res) => {
  try {
    const validated = withdrawalSchema.parse(req.body);

    // Verify campaign exists and belongs to requester
    const campaign = await prisma.campaign.findUnique({
      where: { id: validated.campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    if (campaign.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only withdraw from your own campaigns.",
      });
    }

    // FIX (Flaw #3): Campaign must be VERIFIED or COMPLETED to allow withdrawals.
    // Prevents withdrawal requests on PENDING/REJECTED campaigns with zero balance.
    if (!["VERIFIED", "COMPLETED"].includes(campaign.status)) {
      return res.status(400).json({
        success: false,
        message: "Withdrawals can only be requested for verified or completed campaigns.",
      });
    }

    // Check available balance (currentAmount minus already approved withdrawals)
    const approvedWithdrawals = await prisma.withdrawal.aggregate({
      where: {
        campaignId: validated.campaignId,
        status: "APPROVED",
      },
      _sum: { amount: true },
    });

    const availableBalance =
      campaign.currentAmount - (approvedWithdrawals._sum.amount || 0);

    if (validated.amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: PKR ${availableBalance.toLocaleString()}`,
      });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        campaignId: validated.campaignId,
        userId: req.user.id,
        amount: validated.amount,
        purpose: validated.purpose,
      },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json({
      success: true,
      data: withdrawal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Withdrawal request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/withdrawals/campaign/:campaignId ───
// FIX (Flaw #4): Only the campaign owner, NGOs, or ADMIN can view withdrawals.

const getForCampaign = async (req, res) => {
  try {
    const campaignId = parseInt(req.params.campaignId);

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, userId: true },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    // Authorization: must be the owner, an NGO, or an admin
    const isOwner = campaign.userId === req.user.id;
    const isPrivileged = req.user.role === "ADMIN" || req.user.role === "NGO";

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view withdrawals for this campaign.",
      });
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { campaignId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: withdrawals,
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── PUT /api/withdrawals/:id/review ───

const review = async (req, res) => {
  try {
    const validated = reviewSchema.parse(req.body);
    const withdrawalId = parseInt(req.params.id);

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal request not found.",
      });
    }

    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This withdrawal has already been reviewed.",
      });
    }

    if (validated.status === "REJECTED" && !validated.reason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const updated = await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: validated.status,
        reason: validated.reason || null,
      },
      include: {
        campaign: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Review withdrawal error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { request, getForCampaign, review };
