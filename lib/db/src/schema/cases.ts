import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  project: text("project").notNull(),
  result: text("result").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true });
export type InsertCase = z.infer<typeof insertCaseSchema>;
export type Case = typeof casesTable.$inferSelect;
