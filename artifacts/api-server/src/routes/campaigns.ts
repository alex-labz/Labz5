import { Router, type IRouter } from "express";
import { db, campaignsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const mapCampaign = (c: any) => ({
  id: c.id, title: c.title, tag: c.tag, description: c.description,
  applyLink: c.applyLink, imageUrl: c.imageUrl, type: c.type,
  status: c.status, tagIds: c.tagIds ?? [],
  formFields: c.formFields ?? [],
});

router.get("/campaigns", async (req, res) => {
  const type = req.query.type as string | undefined;
  const rows = type
    ? await db.select().from(campaignsTable).where(eq(campaignsTable.type, type)).orderBy(campaignsTable.id)
    : await db.select().from(campaignsTable).orderBy(campaignsTable.id);
  res.json(rows.map(mapCampaign));
});

router.post("/campaigns", async (req, res) => {
  const { title, tag, description, applyLink, imageUrl, type, status, tagIds, formFields } = req.body;
  const [campaign] = await db.insert(campaignsTable)
    .values({ title, tag, description, applyLink, imageUrl, type, status: status ?? "active", tagIds: tagIds ?? [], formFields: formFields ?? [] })
    .returning();
  res.status(201).json(mapCampaign(campaign));
});

router.put("/campaigns/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, tag, description, applyLink, imageUrl, type, status, tagIds, formFields } = req.body;
  const [campaign] = await db.update(campaignsTable)
    .set({ title, tag, description, applyLink, imageUrl, type, status: status ?? "active", tagIds: tagIds ?? [], formFields: formFields ?? [] })
    .where(eq(campaignsTable.id, id))
    .returning();
  res.json(mapCampaign(campaign));
});

router.delete("/campaigns/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(campaignsTable).where(eq(campaignsTable.id, id));
  res.json({ success: true });
});

export default router;
