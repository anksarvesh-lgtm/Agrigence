import { EventEmitter } from 'events';
import { db } from './db.js';
import { queueMessage } from './queue.js';

class WhatsAppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setupListeners();
  }

  private setupListeners() {
    // 1. Listen to 'app_event'
    this.on('app_event', async (eventName: string, payload: Record<string, any>) => {
      console.log(`[EventBus] Received event: ${eventName}`);
      
      // Find mappings for this event
      const mappings = db.get('eventMappings').filter((em: any) => em.eventId === eventName);
      
      if (mappings.length === 0) {
        console.log(`[EventBus] No WhatsApp event mappings found for ${eventName}`);
        return;
      }

      for (const map of mappings) {
        const template = db.get('templates').find((t: any) => t.id === map.templateId);
        const contacts = db.get('contacts').filter((c: any) => c.groupId === map.groupId);

        if (!template || contacts.length === 0) continue;

        // Render & Send
        for (const contact of contacts) {
          const body = this.renderTemplate(template.content, { ...payload, name: contact.name, phone: contact.phone });
          await queueMessage(contact.phone, body);
        }
      }
    });
  }

  private renderTemplate(templateString: string, variables: Record<string, any>): string {
    return templateString.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
    });
  }

  public emitAppEvent(eventName: string, payload: Record<string, any>) {
    this.emit('app_event', eventName, payload);
  }
}

export const eventBus = new WhatsAppEventBus();
