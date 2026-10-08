import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { sendWhatsAppMessage } from './whapi.ts';
import { db } from './db.ts';

// Configuration
let REDIS_URL = process.env.REDIS_URL || '';

// Sanity check to prevent EISDIR errors if REDIS_URL is misconfigured as "/", "redis:///", passing just the scheme, or without a valid host
if (!REDIS_URL || !REDIS_URL.includes('://') || REDIS_URL === 'redis://' || REDIS_URL === 'redis:///') {
  console.warn(`[WhatsApp] Invalid or missing REDIS_URL detected. Falling back to default.`);
  REDIS_URL = 'redis://127.0.0.1:6379';
}

// Mock connection
export const connection = null;

// Build a mock Queue to prevent breaking imports
class MockQueue {
  async add(name: string, data: any, opts: any = {}) {
    // Return mock job
    return { id: Math.random().toString(), data, name, opts };
  }
}

export const whatsappQueue = new MockQueue();

// Define an asynchronous in-memory processor
const processJobLocally = async (to: string, body: string, messageId: string) => {
  try {
    const result = await sendWhatsAppMessage(to, body);
    if (!result.success && result.reason === 'LIMIT_EXCEEDED') {
      db.update('messages', messageId, { status: 'scheduled' });
    } else if (result.success) {
      db.update('messages', messageId, { status: 'sent', sentAt: new Date().toISOString(), tokenId: result.tokenId });
    } else {
      db.update('messages', messageId, { status: 'failed', error: result.reason });
    }
  } catch (e: any) {
    db.update('messages', messageId, { status: 'failed', error: e.message });
  }
};

export const queueMessage = async (to: string, body: string) => {
  // Check for duplicates in last 5 mins
  const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
  const recentDups = db.get('messages').find(m => m.to === to && m.body === body && m.queuedAt >= fiveMinsAgo);
  
  if (recentDups) {
    console.log(`[Queue] Skipped duplicate message to ${to}`);
    return null;
  }

  const log = db.insert('messages', {
    to,
    body,
    status: 'queued',
    queuedAt: new Date().toISOString()
  });

  // Process locally since Redis is unavailable in sandbox
  console.log("[Queue] Processing job locally in-memory.");
  setTimeout(() => {
    processJobLocally(to, body, log.id);
  }, 100);

  return log;
};
