import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const VALID_RANKS = ["beginner", "advanced", "elite", "early"];

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    login: u.login,
    rank: u.rank ?? "beginner",
    evmWallet: u.evmWallet ?? null,
    bio: u.bio ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.id);
  res.json(users.map(formatUser));
});

router.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/:id/profile", async (req, res) => {
  const id = parseInt(req.params.id);
  const { evmWallet, bio } = req.body;
  const [user] = await db.update(usersTable)
    .set({
      evmWallet: evmWallet !== undefined ? evmWallet || null : undefined,
      bio: bio !== undefined ? bio || null : undefined,
    })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

router.patch("/users/:id/rank", async (req, res) => {
  const id = parseInt(req.params.id);
  const { rank } = req.body;
  if (!VALID_RANKS.includes(rank)) {
    res.status(400).json({ error: `Invalid rank. Must be one of: ${VALID_RANKS.join(", ")}` });
    return;
  }
  const [user] = await db.update(usersTable)
    .set({ rank })
    .where(eq(usersTable.id, id))
    .returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

export default router;
