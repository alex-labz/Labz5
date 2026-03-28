import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function formatPost(p: typeof postsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    content: p.content,
    imageUrl: p.imageUrl ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/posts", async (_req, res) => {
  const posts = await db.select().from(postsTable).orderBy(postsTable.createdAt);
  res.json(posts.map(formatPost).reverse());
});

router.post("/posts", async (req, res) => {
  const { title, content, imageUrl } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "title and content are required" });
    return;
  }
  const [post] = await db.insert(postsTable)
    .values({ title, content, imageUrl: imageUrl || null })
    .returning();
  res.status(201).json(formatPost(post));
});

router.delete("/posts/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.json({ success: true });
});

export default router;
