// ─── Admin Controller ───
// Handles: reviewNGO, getStats, getAllUsers

const { z } = require("zod");
const prisma = require("../utils/prisma");

// ─── Validation ───

const reviewNGOSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

// ─── PUT /api/admin/ngo/:id/review ───

const reviewNGO = async (req, res) => {
  try {
    const validated = reviewNGOSchema.parse(req.body);
    const profileId = parseInt(req.params.id);

    const profile = await prisma.nGOProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "NGO application not found.",
      });
    }

    if (profile.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This application has already been reviewed.",
      });
    }

    if (validated.status === "REJECTED" && !validated.rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    // Update NGO profile status
    const updatedProfile = await prisma.nGOProfile.update({
      where: { id: profileId },
      data: {
        status: validated.status,
        rejectionReason: validated.rejectionReason || null,
      },
    });

    // If approved, upgrade user role to NGO
    if (validated.status === "APPROVED") {
      await prisma.user.update({
        where: { id: profile.userId },
        data: { role: "NGO" },
      });
    }

    return res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Review NGO error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/admin/ngo/pending ───

const getPendingNGOs = async (req, res) => {
  try {
    const profiles = await prisma.nGOProfile.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    console.error("Get pending NGOs error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/admin/stats ───

const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCampaigns,
      totalDonations,
      totalDonationAmount,
      pendingCampaigns,
      pendingNGOs,
      pendingWithdrawals,
      pendingReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count(),
      prisma.donation.count(),
      prisma.donation.aggregate({ _sum: { amount: true } }),
      prisma.campaign.count({ where: { status: "PENDING" } }),
      prisma.nGOProfile.count({ where: { status: "PENDING" } }),
      prisma.withdrawal.count({ where: { status: "PENDING" } }),
      prisma.report.count({ where: { status: "PENDING" } }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalCampaigns,
        totalDonations,
        totalDonationAmount: totalDonationAmount._sum.amount || 0,
        pending: {
          campaigns: pendingCampaigns,
          ngoApplications: pendingNGOs,
          withdrawals: pendingWithdrawals,
          reports: pendingReports,
        },
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/admin/users ───

const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;

    const where = {};
    if (role) where.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          ngoProfile: { select: { status: true, organizationName: true } },
          _count: { select: { campaigns: true, donations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { reviewNGO, getPendingNGOs, getStats, getAllUsers };
