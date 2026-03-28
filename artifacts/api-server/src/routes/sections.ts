import { Router, type IRouter } from "express";
import { db, sectionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/sections", async (_req, res) => {
  const sections = await db.select().from(sectionsTable).orderBy(sectionsTable.sortOrder);
  res.json(sections.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    icon: s.icon,
    description: s.description,
    color: s.color,
    sortOrder: s.sortOrder,
    isActive: s.isActive,
  })));
});

router.post("/sections", async (req, res) => {
  const { name, slug, icon, description, color, sortOrder, isActive } = req.body;
  const [section] = await db.insert(sectionsTable)
    .values({ name, slug, icon, description, color, sortOrder: sortOrder ?? 0, isActive: isActive ?? true })
    .returning();
  res.status(201).json({
    id: section.id,
    name: section.name,
    slug: section.slug,
    icon: section.icon,
    description: section.description,
    color: section.color,
    sortOrder: section.sortOrder,
    isActive: section.isActive,
  });
});

router.put("/sections/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, slug, icon, description, color, sortOrder, isActive } = req.body;
  const [section] = await db.update(sectionsTable)
    .set({ name, slug, icon, description, color, sortOrder, isActive })
    .where(eq(sectionsTable.id, id))
    .returning();
  res.json({
    id: section.id,
    name: section.name,
    slug: section.slug,
    icon: section.icon,
    description: section.description,
    color: section.color,
    sortOrder: section.sortOrder,
    isActive: section.isActive,
  });
});

router.delete("/sections/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(sectionsTable).where(eq(sectionsTable.id, id));
  res.json({ success: true });
});

export default router;
