import { pgTable, serial, text, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type FormFieldType = "text" | "textarea" | "url" | "number" | "select";

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  tag: text("tag").notNull(),
  description: text("description").notNull(),
  applyLink: text("apply_link").notNull(),
  imageUrl: text("image_url").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  tagIds: json("tag_ids").$type<number[]>().notNull().default([]),
  formFields: json("form_fields").$type<FormField[]>().notNull().default([]),
});

export const campaignSubmissionsTable = pgTable("campaign_submissions", {
  id: serial("id").primaryKey(),
  campaignId: serial("campaign_id").notNull(),
  userId: serial("user_id").notNull(),
  answers: json("answers").$type<Record<string, string>>().notNull().default({}),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
export type CampaignSubmission = typeof campaignSubmissionsTable.$inferSelect;
