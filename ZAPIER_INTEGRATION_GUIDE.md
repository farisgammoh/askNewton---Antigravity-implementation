# ✉️ Zapier Integration Guide - Onboarding Email Setup

Complete guide to integrate AskNewton with Zapier for automated customer onboarding emails.

---

## 🎯 What This Solves

**Problem**: Emails showing placeholders like "[Language will appear here after webhook test]"  
**Solution**: Production-ready webhook integration with graceful fallbacks and dynamic email generation

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Webhook URL

1. Log into [Zapier](https://zapier.com)
2. Create a new Zap
3. Choose trigger: **Webhooks by Zapier** → **Catch Hook**
4. Copy your webhook URL (looks like: `https://hooks.zapier.com/hooks/catch/...`)

### Step 2: Configure in Replit

1. Open your Replit project
2. Go to **Secrets** (🔒 icon in sidebar)
3. Add secret:
   - **Key**: `WEBHOOK_URL`
   - **Value**: Your Zapier webhook URL from Step 1

### Step 3: Test the Integration

```bash
# Method 1: Use the test endpoint
curl -X POST https://your-replit-app.replit.app/api/zapier/test \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "language": "English",
    "health_info": "Generally healthy",
    "lifestyle": "Active",
    "provider": "Blue Shield"
  }'

# Method 2: Submit a real lead through the wizard
# Visit: https://your-replit-app.replit.app/wizard
```

### Step 4: Check Zapier for Data

1. Go back to Zapier
2. Wait for test data to arrive (10-30 seconds)
3. Click "Test trigger" to see the payload
4. ✅ If you see data → Integration working!

---

## 📋 Complete Setup Options

### Option A: Direct Email Sending (Recommended)

The app now sends welcome emails directly using SendGrid. No Zapier needed for emails!

**What you need**:
1. SendGrid account (free tier available)
2. Verified sender email
3. API key

**Setup**:
```bash
# Add these secrets in Replit:
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=welcome@asknewton.com
```

**Benefits**:
- ✅ No email placeholders
- ✅ Beautiful HTML emails
- ✅ Graceful fallbacks for all fields
- ✅ Instant delivery
- ✅ Free for 100 emails/day

---

### Option B: Zapier Email (Alternative)

Use Zapier to send emails if you prefer external automation.

**Zapier Flow**:
```
1. Trigger: Webhook (catches lead data)
2. Action: Gmail/Outlook/SendGrid (sends email)
```

**Zap Setup**:

1. **Trigger**: Webhooks by Zapier → Catch Hook
2. **Action**: Email by Zapier → Send Outbound Email
3. **Configure email**:
   - **To**: `{{email}}` (from webhook)
   - **Subject**: `Welcome to AskNewton, {{name__first}}!`
   - **Body**: See email template below

**Email Template for Zapier**:
```
Hi {{name}},

Welcome to AskNewton! We're thrilled to have you on board.

Here's what you shared with us:

- Preferred Language: {{language}}
- Health Information: {{health_info}}
- Lifestyle: {{lifestyle}}
- Preferred Provider: {{provider}}

What happens next?

1. We're reviewing your information right now
2. Our team will reach out within 24 hours
3. You'll receive personalized insurance recommendations
4. We'll help you enroll in the perfect plan

Questions? Just reply to this email!

Best,
The AskNewton Team
```

---

## 🧪 Testing Your Integration

### Test Endpoint 1: Zapier Webhook Test

**Purpose**: Test webhook data formatting without sending emails

```bash
curl -X POST https://your-app.replit.app/api/zapier/test \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "language": "English",
    "health_info": "Healthy",
    "lifestyle": "Active",
    "provider": "Blue Shield"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "✅ Webhook test successful! Email data formatted correctly.",
  "receivedPayload": { ... },
  "formattedData": {
    "name": "Test User",
    "email": "test@example.com",
    "preferredLanguage": "English",
    "healthInfo": "Healthy",
    "lifestyle": "Active",
    "preferredProvider": "Blue Shield",
    "arrivalDate": "Not provided",
    "stayLength": "Not provided",
    "currentCoverage": "Not provided"
  },
  "emailPreview": {
    "to": "test@example.com",
    "subject": "Welcome to AskNewton, Test! 🎉",
    "data": { ... }
  },
  "tips": {
    "noPlaceholders": "All fields have graceful fallbacks - no more \"[Language will appear here]\" errors!",
    "productionReady": "In production, this data would trigger a beautiful HTML welcome email"
  }
}
```

---

### Test Endpoint 2: Send Real Email

**Purpose**: Actually send a welcome email to test the template

```bash
curl -X POST https://your-app.replit.app/api/email/test-welcome \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-real-email@example.com",
    "persona": "nomad",
    "preferredLanguage": "English",
    "healthInfo": "Generally healthy",
    "lifestyle": "Active lifestyle",
    "preferredProvider": "Blue Shield",
    "arrivalDate": "2025-01-15",
    "stayLength": "6 months",
    "currentCoverage": "None"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Test welcome email sent to your-real-email@example.com",
  "data": { ... }
}
```

**Then**:
1. Check your inbox
2. Verify email looks professional
3. All fields populated correctly
4. No placeholders like "[field]"

---

## 🔧 Field Mapping Reference

### Webhook Payload Fields

The app accepts multiple field name formats for maximum compatibility:

| Purpose | Accepted Field Names |
|---------|---------------------|
| **Name** | `name`, `full_name`, `firstName` + `lastName` |
| **Email** | `email` |
| **Language** | `language`, `preferredLanguage`, `preferred_language` |
| **Health Info** | `health_info`, `healthInfo`, `health` |
| **Lifestyle** | `lifestyle` |
| **Provider** | `provider`, `preferredProvider`, `preferred_provider` |
| **Arrival Date** | `arrivalDate`, `arrival_date` |
| **Stay Length** | `stayLength`, `stay_length` |
| **Coverage** | `currentCoverage`, `current_coverage`, `coverage` |

**Example Webhook Payloads**:

```json
// Full lead submission format
{
  "id": "lead_123",
  "name": "John Doe",
  "email": "john@example.com",
  "persona": "nomad",
  "arrivalDate": "2025-02-01",
  "stayLength": "3 months",
  "currentCoverage": "None",
  "phone": "+1234567890",
  "preexisting": false
}

// Simple onboarding format
{
  "email": "jane@example.com",
  "language": "Spanish",
  "health_info": "Good health",
  "lifestyle": "Moderately active",
  "provider": "Kaiser"
}

// Zapier format (any variation)
{
  "full_name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "preferred_language": "Arabic",
  "health": "Excellent",
  "lifestyle": "Very active",
  "preferred_provider": "Blue Cross"
}
```

---

## 🎨 Email Template Preview

### Text Email (Fallback)
```
Hi John,

Welcome to AskNewton! We're thrilled to have you on board.

You're joining hundreds of nomads who have found the perfect health 
insurance coverage in California. We're here to make your transition 
smooth and stress-free.

Here's a quick summary of what you shared with us:

- Preferred Language: English
- Health Information: Generally healthy
- Lifestyle: Active lifestyle
- Preferred Provider: Blue Shield
- Arrival Date: 2025-01-15
- Stay Length: 6 months
- Current Coverage: None

What happens next?

1. We're reviewing your information right now
2. Our team will reach out within 24 hours
3. You'll receive personalized insurance recommendations
4. We'll help you enroll in the perfect plan

In the meantime, feel free to:
- Reply to this email with any questions
- Schedule a consultation: https://calendly.com/asknewton
- Visit our website: https://asknewton.com

Best,
The AskNewton Team

P.S. If anything changes or you have questions, just reply to this email!
```

### HTML Email (Production)
- ✅ Apple-style minimalist design
- ✅ Blue gradient header
- ✅ Responsive layout
- ✅ Information cards
- ✅ Step-by-step next actions
- ✅ CTA button for scheduling
- ✅ Professional footer

---

## 🛡️ Graceful Fallbacks

**No more placeholders!** Every field has a default value:

| Field | If Missing | Fallback Value |
|-------|-----------|----------------|
| Name | `undefined` | "there" or email username |
| Language | `undefined` | "Not provided" |
| Health Info | `undefined` | "Not provided" |
| Lifestyle | `undefined` | "Not provided" |
| Provider | `undefined` | "Not provided" |
| Arrival Date | `undefined` | "Not provided" |
| Stay Length | `undefined` | "Not provided" |
| Coverage | `undefined` | "Not provided" |

**Example**:
```javascript
// Even if Zapier sends incomplete data:
{
  "email": "user@example.com"
}

// The email will still work:
"Hi there,
...
- Preferred Language: Not provided
- Health Information: Not provided
..."
```

---

## 🔥 Common Issues & Solutions

### Issue 1: Emails show "[field]" placeholders

**Cause**: Zapier is sending the actual string `"[Language will appear here after webhook test]"` instead of dynamic data

**Solution**:
1. In Zapier, click the field
2. Select **Insert Data** → Choose field from webhook
3. DON'T type placeholder text manually
4. Use the test endpoint to verify: `/api/zapier/test`

---

### Issue 2: Email not sending

**Causes & Solutions**:

**A. SendGrid not configured**
```bash
# Check secrets in Replit
SENDGRID_API_KEY=sk-...  # Must be set
SENDGRID_FROM_EMAIL=welcome@asknewton.com  # Must be verified
```

**B. From email not verified in SendGrid**
1. Go to SendGrid dashboard
2. Settings → Sender Authentication
3. Verify your from email address

**C. Rate limit exceeded**
- Free tier: 100 emails/day
- Upgrade plan or spread out tests

---

### Issue 3: Webhook not receiving data

**Debug Steps**:

1. **Check webhook URL in secrets**:
   ```bash
   # Must be HTTPS, not HTTP
   WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
   ```

2. **Test with curl**:
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

3. **Check Zapier task history**:
   - Zapier dashboard → Zap history
   - Look for recent runs
   - Check error messages

4. **Enable logging**:
   ```javascript
   // Already enabled in routes.ts
   console.log('📡 Conversational lead forwarded to webhook successfully');
   ```

---

### Issue 4: Wrong email template

**Symptoms**: Email doesn't match design

**Solutions**:
1. Use `/api/email/test-welcome` to test
2. Check SendGrid activity feed for delivery
3. Verify HTML rendering in email client
4. Test in multiple email clients (Gmail, Outlook, Apple Mail)

---

## 📊 Integration Monitoring

### View Logs in Replit

```bash
# Check if emails are being sent
# Look for these log messages:

✅ "✉️  Welcome email sent to customer: user@example.com"
✅ "📡 Conversational lead forwarded to webhook successfully"
⚠️  "Welcome email error: ..." (indicates problem)
⚠️  "Webhook error: ..." (indicates problem)
```

### Zapier Task History

1. Open your Zap
2. Click "Task History" tab
3. See all webhook catches
4. Debug any failures

### SendGrid Activity Feed

1. Go to SendGrid dashboard
2. Activity → Activity Feed
3. See all sent emails
4. Check delivery status
5. View bounce/spam reports

---

## 🎯 Production Checklist

Before going live with your Zapier integration:

- [ ] `WEBHOOK_URL` secret configured in Replit
- [ ] `SENDGRID_API_KEY` secret configured
- [ ] `SENDGRID_FROM_EMAIL` verified in SendGrid
- [ ] Tested `/api/zapier/test` endpoint
- [ ] Sent test email via `/api/email/test-welcome`
- [ ] Received test email successfully
- [ ] Verified email formatting (no placeholders)
- [ ] All fields populate correctly
- [ ] Email looks professional on desktop
- [ ] Email looks professional on mobile
- [ ] Tested incomplete data (missing fields)
- [ ] Confirmed graceful fallbacks work
- [ ] Zapier Zap is turned ON
- [ ] Tested full wizard submission
- [ ] Checked SendGrid activity feed
- [ ] Monitored Replit logs for errors

---

## 🚀 Advanced: Multiple Email Types

You can create different email templates for different personas:

```javascript
// In server/email.ts
export async function sendWelcomeEmail(data: OnboardingEmailData) {
  // Customize email based on persona
  const templates = {
    nomad: 'templates/nomad-welcome.html',
    traveler: 'templates/traveler-welcome.html',
    student: 'templates/student-welcome.html'
  };
  
  const template = templates[data.persona] || templates.nomad;
  // ... send email with specific template
}
```

---

## 📚 Additional Resources

### SendGrid Setup
- [SendGrid Quick Start](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)
- [Verify Sender Email](https://docs.sendgrid.com/ui/sending-email/sender-verification)
- [Free Tier Limits](https://sendgrid.com/pricing/)

### Zapier Setup
- [Webhook Trigger Guide](https://zapier.com/help/doc/how-use-webhooks-zapier)
- [Email Action Guide](https://zapier.com/apps/email/integrations)
- [Formatting Dates in Zapier](https://zapier.com/help/doc/how-format-dates-and-times-in-zapier)

### Email Best Practices
- [HTML Email Guide](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Email Deliverability](https://sendgrid.com/blog/email-deliverability-101/)
- [Responsive Email Design](https://www.litmus.com/blog/the-how-to-guide-to-responsive-email-design-infographic/)

---

## 🤝 Need Help?

**Email Issues**:
1. Check SendGrid logs first
2. Verify secrets are set correctly
3. Test with `/api/email/test-welcome`
4. Check spam folder

**Webhook Issues**:
1. Test with `/api/zapier/test`
2. Check Zapier task history
3. Verify webhook URL is HTTPS
4. Check Replit logs for errors

**Integration Issues**:
1. Make sure workflow is running in Replit
2. Restart the app after changing secrets
3. Check all environment variables
4. Test each component separately

---

## ✅ Success Checklist

You've successfully integrated Zapier when:

- [x] Webhook receives data from Replit
- [x] Welcome emails send automatically
- [x] No placeholder text in emails
- [x] All fields populate correctly
- [x] Missing fields show "Not provided"
- [x] Emails look professional
- [x] Customers receive emails within 1 minute

---

**Status**: ✅ Production Ready  
**Last Updated**: November 2025  
**Contact**: support@asknewton.com
