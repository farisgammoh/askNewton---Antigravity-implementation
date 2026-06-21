import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface Lead {
  id?: string;
  email: string;
  phone?: string;
  language: string;
  state: string;
  consentToContact: boolean;
  consentTimestamp: string;
  sourcePage: string;
}

export interface Reminder {
  id?: string;
  leadId: string;
  windowType: string;
  deadlineDate: string;
  channel: 'email' | 'whatsapp';
  optedIn: boolean;
  optOutToken: string;
}

export interface ConsentLog {
  id?: string;
  leadId?: string;
  purpose: string;
  grantedAt: string;
  scope: string;
}

const LOCAL_DB_PATH = path.join(process.cwd(), 'db.json');

// Interface for DB operations
export interface Database {
  saveLead(lead: Lead): Promise<string>;
  saveReminder(reminder: Reminder): Promise<string>;
  saveConsentLog(log: ConsentLog): Promise<string>;
  getLeadsCount(): Promise<number>;
}

// 1. JSON Local DB implementation
class LocalJsonDatabase implements Database {
  private readDb() {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      return { leads: [], reminders: [], consentLogs: [] };
    }
    try {
      const content = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      return JSON.parse(content);
    } catch {
      return { leads: [], reminders: [], consentLogs: [] };
    }
  }

  private writeDb(data: any) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  }

  async saveLead(lead: Lead): Promise<string> {
    const data = this.readDb();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLead = { ...lead, id };
    data.leads.push(newLead);
    this.writeDb(data);
    return id;
  }

  async saveReminder(reminder: Reminder): Promise<string> {
    const data = this.readDb();
    const id = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReminder = { ...reminder, id };
    data.reminders.push(newReminder);
    this.writeDb(data);
    return id;
  }

  async saveConsentLog(log: ConsentLog): Promise<string> {
    const data = this.readDb();
    const id = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLog = { ...log, id };
    data.consentLogs.push(newLog);
    this.writeDb(data);
    return id;
  }

  async getLeadsCount(): Promise<number> {
    const data = this.readDb();
    return data.leads.length;
  }
}

// 2. PostgreSQL DB implementation
class PostgresDatabase implements Database {
  private pool: Pool;
  private initialized = false;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // common for Replit/Neon/Render databases
      }
    });
  }

  private async ensureSchema() {
    if (this.initialized) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create leads table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leads (
          id VARCHAR(100) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          language VARCHAR(10) NOT NULL,
          state VARCHAR(50) NOT NULL,
          consent_to_contact BOOLEAN NOT NULL,
          consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
          source_page VARCHAR(100) NOT NULL
        )
      `);

      // Create reminders table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reminders (
          id VARCHAR(100) PRIMARY KEY,
          lead_id VARCHAR(100) NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
          window_type VARCHAR(100) NOT NULL,
          deadline_date VARCHAR(50) NOT NULL,
          channel VARCHAR(20) NOT NULL,
          opted_in BOOLEAN NOT NULL,
          opt_out_token VARCHAR(100) NOT NULL
        )
      `);

      // Create consent_log table
      await client.query(`
        CREATE TABLE IF NOT EXISTS consent_log (
          id VARCHAR(100) PRIMARY KEY,
          lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE SET NULL,
          purpose VARCHAR(255) NOT NULL,
          granted_at TIMESTAMP WITH TIME ZONE NOT NULL,
          scope VARCHAR(255) NOT NULL
        )
      `);

      await client.query('COMMIT');
      this.initialized = true;
      console.log('Postgres Database schema verified/initialized successfully.');
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error initializing PostgreSQL schemas:', e);
      throw e;
    } finally {
      client.release();
    }
  }

  async saveLead(lead: Lead): Promise<string> {
    await this.ensureSchema();
    const id = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.pool.query(
      `INSERT INTO leads (id, email, phone, language, state, consent_to_contact, consent_timestamp, source_page)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        lead.email,
        lead.phone || null,
        lead.language,
        lead.state,
        lead.consentToContact,
        lead.consentTimestamp,
        lead.sourcePage
      ]
    );
    return id;
  }

  async saveReminder(reminder: Reminder): Promise<string> {
    await this.ensureSchema();
    const id = `rem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.pool.query(
      `INSERT INTO reminders (id, lead_id, window_type, deadline_date, channel, opted_in, opt_out_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        reminder.leadId,
        reminder.windowType,
        reminder.deadlineDate,
        reminder.channel,
        reminder.optedIn,
        reminder.optOutToken
      ]
    );
    return id;
  }

  async saveConsentLog(log: ConsentLog): Promise<string> {
    await this.ensureSchema();
    const id = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await this.pool.query(
      `INSERT INTO consent_log (id, lead_id, purpose, granted_at, scope)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        log.leadId || null,
        log.purpose,
        log.grantedAt,
        log.scope
      ]
    );
    return id;
  }

  async getLeadsCount(): Promise<number> {
    await this.ensureSchema();
    const res = await this.pool.query('SELECT COUNT(*) FROM leads');
    return parseInt(res.rows[0].count, 10);
  }
}

// Factory to export database instance
const databaseUrl = process.env.DATABASE_URL;
export const db: Database = databaseUrl
  ? new PostgresDatabase(databaseUrl)
  : new LocalJsonDatabase();
export default db;
