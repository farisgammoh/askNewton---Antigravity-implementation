import { type User, type InsertUser, type Lead, type InsertLead, type Persona, type InsertPersona, type Recommendation, type InsertRecommendation, users, leads, personas, recommendations } from "@shared/schema";
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
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private leads: Map<string, Lead>;
  private personas: Map<string, Persona>;
  private recommendations: Map<string, Recommendation>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.personas = new Map();
    this.recommendations = new Map();
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