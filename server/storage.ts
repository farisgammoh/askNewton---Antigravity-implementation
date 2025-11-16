import { type User, type InsertUser, type Lead, type InsertLead, type Persona, type InsertPersona, type Recommendation, type InsertRecommendation, type Conversation, type Message, type UploadedFile, type InsertConversation, type InsertMessage, type InsertUploadedFile, type PersonaSelection, type InsertPersonaSelection, type PersonaCache, type InsertPersonaCache, type RequestLog, type InsertRequestLog, users, leads, personas, recommendations, conversations, messages, uploadedFiles, personaSelections, personaCache, requestLog } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  
  // Persona methods
  createPersona(persona: InsertPersona): Promise<Persona>;
  getPersonas(): Promise<Persona[]>;
  getPersona(id: string): Promise<Persona | undefined>;
  
  // Recommendation methods
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  getLeadRecommendations(leadId: string): Promise<Recommendation[]>;
  
  // Chat methods
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(userId?: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: string): Promise<Message[]>;
  
  // File upload methods
  createUploadedFile(file: InsertUploadedFile): Promise<UploadedFile>;
  getUploadedFile(id: string): Promise<UploadedFile | undefined>;
  
  // Persona selection methods
  createPersonaSelection(selection: InsertPersonaSelection): Promise<PersonaSelection>;
  getPersonaSelectionByEmail(email: string): Promise<PersonaSelection | undefined>;
  getPersonaSelections(): Promise<PersonaSelection[]>;
  
  // Persona cache methods (cost optimization)
  createPersonaCache(cache: InsertPersonaCache): Promise<PersonaCache>;
  getPersonaCache(inputHash: string): Promise<PersonaCache | undefined>;
  
  // Request log methods (idempotency)
  createRequestLog(log: InsertRequestLog): Promise<RequestLog>;
  getRequestLog(requestHash: string): Promise<RequestLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor(database: any) {
    this.db = database;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await this.db
      .insert(leads)
      .values({
        ...insertLead,
        phone: insertLead.phone?.trim() || null,
        address: insertLead.address?.trim() || null,
        budgetOrNetwork: insertLead.budgetOrNetwork?.trim() || null,
        notes: insertLead.notes?.trim() || null,
        status: insertLead.status || null,
        preexisting: !!insertLead.preexisting,
        consent: !!insertLead.consent,
      })
      .returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await this.db.select().from(leads);
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await this.db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createPersona(insertPersona: InsertPersona): Promise<Persona> {
    const [persona] = await this.db
      .insert(personas)
      .values(insertPersona)
      .returning();
    return persona;
  }

  async getPersonas(): Promise<Persona[]> {
    return await this.db.select().from(personas).where(eq(personas.isActive, true));
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    const [persona] = await this.db.select().from(personas).where(eq(personas.id, id));
    return persona || undefined;
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await this.db
      .insert(recommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  async getLeadRecommendations(leadId: string): Promise<Recommendation[]> {
    return await this.db.select().from(recommendations).where(eq(recommendations.leadId, leadId));
  }
  
  // Chat methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const [conversation] = await this.db
      .insert(conversations)
      .values(insertConversation)
      .returning();
    return conversation;
  }

  async getConversations(userId?: string): Promise<Conversation[]> {
    if (userId) {
      return await this.db.select().from(conversations).where(eq(conversations.userId, userId));
    }
    return await this.db.select().from(conversations);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await this.db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    await this.db.update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await this.db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return await this.db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async createUploadedFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const [file] = await this.db
      .insert(uploadedFiles)
      .values(insertFile)
      .returning();
    return file;
  }

  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    const [file] = await this.db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
    return file || undefined;
  }

  // Persona selection methods
  async createPersonaSelection(insertSelection: InsertPersonaSelection): Promise<PersonaSelection> {
    const [selection] = await this.db
      .insert(personaSelections)
      .values(insertSelection)
      .returning();
    return selection;
  }

  async getPersonaSelectionByEmail(email: string): Promise<PersonaSelection | undefined> {
    const [selection] = await this.db.select().from(personaSelections)
      .where(eq(personaSelections.email, email));
    return selection || undefined;
  }

  async getPersonaSelections(): Promise<PersonaSelection[]> {
    return await this.db.select().from(personaSelections);
  }

  // Persona cache methods
  async createPersonaCache(insertCache: InsertPersonaCache): Promise<PersonaCache> {
    const [cache] = await this.db
      .insert(personaCache)
      .values(insertCache)
      .returning();
    return cache;
  }

  async getPersonaCache(inputHash: string): Promise<PersonaCache | undefined> {
    const [cache] = await this.db.select().from(personaCache)
      .where(eq(personaCache.inputHash, inputHash));
    return cache || undefined;
  }

  // Request log methods
  async createRequestLog(insertLog: InsertRequestLog): Promise<RequestLog> {
    const [log] = await this.db
      .insert(requestLog)
      .values(insertLog)
      .returning();
    return log;
  }

  async getRequestLog(requestHash: string): Promise<RequestLog | undefined> {
    const [log] = await this.db.select().from(requestLog)
      .where(eq(requestLog.requestHash, requestHash));
    return log || undefined;
  }
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private personas: Map<string, Persona>;
  private recommendations: Map<string, Recommendation>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private uploadedFiles: Map<string, UploadedFile>;
  private personaSelections: Map<string, PersonaSelection>;
  private personaCaches: Map<string, PersonaCache>;
  private requestLogs: Map<string, RequestLog>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.personas = new Map();
    this.recommendations = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.uploadedFiles = new Map();
    this.personaSelections = new Map();
    this.personaCaches = new Map();
    this.requestLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead,
      phone: insertLead.phone?.trim() || null,
      address: insertLead.address?.trim() || null,
      budgetOrNetwork: insertLead.budgetOrNetwork?.trim() || null,
      notes: insertLead.notes?.trim() || null,
      status: insertLead.status || null,
      preexisting: !!insertLead.preexisting,
      consent: !!insertLead.consent,
      id, 
      createdAt: new Date()
    };
    this.leads.set(id, lead);
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createPersona(insertPersona: InsertPersona): Promise<Persona> {
    const id = randomUUID();
    const persona: Persona = { 
      ...insertPersona,
      specialties: insertPersona.specialties as string[],
      targetPersonas: insertPersona.targetPersonas as string[],
      newtonianValues: insertPersona.newtonianValues as any,
      imageUrl: insertPersona.imageUrl ?? null,
      isActive: insertPersona.isActive ?? true,
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.personas.set(id, persona);
    return persona;
  }

  async getPersonas(): Promise<Persona[]> {
    return Array.from(this.personas.values()).filter(p => p.isActive);
  }

  async getPersona(id: string): Promise<Persona | undefined> {
    return this.personas.get(id);
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = randomUUID();
    const recommendation: Recommendation = { 
      ...insertRecommendation,
      actionItems: insertRecommendation.actionItems as string[],
      confidence: insertRecommendation.confidence as any,
      id, 
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async getLeadRecommendations(leadId: string): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(r => r.leadId === leadId);
  }
  
  // Chat methods
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      title: insertConversation.title || "New Chat",
      userId: insertConversation.userId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversations(userId?: string): Promise<Conversation[]> {
    const allConversations = Array.from(this.conversations.values());
    if (userId) {
      return allConversations.filter(c => c.userId === userId);
    }
    return allConversations;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.conversations.set(id, conversation);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      fileUrls: insertMessage.fileUrls ? [...insertMessage.fileUrls] : null,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createUploadedFile(insertFile: InsertUploadedFile): Promise<UploadedFile> {
    const id = randomUUID();
    const file: UploadedFile = {
      ...insertFile,
      id,
      uploadedAt: new Date()
    };
    this.uploadedFiles.set(id, file);
    return file;
  }

  async getUploadedFile(id: string): Promise<UploadedFile | undefined> {
    return this.uploadedFiles.get(id);
  }

  // Persona selection methods
  async createPersonaSelection(insertSelection: InsertPersonaSelection): Promise<PersonaSelection> {
    const id = randomUUID();
    const selection: PersonaSelection = {
      ...insertSelection,
      phone: insertSelection.phone ?? null,
      notes: insertSelection.notes ?? null,
      id,
      createdAt: new Date()
    };
    this.personaSelections.set(id, selection);
    return selection;
  }

  async getPersonaSelectionByEmail(email: string): Promise<PersonaSelection | undefined> {
    return Array.from(this.personaSelections.values())
      .find(selection => selection.email === email);
  }

  async getPersonaSelections(): Promise<PersonaSelection[]> {
    return Array.from(this.personaSelections.values());
  }

  // Persona cache methods
  async createPersonaCache(insertCache: InsertPersonaCache): Promise<PersonaCache> {
    const id = randomUUID();
    const cache: PersonaCache = {
      ...insertCache,
      id,
      createdAt: new Date()
    };
    this.personaCaches.set(insertCache.inputHash!, cache);
    return cache;
  }

  async getPersonaCache(inputHash: string): Promise<PersonaCache | undefined> {
    return this.personaCaches.get(inputHash);
  }

  // Request log methods
  async createRequestLog(insertLog: InsertRequestLog): Promise<RequestLog> {
    const id = randomUUID();
    const log: RequestLog = {
      ...insertLog,
      id,
      createdAt: new Date()
    };
    this.requestLogs.set(insertLog.requestHash!, log);
    return log;
  }

  async getRequestLog(requestHash: string): Promise<RequestLog | undefined> {
    return this.requestLogs.get(requestHash);
  }
}

// Lazy storage initialization
let storageInstance: IStorage | null = null;

async function getStorage(): Promise<IStorage> {
  if (storageInstance) {
    return storageInstance;
  }

  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("./db");
      // Test database connection
      await db.select().from(leads).limit(1);
      storageInstance = new DatabaseStorage(db);
      console.log('Using database storage');
      return storageInstance;
    } catch (error) {
      console.warn('Database connection failed, falling back to memory storage:', error);
    }
  }
  
  storageInstance = new MemStorage();
  console.log('Using memory storage');
  return storageInstance;
}

export { getStorage as storage };