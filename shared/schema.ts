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

// AI Personas table for Newtonian service design
export const personas = pgTable("personas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  personality: text("personality").notNull(),
  expertise: text("expertise").notNull(),
  communicationStyle: text("communication_style").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  targetPersonas: jsonb("target_personas").$type<string[]>().notNull(), // nomad, traveler, student
  newtonianValues: jsonb("newtonian_values").$type<{
    reliability: number;
    reassurance: number; 
    relevance: number;
    simplicity: number;
    timeliness: number;
    knowledgeability: number;
    fairValue: number;
  }>().notNull(),
  systemPrompt: text("system_prompt").notNull(),
  imageUrl: text("image_url"), // AI-generated persona image
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Persona recommendations table
export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").references(() => leads.id).notNull(),
  personaId: varchar("persona_id").references(() => personas.id).notNull(),
  recommendation: text("recommendation").notNull(),
  reasoning: text("reasoning").notNull(),
  confidence: jsonb("confidence").$type<{
    overall: number;
    relevance: number;
    expertise: number;
  }>().notNull(),
  actionItems: jsonb("action_items").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Persona schemas
export const insertPersonaSchema = createInsertSchema(personas).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true
});

// Validation schemas based on Newtonian principles
export const personaSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  title: z.string().min(5, "Title must be descriptive"),
  personality: z.string().min(20, "Personality must be detailed"),
  expertise: z.string().min(20, "Expertise must be detailed"),
  communicationStyle: z.enum(['warm_professional', 'direct_helpful', 'friendly_expert', 'reassuring_guide', 'knowledgeable_advisor']),
  specialties: z.array(z.string()).min(3, "Must have at least 3 specialties"),
  targetPersonas: z.array(z.enum(['nomad', 'traveler', 'student'])).min(1),
  newtonianValues: z.object({
    reliability: z.number().min(1).max(10),
    reassurance: z.number().min(1).max(10),
    relevance: z.number().min(1).max(10),
    simplicity: z.number().min(1).max(10),
    timeliness: z.number().min(1).max(10),
    knowledgeability: z.number().min(1).max(10),
    fairValue: z.number().min(1).max(10)
  }),
  systemPrompt: z.string().min(50, "System prompt must be comprehensive")
});

export const recommendationSchema = z.object({
  leadId: z.string().uuid(),
  personaId: z.string().uuid(),
  recommendation: z.string().min(50, "Recommendation must be detailed"),
  reasoning: z.string().min(30, "Reasoning must be clear"),
  confidence: z.object({
    overall: z.number().min(0).max(1),
    relevance: z.number().min(0).max(1),
    expertise: z.number().min(0).max(1)
  }),
  actionItems: z.array(z.string()).min(1, "Must have at least one action item")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type LeadFormData = z.infer<typeof leadSchema>;

export type InsertPersona = z.infer<typeof insertPersonaSchema>;
export type Persona = typeof personas.$inferSelect;
export type PersonaFormData = z.infer<typeof personaSchema>;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;
export type RecommendationFormData = z.infer<typeof recommendationSchema>;

// Chat system tables
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  title: text("title").default("New Chat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  fileUrls: jsonb("file_urls").$type<string[]>(),
  timestamp: timestamp("timestamp").defaultNow()
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalName: text("original_name").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: text("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  storageUrl: text("storage_url").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Chat schemas
export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true
});

export const insertUploadedFileSchema = createInsertSchema(uploadedFiles).omit({
  id: true,
  uploadedAt: true
});

export const messageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, "Message cannot be empty"),
  fileUrls: z.array(z.string().url()).optional()
});

export const fileUploadSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  fileSize: z.string(),
  mimeType: z.string(),
  storageUrl: z.string().url()
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type MessageFormData = z.infer<typeof messageSchema>;

export type InsertUploadedFile = z.infer<typeof insertUploadedFileSchema>;
export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type FileUploadData = z.infer<typeof fileUploadSchema>;

// Persona selections table - one selection per email
export const personaSelections = pgTable("persona_selections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(), // One selection per email
  personaId: varchar("persona_id").references(() => personas.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Persona selection schemas
export const insertPersonaSelectionSchema = createInsertSchema(personaSelections).omit({
  id: true,
  createdAt: true
});

export const personaSelectionSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  personaId: z.string().uuid("Invalid persona ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  notes: z.string().optional()
});

export type InsertPersonaSelection = z.infer<typeof insertPersonaSelectionSchema>;
export type PersonaSelection = typeof personaSelections.$inferSelect;
export type PersonaSelectionFormData = z.infer<typeof personaSelectionSchema>;

// Google Ads lead schema - flexible format for lead form submissions
export const googleAdsLeadSchema = z.object({
  // Required fields commonly provided by Google Ads
  email: z.string().email("Please enter a valid email address"),
  
  // Optional fields that may be provided
  name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone_number: z.string().optional(),
  phone: z.string().optional(),
  zip_code: z.string().optional(),
  postal_code: z.string().optional(),
  
  // Custom questions/fields
  persona_type: z.enum(['nomad', 'traveler', 'student']).optional(),
  stay_length: z.string().optional(),
  arrival_date: z.string().optional(),
  current_coverage: z.string().optional(),
  notes: z.string().optional(),
  message: z.string().optional(),
  
  // Flexible field for any additional Google Ads data
  gclid: z.string().optional(), // Google Click Identifier
  campaign_id: z.string().optional(),
  ad_group_id: z.string().optional(),
  keyword: z.string().optional()
}).refine(
  (data) => data.name || (data.first_name && data.last_name),
  {
    message: "Either 'name' or both 'first_name' and 'last_name' must be provided",
    path: ["name"]
  }
);

export type GoogleAdsLeadData = z.infer<typeof googleAdsLeadSchema>;
