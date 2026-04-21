// ─── Campaigns Controller ───
// Handles: create, getAll, getOne, update, delete, getMine

const { z } = require("zod");
const prisma = require("../utils/prisma");

// ─── Validation ───

const createCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  goalAmount: z.number().positive("Goal amount must be positive"),
  deadline: z.string().refine((d) => new Date(d) > new Date(), {
    message: "Deadline must be in the future",
  }),
});

const updateCampaignSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  goalAmount: z.number().positive().optional(),
  deadline: z.string().optional(),
});

// ─── POST /api/campaigns ───

const create = async (req, res) => {
  try {
    // When using FormData, payload properties come in as strings. 
    // We parse them to numbers before validating.
    const payload = {
      title: req.body.title,
      description: req.body.description,
      goalAmount: parseFloat(req.body.goalAmount),
      deadline: req.body.deadline,
    };

    const validated = createCampaignSchema.parse(payload);
    
    // Check if image was uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const campaign = await prisma.campaign.create({
      data: {
        title: validated.title,
        description: validated.description,
        goalAmount: validated.goalAmount,
        deadline: new Date(validated.deadline),
        imageUrl: imageUrl,
        userId: req.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Create campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/campaigns ───
// FIX (Flaw #1): req.user is now optional (optionalAuthenticate).
// Guests see only VERIFIED campaigns.

const getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const where = {};

    if (req.user?.role === "ADMIN" || req.user?.role === "NGO") {
      // Privileged users can filter by any status
      if (status) where.status = status;
    } else if (req.user) {
      // Authenticated regular user — see their own + verified campaigns
      if (status) {
        where.OR = [
          { status: "VERIFIED" },
          { userId: req.user.id, status },
        ];
      } else {
        where.OR = [{ status: "VERIFIED" }, { userId: req.user.id }];
      }
    } else {
      // Guest — only verified campaigns
      where.status = "VERIFIED";
    }

    if (search) {
      where.title = { contains: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { donations: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.campaign.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/campaigns/:id ───
// FIX (Flaw #1): req.user is optional — guests can view verified campaigns.

const getOne = async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        donations: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: { select: { donations: true } },
      },
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    // Guests and regular users can only see VERIFIED/COMPLETED campaigns
    const isPrivileged = req.user && (req.user.role === "ADMIN" || req.user.role === "NGO");
    const isOwner = req.user && campaign.userId === req.user.id;

    if (!isPrivileged && !isOwner && !["VERIFIED", "COMPLETED"].includes(campaign.status)) {
      return res.status(403).json({
        success: false,
        message: "Campaign not available.",
      });
    }

    // Mask anonymous donor names
    campaign.donations = campaign.donations.map((d) => ({
      ...d,
      user: d.isAnonymous ? { id: 0, name: "Anonymous" } : d.user,
    }));

    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error("Get campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── PUT /api/campaigns/:id ───

const update = async (req, res) => {
  try {
    const validated = updateCampaignSchema.parse(req.body);
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

    // Only the owner can update; resubmission resets status to PENDING
    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this campaign.",
      });
    }

    const updateData = { ...validated };
    if (validated.deadline) {
      updateData.deadline = new Date(validated.deadline);
    }

    // If campaign was rejected, resubmit sets it back to PENDING
    if (campaign.status === "REJECTED") {
      updateData.status = "PENDING";
      updateData.rejectionReason = null;
    }

    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
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
    console.error("Update campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── DELETE /api/campaigns/:id ───

const remove = async (req, res) => {
  try {
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

    if (campaign.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this campaign.",
      });
    }

    await prisma.campaign.delete({ where: { id: campaignId } });

    return res.json({
      success: true,
      data: { message: "Campaign deleted successfully." },
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/campaigns/mine ───

const getMine = async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: req.user.id },
      include: {
        _count: { select: { donations: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error("Get my campaigns error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { create, getAll, getOne, update, remove, getMine };
