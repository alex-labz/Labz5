import { Router, type IRouter } from "express";
import { db, campaignSubmissionsTable, campaignsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/submissions", async (req, res) => {
  const rows = await db
    .select({
      id: campaignSubmissionsTable.id,
      campaignId: campaignSubmissionsTable.campaignId,
      userId: campaignSubmissionsTable.userId,
      answers: campaignSubmissionsTable.answers,
      status: campaignSubmissionsTable.status,
      createdAt: campaignSubmissionsTable.createdAt,
      campaignTitle: campaignsTable.title,
      campaignType: campaignsTable.type,
      userLogin: usersTable.login,
    })
    .from(campaignSubmissionsTable)
    .leftJoin(campaignsTable, eq(campaignSubmissionsTable.campaignId, campaignsTable.id))
    .leftJoin(usersTable, eq(campaignSubmissionsTable.userId, usersTable.id))
    .orderBy(desc(campaignSubmissionsTable.createdAt));
  res.json(rows);
});

router.get("/submissions/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const rows = await db
    .select({
      id: campaignSubmissionsTable.id,
      campaignId: campaignSubmissionsTable.campaignId,
      userId: campaignSubmissionsTable.userId,
      answers: campaignSubmissionsTable.answers,
      status: campaignSubmissionsTable.status,
      createdAt: campaignSubmissionsTable.createdAt,
      campaignTitle: campaignsTable.title,
      campaignType: campaignsTable.type,
      campaignImageUrl: campaignsTable.imageUrl,
    })
    .from(campaignSubmissionsTable)
    .leftJoin(campaignsTable, eq(campaignSubmissionsTable.campaignId, campaignsTable.id))
    .where(eq(campaignSubmissionsTable.userId, userId))
    .orderBy(desc(campaignSubmissionsTable.createdAt));
  res.json(rows);
});

router.post("/campaigns/:id/submissions", async (req, res) => {
  const campaignId = parseInt(req.params.id);
  const { userId, answers } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const existing = await db
    .select()
    .from(campaignSubmissionsTable)
    .where(eq(campaignSubmissionsTable.campaignId, campaignId))
    .then(rows => rows.find(r => r.userId === userId));
  if (existing) return res.status(409).json({ error: "Already applied" });

  const [sub] = await db
    .insert(campaignSubmissionsTable)
    .values({ campaignId, userId, answers: answers ?? {}, status: "pending" })
    .returning();
  res.status(201).json(sub);
});

router.put("/submissions/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!["pending", "approved", "rejected"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const [sub] = await db
    .update(campaignSubmissionsTable)
    .set({ status })
    .where(eq(campaignSubmissionsTable.id, id))
    .returning();
  res.json(sub);
});

router.delete("/submissions/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(campaignSubmissionsTable).where(eq(campaignSubmissionsTable.id, id));
  res.json({ success: true });
});

export default router;
