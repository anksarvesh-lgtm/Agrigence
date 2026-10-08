import express from 'express';
import { db } from './db.ts';
import { eventBus } from './eventBus.ts';
import { queueMessage } from './queue.ts';

export const whatsappRouter = express.Router();

whatsappRouter.use(express.json());

// TEMPLATES
whatsappRouter.get('/templates', (req, res) => res.json(db.get('templates')));
whatsappRouter.post('/templates', (req, res) => res.json(db.insert('templates', req.body)));
whatsappRouter.put('/templates/:id', (req, res) => res.json(db.update('templates', req.params.id, req.body)));
whatsappRouter.delete('/templates/:id', (req, res) => { db.delete('templates', req.params.id); res.json({ success: true }); });

// GROUPS
whatsappRouter.get('/groups', (req, res) => res.json(db.get('groups')));
whatsappRouter.post('/groups', (req, res) => res.json(db.insert('groups', req.body)));
whatsappRouter.delete('/groups/:id', (req, res) => { db.delete('groups', req.params.id); res.json({ success: true }); });

// CONTACTS
whatsappRouter.get('/contacts', (req, res) => res.json(db.get('contacts')));
whatsappRouter.post('/contacts', (req, res) => res.json(db.insert('contacts', req.body)));
whatsappRouter.delete('/contacts/:id', (req, res) => { db.delete('contacts', req.params.id); res.json({ success: true }); });

// IMPORTS
whatsappRouter.post('/contacts/import', (req, res) => {
  const { contacts } = req.body; // Array of { name, phone, groupId }
  const inserted = contacts.map((c: any) => db.insert('contacts', c));
  res.json({ success: true, count: inserted.length });
});

// TOKENS
whatsappRouter.get('/tokens', (req, res) => res.json(db.get('tokens')));
whatsappRouter.post('/tokens', (req, res) => res.json(db.insert('tokens', req.body)));
whatsappRouter.put('/tokens/:id', (req, res) => res.json(db.update('tokens', req.params.id, req.body)));
whatsappRouter.delete('/tokens/:id', (req, res) => { db.delete('tokens', req.params.id); res.json({ success: true }); });

// EVENT MAPPINGS
whatsappRouter.get('/mappings', (req, res) => res.json(db.get('eventMappings')));
whatsappRouter.post('/mappings', (req, res) => res.json(db.insert('eventMappings', req.body)));
whatsappRouter.delete('/mappings/:id', (req, res) => { db.delete('eventMappings', req.params.id); res.json({ success: true }); });

// LOGS
whatsappRouter.get('/logs', (req, res) => {
  const logs = db.get('messages').sort((a: any, b: any) => new Date(b.queuedAt).getTime() - new Date(a.queuedAt).getTime());
  res.json(logs.slice(0, 100)); // Last 100 logs
});

whatsappRouter.get('/usage', (req, res) => {
  res.json(db.get('dailyUsage'));
});

// AUTO-SYNC USERS FROM FIRESTORE
whatsappRouter.post('/sync-users', async (req, res) => {
  try {
    const projectId = 'gen-lang-client-0276037966';
    const firestoreRes = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`);
    
    if (!firestoreRes.ok) {
      throw new Error('Failed to fetch users from Firestore');
    }

    const data = await firestoreRes.json();
    const documents = data.documents || [];
    
    // Ensure "All Users" group exists
    let allUsersGroup: any = db.get('groups').find((g: any) => g.name === 'All Users');
    if (!allUsersGroup) {
      allUsersGroup = db.insert('groups', { name: 'All Users' });
    }

    if (!allUsersGroup) {
      throw new Error('Failed to create or find "All Users" group');
    }

    let syncedCount = 0;
    const existingContacts = db.get('contacts');

    for (const doc of documents) {
      const fields = doc.fields || {};
      const name = fields.name?.stringValue || 'Unknown';
      const phone = fields.mobileNumber?.stringValue || fields.phone?.stringValue;

      if (phone) {
        // Simple check if contact already exists
        const exists = existingContacts.find((c: any) => c.phone === phone);
        if (!exists) {
          db.insert('contacts', {
            name,
            phone,
            groupId: allUsersGroup.id
          });
          syncedCount++;
        }
      }
    }

    res.json({ success: true, count: syncedCount, totalProcessed: documents.length });
  } catch (error: any) {
    console.error('[Sync] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// AUTO-ADD SINGLE USER (Called from frontend upon registration)
whatsappRouter.post('/auto-add-contact', (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    let allUsersGroup: any = db.get('groups').find((g: any) => g.name === 'All Users');
    if (!allUsersGroup) {
      allUsersGroup = db.insert('groups', { name: 'All Users' });
    }

    const existingContacts = db.get('contacts');
    const exists = existingContacts.find((c: any) => c.phone === phone);
    
    if (!exists) {
      const newContact = db.insert('contacts', {
        name: name || 'Unknown',
        phone,
        groupId: allUsersGroup.id
      });
      return res.json({ success: true, contact: newContact });
    }
    
    res.json({ success: true, message: 'Contact already exists' });
  } catch (error: any) {
    console.error('[AutoAdd] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// SYSTEM TRIGGER SIMULATOR (for testing)
whatsappRouter.post('/test-event', (req, res) => {
  const { eventName, payload } = req.body;
  eventBus.emitAppEvent(eventName, payload);
  res.json({ success: true, message: `Event ${eventName} emitted.` });
});

// MANUAL BROADCAST
whatsappRouter.post('/broadcast', async (req, res) => {
  const { groupId, templateId, payload } = req.body;
  const contacts = db.get('contacts').filter((c: any) => c.groupId === groupId);
  const template = db.get('templates').find((t: any) => t.id === templateId) as any;
  
  if (!template) return res.status(404).json({ error: 'Template not found' });
  
  let count = 0;
  for (const contact of contacts) {
    let body = template.content.replace(/\{\{([^}]+)\}\}/g, (match: string, key: string) => {
      const trimmedKey = key.trim();
      return { ...payload, name: contact.name, phone: contact.phone }[trimmedKey] || match;
    });
    await queueMessage(contact.phone, body);
    count++;
  }
  res.json({ success: true, count });
});
