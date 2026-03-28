import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kolsTable = pgTable("kols", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  followers: text("followers").notNull(),
  niche: text("niche").notNull(),
  imageUrl: text("image_url").notNull(),
  twitter: text("twitter"),
  telegram: text("telegram"),
});

export const insertKolSchema = createInsertSchema(kolsTable).omit({ id: true });
export type InsertKol = z.infer<typeof insertKolSchema>;
export type Kol = typeof kolsTable.$inferSelect;
