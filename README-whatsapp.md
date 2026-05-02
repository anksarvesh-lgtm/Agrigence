# WhatsApp Notification Engine (Whapi.Cloud)

A production-ready, event-driven WhatsApp notification system using the official Whapi.Cloud endpoint. 
It supports multiple tokens, strict daily limits (150 messages/day), dynamic templating, and BullMQ for reliable queuing.

## Architecture
- **EventBus**: Captures internal events (e.g., \`subscription_paid\`).
- **TemplateEngine**: Injects dynamic payload variables into user-defined templates.
- **QueueService**: BullMQ wraps the API call, enforcing the strictly 150 msg/day limit. Next-day scheduling is applied upon exhaustion.
- **Admin Panel**: Located under \`/admin/whatsapp\`.

## Setup Instructions

1. **Start the server**: The backend is integrated directly into \`server.ts\` via \`whatsappRouter\`. Start your application standardly (\`npm run dev\` or \`npm run start\`).
2. **Redis Configuration (BullMQ)**: 
   The system expects a Redis server for BullMQ. 
   - Local: Ensure Redis is running on \`127.0.0.1:6379\`
   - Production: Set the \`REDIS_URL\` environment variable.
   *(Note: A local fallback is implemented utilizing \`setTimeout\` if Redis is unavailable, guaranteeing execution in constrained environments like AI Studio).*
3. **Configure via Admin Panel**:
   - Go to **Dashboard -> WhatsApp** (or \`/admin/whatsapp\`).
   - Add your **Whapi.Cloud Token** (Obtained from \`https://panel.whapi.cloud/\`).
   - Create a **Contact Group** and add test **Contacts**.
   - Create a **Template** using variables like \`{{name}}\` and \`{{plan_name}}\`.
   - Setup an **Event Mapping** (e.g., Event: \`subscription_paid\` -> Template -> Group).

## Triggering Events & Webhooks

The system handles automated actions whenever an internal event is emitted onto the \`WhatsAppEventBus\`. You can also trigger events via the HTTP endpoint.

### 1. Trigger System Event via REST API (Webhook Example)

\`\`\`bash
curl -X POST http://localhost:3000/api/whatsapp/test-event \
-H "Content-Type: application/json" \
-d '{
  "eventName": "subscription_paid",
  "payload": {
    "plan_name": "Premium",
    "amount": "₹999"
  }
}'
\`\`\`

### 2. Manual Broadcast (REST API)

Send a template directly to a contact group immediately:

\`\`\`bash
curl -X POST http://localhost:3000/api/whatsapp/broadcast \
-H "Content-Type: application/json" \
-d '{
  "groupId": "group-uuid-here",
  "templateId": "template-uuid-here",
  "payload": {
    "announcement": "System update tomorrow at 2 PM"
  }
}'
\`\`\`

### 3. Integrated Triggering (Node.js backend)
Anywhere in your Node.js backend (\`server.ts\` or Express routers), import and trigger events natively:

\`\`\`typescript
import { eventBus } from './src/server/whatsapp/eventBus.js';

// Inside your Stripe/Razorpay Webhook:
app.post('/api/webhook/payment', (req, res) => {
    // ... verified payment
    eventBus.emitAppEvent('subscription_paid', {
         plan_name: req.body.plan,
         amount: req.body.amount,
         user_email: req.body.email
    });
    res.json({received: true});
});
\`\`\`

## Rate Limiting & Queue Strategy

When the **150 messages/day per token** limit is reached, BullMQ intercepts the failure and **automatically reschedules the job for the next day at Midnight (00:01 AM)**. It loops through active tokens to maximize throughput. Logs trace the status as \`Scheduled (Limit Hit)\` and update to \`Sent\` once executed.
