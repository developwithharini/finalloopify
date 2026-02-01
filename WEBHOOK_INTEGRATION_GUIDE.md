# 🔗 Loopify Webhook Integration Guide

**Status:** ✅ Ready to integrate with your custom webhook

## Overview

Loopify now has a flexible webhook system that collects insights from all app modules and sends them to your custom webhook/automation platform.

### What Changed:
- ❌ Removed: N8N integration (hardcoded)
- ✅ Added: Flexible webhook configuration
- ✅ Added: Impact Analytics engine (collects insights from all 5 levels)
- ✅ Added: Multiple webhook endpoints for testing and deployment

---

## 🎯 Key Features

### 1. **Separate Accounts Per Phone Number**
- ✅ Each phone number creates a unique account
- ✅ Users have isolated data
- ✅ Referral codes are unique per user

### 2. **Impact Dashboard with Cross-Module Insights**
The dashboard now:
- Collects data from all 5 levels (WasteLens, ShelfLife AI, Reuse Loop, Material Bank, Return Box)
- Generates intelligent insights about user behavior
- Identifies patterns and recommendations
- Tracks environmental impact across all activities
- Sends conclusions to your webhook for analysis

### 3. **Three Types of Insights Generated:**

#### **Behavioral Insights**
- User engagement patterns
- Module preferences
- Activity frequency

#### **Impact Insights**
- Environmental impact (CO₂, waste diverted, resources saved)
- Real-world change metrics
- Contribution to circular economy

#### **Recommendations**
- Personalized suggestions to maximize impact
- Cross-module recommendations
- Milestone achievements

---

## 🚀 Quick Start: Configure Webhook

### Step 1: Set Up Your Webhook Endpoint

Your webhook should be a POST endpoint that accepts JSON:

```bash
POST your-webhook-url
Headers:
  Content-Type: application/json
  Authorization: Bearer your-api-key (optional)

Body Example:
{
  "eventType": "insights",
  "timestamp": "2026-01-31T14:45:00Z",
  "userId": "user_9876543210",
  "insights": [...],
  "metrics": {...}
}
```

### Step 2: Configure in Loopify (Frontend)

```javascript
// Initialize webhook integration
window.webhookIntegration.setWebhookUrl(
  'https://your-webhook-url.com/webhook',
  'your-api-key-here' // optional
);

// Test connection
await window.webhookIntegration._sendWithRetry({
  eventType: 'test',
  timestamp: new Date().toISOString(),
  message: 'Test from Loopify'
});
```

### Step 3: Configure in Loopify (Backend)

```bash
# Configure webhook
curl -X POST http://localhost:3000/api/webhook/configure \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-webhook-url.com/webhook",
    "apiKey": "your-api-key-here"
  }'

# Response:
{
  "success": true,
  "message": "Webhook configured successfully",
  "config": {
    "url": "https://your-webhook-url.com/webhook...",
    "hasApiKey": true,
    "enabled": true,
    "lastUpdated": "2026-01-31T14:45:00Z"
  }
}
```

### Step 4: Test Webhook Connection

```bash
curl -X POST http://localhost:3000/api/webhook/test \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "message": "Webhook test successful",
  "response": {...},
  "timestamp": "2026-01-31T14:45:00Z"
}
```

---

## 📊 Webhook Event Types

### 1. **Test Event**
```json
{
  "eventType": "test",
  "timestamp": "2026-01-31T14:45:00Z",
  "message": "Test payload from Loopify Impact Dashboard"
}
```

### 2. **Insights Event** (Primary)
```json
{
  "eventType": "insights",
  "timestamp": "2026-01-31T14:45:00Z",
  "userId": "user_9876543210",
  "insights": [
    {
      "id": "level1-12345",
      "module": "WasteLens",
      "type": "behavior",
      "title": "Your Classification Pattern",
      "message": "You've classified 50 items. 72% are food items...",
      "impact": "high"
    },
    {
      "id": "level2-impact-12345",
      "module": "ShelfLife AI",
      "type": "impact",
      "title": "Your Food Waste Prevention",
      "message": "Amazing! You've saved 25 food items (83% save rate)...",
      "impact": "critical"
    }
  ],
  "metrics": {
    "level1": { "itemsClassified": 50, "foodItemsDetected": 36 },
    "level2": { "foodItemsTracked": 100, "foodSaved": 25, "foodWasted": 5 },
    "level3": { "itemsMatched": 15, "itemsReused": 12 },
    "environmental": { "co2Prevented": 50.5, "wasteDiverteKg": 100 },
    "ecoPoints": { "totalPoints": 2500 }
  }
}
```

### 3. **Impact Data Event**
```json
{
  "eventType": "impact_data",
  "timestamp": "2026-01-31T14:45:00Z",
  "data": {
    "metric": "value",
    "timestamp": "2026-01-31T14:45:00Z"
  }
}
```

### 4. **User Activity Event**
```json
{
  "eventType": "user_activity",
  "userId": "user_9876543210",
  "activityType": "food_saved",
  "timestamp": "2026-01-31T14:45:00Z",
  "data": {
    "itemCount": 5,
    "category": "vegetables",
    "co2Saved": 2.5
  }
}
```

### 5. **Batch Events**
```json
{
  "eventType": "batch_events",
  "timestamp": "2026-01-31T14:45:00Z",
  "events": [...],
  "batchSize": 10
}
```

---

## 🔌 API Endpoints

### Configure Webhook
```
POST /api/webhook/configure
Content-Type: application/json

{
  "url": "https://your-webhook-url.com/webhook",
  "apiKey": "your-api-key-here"
}

Response: { "success": true, "message": "...", "config": {...} }
```

