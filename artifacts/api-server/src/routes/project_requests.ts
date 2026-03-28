import { Router, type IRouter } from "express";
import { db, projectRequestsTable, kolsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/project-requests", async (_req, res) => {
  const rows = await db
    .select({
      id: projectRequestsTable.id,
      userId: projectRequestsTable.userId,
      projectName: projectRequestsTable.projectName,
      twitterLink: projectRequestsTable.twitterLink,
      websiteLink: projectRequestsTable.websiteLink,
      projectInfo: projectRequestsTable.projectInfo,
      campaignInfo: projectRequestsTable.campaignInfo,
      offer: projectRequestsTable.offer,
      selectedKolIds: projectRequestsTable.selectedKolIds,
      status: projectRequestsTable.status,
      createdAt: projectRequestsTable.createdAt,
      userLogin: usersTable.login,
    })
    .from(projectRequestsTable)
    .leftJoin(usersTable, eq(projectRequestsTable.userId, usersTable.id))
    .orderBy(desc(projectRequestsTable.createdAt));

  const kolIds = [...new Set(rows.flatMap((r) => r.selectedKolIds ?? []))];
  let kolMap: Record<number, { id: number; name: string; niche: string; imageUrl: string }> = {};
  if (kolIds.length > 0) {
    const kols = await db.select({ id: kolsTable.id, name: kolsTable.name, niche: kolsTable.niche, imageUrl: kolsTable.imageUrl }).from(kolsTable);
    for (const k of kols) {
      kolMap[k.id] = k;
    }
  }

  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      selectedKols: (r.selectedKolIds ?? []).map((id) => kolMap[id]).filter(Boolean),
    }))
  );
});

router.get("/project-requests/user/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const rows = await db
    .select()
    .from(projectRequestsTable)
    .where(eq(projectRequestsTable.userId, userId))
    .orderBy(desc(projectRequestsTable.createdAt));

  const kolIds = [...new Set(rows.flatMap((r) => r.selectedKolIds ?? []))];
  let kolMap: Record<number, { id: number; name: string; niche: string; imageUrl: string }> = {};
  if (kolIds.length > 0) {
    const kols = await db.select({ id: kolsTable.id, name: kolsTable.name, niche: kolsTable.niche, imageUrl: kolsTable.imageUrl }).from(kolsTable);
    for (const k of kols) {
      kolMap[k.id] = k;
    }
  }

  res.json(
    rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      selectedKols: (r.selectedKolIds ?? []).map((id) => kolMap[id]).filter(Boolean),
    }))
  );
});

router.post("/project-requests", async (req, res) => {
  const { userId, projectName, twitterLink, websiteLink, projectInfo, campaignInfo, offer, selectedKolIds } = req.body;

  if (!userId || !projectName || !twitterLink || !websiteLink || !projectInfo || !campaignInfo || !offer) {
    res.status(400).json({ error: "All required fields must be filled" });
    return;
  }

  const [row] = await db
    .insert(projectRequestsTable)
    .values({
      userId,
      projectName,
      twitterLink,
      websiteLink,
      projectInfo,
      campaignInfo,
      offer,
      selectedKolIds: selectedKolIds ?? [],
      status: "pending",
    })
    .returning();

  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.patch("/project-requests/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status. Use: pending, approved, rejected" });
    return;
  }

  const [row] = await db
    .update(projectRequestsTable)
    .set({ status })
    .where(eq(projectRequestsTable.id, id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  res.json({ ...row, createdAt: row.createdAt.toISOString() });
});

export default router;
