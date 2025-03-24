import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// For a token checker, we don't need a database table for tokens
// since we're just validating them against Discord's API
// But we'll create a schema for token validation

// Schema for single token input
export const tokenSchema = z.object({
  token: z.string().min(50).regex(/\./, "Token must contain a period (.)"),
});

export type TokenInput = z.infer<typeof tokenSchema>;

// Schema for bulk token input (multiple tokens)
export const bulkTokenSchema = z.object({
  tokens: z.string(),
});

export type BulkTokenInput = z.infer<typeof bulkTokenSchema>;

// Discord user response schema based on the API
export const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  discriminator: z.string(),
  avatar: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  mfa_enabled: z.boolean().optional(),
  verified: z.boolean().optional(),
  flags: z.number().optional(),
  premium_type: z.number().optional(),
  public_flags: z.number().optional(),
  banner: z.string().nullable().optional(),
  accent_color: z.number().nullable().optional(),
  locale: z.string().optional(),
});

// Add a token field to the result so we can associate tokens with their user data
export const tokenResultSchema = z.object({
  token: z.string(),
  valid: z.boolean(),
  user: discordUserSchema.optional(),
  error: z.string().optional(),
});

export type DiscordUser = z.infer<typeof discordUserSchema>;
export type TokenResult = z.infer<typeof tokenResultSchema>;

// For compatibility with the existing storage implementation
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
