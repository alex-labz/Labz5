import { Router, type IRouter } from "express";
import { db, kolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/kols", async (req, res) => {
  const kols = await db.select().from(kolsTable).orderBy(kolsTable.id);
  res.json(kols.map(k => ({
    id: k.id,
    name: k.name,
    followers: k.followers,
    niche: k.niche,
    imageUrl: k.imageUrl,
    twitter: k.twitter,
    telegram: k.telegram,
  })));
});

router.post("/kols", async (req, res) => {
  const { name, followers, niche, imageUrl, twitter, telegram } = req.body;
  const [kol] = await db.insert(kolsTable).values({
    name, followers, niche, imageUrl, twitter: twitter || null, telegram: telegram || null,
  }).returning();
  res.status(201).json({
    id: kol.id, name: kol.name, followers: kol.followers, niche: kol.niche,
    imageUrl: kol.imageUrl, twitter: kol.twitter, telegram: kol.telegram,
  });
});

router.put("/kols/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, followers, niche, imageUrl, twitter, telegram } = req.body;
  const [kol] = await db.update(kolsTable)
    .set({ name, followers, niche, imageUrl, twitter: twitter || null, telegram: telegram || null })
    .where(eq(kolsTable.id, id))
    .returning();
  res.json({
    id: kol.id, name: kol.name, followers: kol.followers, niche: kol.niche,
    imageUrl: kol.imageUrl, twitter: kol.twitter, telegram: kol.telegram,
  });
});

router.delete("/kols/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(kolsTable).where(eq(kolsTable.id, id));
  res.json({ success: true });
});

export default router;
