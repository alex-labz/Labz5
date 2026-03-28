import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    res.status(400).json({ error: "Login and password are required" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.login, login.trim())).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "This login is already taken. Please choose another." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable)
    .values({ login: login.trim(), passwordHash })
    .returning();

  res.status(201).json({ id: user.id, login: user.login, createdAt: user.createdAt.toISOString() });
});

router.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    res.status(400).json({ error: "Login and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.login, login.trim())).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid login or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid login or password" });
    return;
  }

  res.json({ id: user.id, login: user.login, createdAt: user.createdAt.toISOString() });
});

export default router;
