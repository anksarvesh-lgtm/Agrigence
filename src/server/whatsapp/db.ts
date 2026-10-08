import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'whatsapp_db.json');

export interface Template { id: string; name: string; content: string; }
export interface Contact { id: string; phone: string; name: string; groupId: string; }
export interface Group { id: string; name: string; }
export interface EventMapping { id: string; eventId: string; templateId: string; groupId: string; }
export interface Token { id: string; token: string; name: string; isActive: boolean; }
export interface DailyUsage { tokenId: string; date: string; count: number; }
export interface MessageLog { id: string; to: string; body: string; status: 'queued' | 'sent' | 'failed' | 'scheduled'; queuedAt: string; sentAt?: string; error?: string; tokenId?: string; }

interface Schema {
  templates: Template[];
  contacts: Contact[];
  groups: Group[];
  eventMappings: EventMapping[];
  tokens: Token[];
  dailyUsage: DailyUsage[];
  messages: MessageLog[];
}

const defaultData: Schema = {
  templates: [],
  contacts: [],
  groups: [],
  eventMappings: [],
  tokens: [],
  dailyUsage: [],
  messages: []
};

class LocalDB {
  private data: Schema = defaultData;

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = { ...defaultData, ...JSON.parse(raw) };
      } catch (e) {
        console.error('Failed to parse DB, using defaults.');
      }
    } else {
      this.save();
    }
  }

  private save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  get<T extends keyof Schema>(collection: T): Schema[T] {
    return this.data[collection] || [];
  }

  insert<T extends keyof Schema>(collection: T, item: any): any {
    const newItem = { id: uuidv4(), ...item };
    (this.data[collection] as any[]).push(newItem);
    this.save();
    return newItem;
  }

  update<T extends keyof Schema>(collection: T, id: string, updates: any) {
    const arr = this.data[collection] as any[];
    const index = arr.findIndex(i => i.id === id);
    if (index >= 0) {
      arr[index] = { ...arr[index], ...updates };
      this.save();
      return arr[index];
    }
    return null;
  }

  delete<T extends keyof Schema>(collection: T, id: string) {
    const arr = this.data[collection] as any[];
    this.data[collection] = arr.filter(i => i.id !== id) as Schema[T];
    this.save();
  }
  incrementUsage(tokenId: string, date: string) {
    let usage = this.data.dailyUsage.find(u => u.tokenId === tokenId && u.date === date);
    if (!usage) {
      usage = { tokenId, date, count: 0 };
      this.data.dailyUsage.push(usage);
    }
    usage.count += 1;
    this.save();
  }

  saveData() {
    this.save();
  }
}

export const db = new LocalDB();
