import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/db.js";
import { authRequired } from "../middleware/auth.js";

export const contributorsRouter = Router();

contributorsRouter.use(authRequired);

const updateContributorSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  role: z.enum(["SuperAdmin", "OrgAdmin", "Contributor"]).optional(),
  organizationId: z.string().nullable().optional(),
  isActive: z.boolean().optional()
});

contributorsRouter.get("/", async (req, res) => {
  try {
    const orgId = req.tenant?.organizationId;
    const role = req.query.role as string | undefined;
    const active = req.query.active as string | undefined;

    const where: Record<string, unknown> = { deletedAt: null };
    if (orgId) where.organizationId = orgId;
    if (role) where.role = role;
    if (active !== undefined) where.isActive = active === "true";

    const contributors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        organizationId: true,
        createdAt: true,
        shiftAssignments: {
          include: { shift: { select: { id: true, title: true, startsAt: true, endsAt: true, status: true } } }
        },
        assignedTasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true }
        }
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });

    res.json({ contributors });
  } catch (err) {
    console.error("List contributors error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

contributorsRouter.get("/:id", async (req, res) => {
  try {
    const contributor = await prisma.user.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        organizationId: true,
        createdAt: true,
        organization: { select: { id: true, name: true, slug: true } },
        shiftAssignments: {
          include: { shift: { select: { id: true, title: true, startsAt: true, endsAt: true, status: true, location: true } } }
        },
        assignedTasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true, dueAt: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!contributor) {
      res.status(404).json({ error: "Contributor not found" });
      return;
    }

    res.json({ contributor });
  } catch (err) {
    console.error("Get contributor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

contributorsRouter.patch("/:id", async (req, res) => {
  try {
    const existing = await prisma.user.findFirst({
      where: { id: req.params.id, deletedAt: null }
    });

    if (!existing) {
      res.status(404).json({ error: "Contributor not found" });
      return;
    }

    const body = updateContributorSchema.parse(req.body);
    const data: Record<string, unknown> = {};
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.role !== undefined) data.role = body.role;
    if (body.organizationId !== undefined) data.organizationId = body.organizationId;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const contributor = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        phone: true,
        organizationId: true
      }
    });

    res.json({ contributor });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", details: err.issues });
      return;
    }
    console.error("Update contributor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
