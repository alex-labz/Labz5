import { pgTable, serial, text, json, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectRequestsTable = pgTable("project_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectName: text("project_name").notNull(),
  twitterLink: text("twitter_link").notNull(),
  websiteLink: text("website_link").notNull(),
  projectInfo: text("project_info").notNull(),
  campaignInfo: text("campaign_info").notNull(),
  offer: text("offer").notNull(),
  selectedKolIds: json("selected_kol_ids").$type<number[]>().notNull().default([]),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectRequestSchema = createInsertSchema(projectRequestsTable).omit({ id: true, createdAt: true });
export type InsertProjectRequest = z.infer<typeof insertProjectRequestSchema>;
export type ProjectRequest = typeof projectRequestsTable.$inferSelect;
