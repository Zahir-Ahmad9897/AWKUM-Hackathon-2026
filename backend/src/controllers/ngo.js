// ─── NGO Controller ───
// Handles: apply for NGO, verify campaigns, get pending campaigns

const { z } = require("zod");
const prisma = require("../utils/prisma");

// ─── Validation ───

const applySchema = z.object({
  organizationName: z.string().min(3, "Organization name must be at least 3 characters"),
  registrationNumber: z.string().min(3, "Registration number is required"),
});

const verifyCampaignSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// ─── POST /api/ngo/apply ───

const apply = async (req, res) => {
  try {
    const validated = applySchema.parse(req.body);

    // Check if user already has an NGO profile
    const existing = await prisma.nGOProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === "PENDING"
            ? "Your NGO application is already pending review."
            : existing.status === "APPROVED"
            ? "You are already an approved NGO."
            : "Your previous application was rejected. Contact admin to reapply.",
      });
    }

    const profile = await prisma.nGOProfile.create({
      data: {
        userId: req.user.id,
        organizationName: validated.organizationName,
        registrationNumber: validated.registrationNumber,
      },
    });

    return res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("NGO apply error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── PUT /api/ngo/campaigns/:id/verify ───
// FIX (Flaw #5): An NGO cannot verify their own campaign — conflict of interest.

const verifyCampaign = async (req, res) => {
  try {
    const validated = verifyCampaignSchema.parse(req.body);
    const campaignId = parseInt(req.params.id);

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    if (campaign.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending campaigns can be verified.",
      });
    }

    // FIX (Flaw #5): Conflict-of-interest guard — NGO cannot verify their own campaign.
    if (campaign.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        message:
          "Conflict of interest: you cannot verify a campaign you created. " +
          "Another NGO or admin must review this campaign.",
      });
    }

    if (validated.status === "REJECTED" && !validated.rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: validated.status,
        rejectionReason: validated.rejectionReason || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
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
    console.error("Verify campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/ngo/campaigns/pending ───

const getPendingCampaigns = async (req, res) => {
  try {
    // FIX (Flaw #5): Exclude campaigns owned by the requesting NGO
    // so they cannot verify their own campaigns from the dashboard list either.
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "PENDING",
        userId: { not: req.user.id }, // Exclude self-owned campaigns
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get pending campaigns error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { apply, verifyCampaign, getPendingCampaigns };
