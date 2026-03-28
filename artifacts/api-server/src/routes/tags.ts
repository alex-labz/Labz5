import { Router, type IRouter } from "express";
import { db, tagsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/tags", async (req, res) => {
  const sectionId = req.query.sectionId ? parseInt(req.query.sectionId as string) : undefined;
  const rows = sectionId !== undefined
    ? await db.select().from(tagsTable).where(eq(tagsTable.sectionId, sectionId)).orderBy(tagsTable.id)
    : await db.select().from(tagsTable).orderBy(tagsTable.id);
  res.json(rows.map(t => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    sectionId: t.sectionId,
    color: t.color,
  })));
});

router.post("/tags", async (req, res) => {
  const { name, slug, sectionId, color } = req.body;
  const [tag] = await db.insert(tagsTable)
    .values({ name, slug, sectionId: sectionId || null, color: color || "default" })
    .returning();
  res.status(201).json({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    sectionId: tag.sectionId,
    color: tag.color,
  });
});

router.put("/tags/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, slug, sectionId, color } = req.body;
  const [tag] = await db.update(tagsTable)
    .set({ name, slug, sectionId: sectionId || null, color: color || "default" })
    .where(eq(tagsTable.id, id))
    .returning();
  res.json({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    sectionId: tag.sectionId,
    color: tag.color,
  });
});

router.delete("/tags/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(tagsTable).where(eq(tagsTable.id, id));
  res.json({ success: true });
});

export default router;
