import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  persona: text("persona").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  arrivalDate: text("arrival_date").notNull(),
  stayLength: text("stay_length").notNull(),
  status: text("status"),
  currentCoverage: text("current_coverage").notNull(),
  preexisting: boolean("preexisting").notNull().default(false),
  notes: text("notes"),
  dependents: text("dependents").notNull(),
  zip: text("zip").notNull(),
  address: text("address"),
  budgetOrNetwork: text("budget_or_network"),
  consent: boolean("consent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const leadSchema = z.object({
  persona: z.enum(['nomad', 'traveler', 'student']),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date"),
  stayLength: z.enum(['lt90', '3to6', '6to12', '12plus']),
  status: z.enum(['ESTA', 'B1', 'B2', 'F1', 'J1', 'Other']).optional(),
  currentCoverage: z.enum(['none','travel','employer','university','marketplace','other']),
  preexisting: z.boolean(),
  notes: z.string().optional(),
  dependents: z.enum(['none','spouse','children','both']),
  zip: z.string().min(5, "ZIP code must be at least 5 characters").max(10),
  address: z.string().optional(),
  budgetOrNetwork: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) })
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type LeadFormData = z.infer<typeof leadSchema>;
