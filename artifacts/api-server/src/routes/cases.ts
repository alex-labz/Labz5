import { Router, type IRouter } from "express";
import { db, casesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/cases", async (_req, res) => {
  const cases = await db.select().from(casesTable).orderBy(casesTable.id);
  res.json(cases.map(c => ({
    id: c.id,
    project: c.project,
    result: c.result,
    category: c.category,
    imageUrl: c.imageUrl,
  })));
});

router.post("/cases", async (req, res) => {
  const { project, result, category, imageUrl } = req.body;
  const [caseItem] = await db.insert(casesTable)
    .values({ project, result, category, imageUrl })
    .returning();
  res.status(201).json({
    id: caseItem.id,
    project: caseItem.project,
    result: caseItem.result,
    category: caseItem.category,
    imageUrl: caseItem.imageUrl,
  });
});

router.put("/cases/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { project, result, category, imageUrl } = req.body;
  const [caseItem] = await db.update(casesTable)
    .set({ project, result, category, imageUrl })
    .where(eq(casesTable.id, id))
    .returning();
  res.json({
    id: caseItem.id,
    project: caseItem.project,
    result: caseItem.result,
    category: caseItem.category,
    imageUrl: caseItem.imageUrl,
  });
});

router.delete("/cases/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(casesTable).where(eq(casesTable.id, id));
  res.json({ success: true });
});

export default router;
