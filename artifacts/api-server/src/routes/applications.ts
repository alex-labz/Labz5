import { Router, type IRouter } from "express";
import { db, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/applications", async (_req, res) => {
  const apps = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);
  res.json(apps.map(a => ({
    id: a.id,
    type: a.type,
    name: a.name,
    telegram: a.telegram,
    socialMedia: a.socialMedia,
    additionalLink1: a.additionalLink1,
    additionalLink2: a.additionalLink2,
    about: a.about,
    status: a.status,
    userId: a.userId,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.get("/applications/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.userId, userId));
  res.json(apps.map(a => ({
    id: a.id,
    type: a.type,
    name: a.name,
    telegram: a.telegram,
    socialMedia: a.socialMedia,
    additionalLink1: a.additionalLink1,
    additionalLink2: a.additionalLink2,
    about: a.about,
    status: a.status,
    userId: a.userId,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.patch("/applications/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!["verified", "rejected", "pending"].includes(status)) {
    res.status(400).json({ error: "Invalid status. Must be: verified, rejected, or pending" });
    return;
  }

  const [app] = await db.update(applicationsTable)
    .set({ status })
    .where(eq(applicationsTable.id, id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json({
    id: app.id,
    type: app.type,
    name: app.name,
    telegram: app.telegram,
    socialMedia: app.socialMedia,
    additionalLink1: app.additionalLink1,
    additionalLink2: app.additionalLink2,
    about: app.about,
    status: app.status,
    userId: app.userId,
    createdAt: app.createdAt.toISOString(),
  });
});

router.post("/applications", async (req, res) => {
  const { type, name, telegram, socialMedia, additionalLink1, additionalLink2, about, userId } = req.body;
  const [app] = await db.insert(applicationsTable)
    .values({
      type, name, telegram, socialMedia,
      additionalLink1: additionalLink1 || null,
      additionalLink2: additionalLink2 || null,
      about,
      status: "pending",
      userId: userId || null,
    })
    .returning();
  res.status(201).json({
    id: app.id,
    type: app.type,
    name: app.name,
    telegram: app.telegram,
    socialMedia: app.socialMedia,
    additionalLink1: app.additionalLink1,
    additionalLink2: app.additionalLink2,
    about: app.about,
    status: app.status,
    userId: app.userId,
    createdAt: app.createdAt.toISOString(),
  });
});

export default router;
