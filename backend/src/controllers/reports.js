// ─── Reports Controller ───
// Handles: create report, list reports, resolve/dismiss report

const { z } = require("zod");
const prisma = require("../utils/prisma");

// ─── Validation ───

const createReportSchema = z.object({
  targetType: z.enum(["CAMPAIGN", "USER"]),
  targetId: z.number().int().positive(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

const resolveReportSchema = z.object({
  status: z.enum(["RESOLVED", "DISMISSED"]),
  resolution: z.string().optional(),
});

// ─── POST /api/reports ───

const create = async (req, res) => {
  try {
    const validated = createReportSchema.parse(req.body);

    // Verify target exists
    if (validated.targetType === "CAMPAIGN") {
      const campaign = await prisma.campaign.findUnique({
        where: { id: validated.targetId },
      });
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: "Campaign not found.",
        });
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { id: validated.targetId },
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }
    }

    // Prevent duplicate reports from same user on same target
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: req.user.id,
        targetType: validated.targetType,
        targetId: validated.targetId,
        status: "PENDING",
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this. It is under review.",
      });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.id,
        targetType: validated.targetType,
        targetId: validated.targetId,
        reason: validated.reason,
      },
    });

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── GET /api/reports ───

const list = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("List reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// ─── PUT /api/reports/:id/resolve ───

const resolve = async (req, res) => {
  try {
    const validated = resolveReportSchema.parse(req.body);
    const reportId = parseInt(req.params.id);

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    if (report.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "This report has already been resolved.",
      });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: validated.status,
        resolution: validated.resolution || null,
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
    console.error("Resolve report error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { create, list, resolve };
