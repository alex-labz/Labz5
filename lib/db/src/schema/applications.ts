import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  telegram: text("telegram").notNull(),
  socialMedia: text("social_media").notNull(),
  additionalLink1: text("additional_link1"),
  additionalLink2: text("additional_link2"),
  about: text("about").notNull(),
  status: text("status").notNull().default("pending"),
  userId: integer("user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