### Check Webhook Status
```
GET /api/webhook/status

Response: {
  "configured": true,
  "webhook": "https://your-webhook-url...",
  "hasApiKey": true,
  "lastUpdated": "2026-01-31T14:45:00Z",
  "ready": true
}
```

### Test Webhook
```
POST /api/webhook/test

Response: {
  "success": true,
  "message": "Webhook test successful",
  "response": {...}
}
```

### Send Insights to Webhook
```
POST /api/webhook/send-insights
Content-Type: application/json

{
  "insights": [...],
  "metrics": {...},
  "userId": "user_9876543210"
}

Response: {
  "success": true,
  "message": "Insights sent to webhook successfully"
}
```

---

## 💻 Frontend Integration

### Usage in Browser Console:

```javascript
// 1. Configure webhook
window.webhookIntegration.setWebhookUrl(
  'https://your-webhook-url.com/webhook',
  'your-api-key'
);

// 2. Get status
console.log(window.webhookIntegration.getStatus());

// 3. Send impact data
await window.webhookIntegration.sendImpactData({
  wasteDiverted: 50,
  co2Prevented: 25,
  foodSaved: 10
});

// 4. Send user activity
await window.webhookIntegration.sendUserActivity(
  'user_9876543210',
  'item_reused',
  { itemCount: 5, category: 'electronics' }
);

// 5. Send insights
await window.webhookIntegration.sendInsights({
  insights: window.impactAnalytics.getAllInsights(),
  metrics: window.impactAnalytics.metrics
});

// 6. View event log
console.log(window.webhookIntegration.getEventLog());
```

### Usage in App Code:

```javascript
// Initialize with user
window.impactAnalytics.setUser('user_9876543210');

// Update metrics from Level 1
window.impactAnalytics.updateLevel1Data({
  count: 10,
  foodItems: 7,
  categories: { 'organic': 7, 'packaging': 3 }
});

// Update from Level 2
window.impactAnalytics.updateLevel2Data({
  count: 20,
  expiringCount: 5,
  saved: 18,
  wasted: 2,
  categories: { 'vegetables': 15, 'dairy': 5 }
});

// Get dashboard summary
const summary = window.impactAnalytics.getDashboardSummary();

// Send to webhook
await window.impactAnalytics.sendInsightsToWebhook();
```

---

## 🎯 Example: N8N Integration

To connect Loopify to N8N (or any automation platform):

### N8N Webhook Configuration:
1. Create a new N8N workflow
2. Start with HTTP Webhook node (POST)
3. Copy the webhook URL
4. Configure in Loopify:

```bash
curl -X POST http://localhost:3000/api/webhook/configure \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://n8n-instance.com/webhook/loopify-insights"
  }'
```

### In N8N:
- Use the incoming insights to trigger automations
- Send notifications to users
- Log to analytics platform (Mixpanel, Amplitude, etc.)
- Store in database for analysis
- Create reports and dashboards

### Example N8N Workflow:
```
HTTP Webhook (receive insights)
  ↓
Extract insights data
  ↓
Filter by impact level
  ↓
Send Slack notification (if "critical" impact)
  ↓
Log to database
  ↓
Response 200 OK
```

---

## 📈 Data Flow

```
User Activity
  ↓
Level 1-5 Modules
  ↓
Impact Analytics Engine
  ├─ Analyzes behavior patterns
  ├─ Calculates environmental impact
  ├─ Generates insights
  └─ Creates recommendations
  ↓
Webhook Integration
  ├─ Collects all insights
  ├─ Aggregates metrics
  └─ Sends to your webhook
  ↓
Your System (N8N, Zapier, etc.)
  ├─ Analyze trends
  ├─ Send notifications
  ├─ Generate reports
  └─ Trigger automations
```

---

## ✅ Production Checklist

- [ ] Set up your webhook endpoint
- [ ] Configure webhook URL in Loopify backend
- [ ] Test webhook connection
- [ ] Set up API authentication (optional but recommended)
- [ ] Configure webhook in N8N / your automation platform
- [ ] Set up database logging
- [ ] Create notifications/alerts
- [ ] Monitor webhook delivery
- [ ] Set up analytics dashboard

---

## 🐛 Troubleshooting

### Webhook Not Receiving Data

```bash
# 1. Check webhook status
curl http://localhost:3000/api/webhook/status

# 2. Run test
curl -X POST http://localhost:3000/api/webhook/test

# 3. Check server logs
tail -f /tmp/loopify.log | grep webhook

# 4. Verify webhook URL is correct
# 5. Verify API key (if used)
# 6. Check webhook response headers
```

### API Key Issues

```javascript
// Set API key correctly
window.webhookIntegration.setWebhookUrl(
  'https://your-webhook-url.com/webhook',
  'your-api-key-here'
);

// Verify it's sent in request
const status = window.webhookIntegration.getStatus();
console.log(status);
```

### Retry Logic

The webhook system automatically retries failed requests:
- Retry attempts: 3
- Retry delay: 1000ms (1s, 2s, 4s exponential backoff)
- Timeout: 30 seconds

---

## 📝 Summary

✅ **Each phone number = Separate account**
✅ **Impact Dashboard = Multi-module insights**
✅ **Webhook System = Custom automation support**
✅ **Ready for = N8N, Zapier, custom backends**

**Your webhook configuration endpoint is ready!**

Send your webhook URL and we'll connect it immediately.

---

**Status:** 🟢 Production Ready
**Last Updated:** January 31, 2026
