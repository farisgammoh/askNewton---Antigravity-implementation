# AskNewton AI Agents

### *Multi-Agent Architecture — “Society of Mind” Implementation*

AskNewton uses a modular, multi-agent architecture inspired by Minsky’s **Society of Mind** model.
Each agent is specialized, autonomous, and communicates through structured messages, shared memory, and controlled function-calling.

---

## 🌐 Overview

Agents handle distinct tasks across:

* Coverage intelligence
* Customer-facing workflows
* Claims automation
* Cost-optimization
* Compliance and safety
* Voice + text interaction flows
* External API integrations

All agents are designed to be:

* **Stateless** (logic-only) or **stateful** (session + memory)
* **Composable** (agents can call other agents)
* **Deterministic** (function-calling + schema validation)
* **Cost-aware** (cache, compression, throttling)

---

## 🧠 Core Agents

### **1. Coverage Advisor Agent**

Provides personalized health-plan recommendations using structured eligibility rules, pricing tables, and persona traits.

**Responsibilities**

* Analyze user profile
* Recommend eligible plans
* Explain deductibles, premiums, and exclusions
* Compare US vs international coverage options
* Support digital nomads and immigrants with cross-border guidance

---

### **2. Concierge Agent**

Your real-time assistant for general queries.

**Responsibilities**

* Handles free-form conversation
* Routing queries to specialist agents
* Scheduling reminders, follow-ups
* Detecting when the user needs help filing a claim
* Producing human-like, empathetic conversation

---

### **3. Claims Helper Agent**

Automates parts of the claims submission pipeline.

**Responsibilities**

* Intake documents (PDFs, images, receipts)
* Extract structured data (dates, CPT/ICD codes, totals)
* Package into normalized claim payload
* Detect missing documents
* Push claim events to the core backend

---

### **4. Compliance + Safety Agent**

Ensures all outbound communication meets regulatory and internal policy standards.

**Responsibilities**

* Check for safety violations
* Detect overpromising or non-compliant content
* Validate coverage statements
* Filter medical advice requiring a licensed clinician
* Log questionable interactions for audit purposes

---

### **5. Persona Manager Agent**

Controls system-wide identities, roles, and tones.

**Responsibilities**

* Loads persona configurations
* Pins voice, tone, clarity, brevity
* Enforces contextual consistency
* Works with caching layer for persona-stable outputs

---

### **6. Cost Optimization Agent**

Monitors and reduces AI usage costs.

**Responsibilities**

* Cache repetitive queries
* Deduplicate prompts
* Enforce idempotent inbound requests
* Track tokens per endpoint
* Trigger compression and summarization pipelines

Internal logs feed into OpenAI usage monitoring dashboards.

---

## 🔊 Voice Agents (ElevenLabs + Webhooks)

AskNewton integrates deeply with ElevenLabs conversational APIs.

### **7. Voice Init Agent**

Triggered by `/webhooks/eleven/conversation-init`.

**Responsibilities**

* Validate HMAC signature
* Create initial session context
* Classify user intent
* Load persona voice styling
* Route early conversation events

---

### **8. Voice End Agent**

Triggered by `/webhooks/eleven/conversation-end`.

**Responsibilities**

* Validate HMAC
* Finalize call summary
* Produce after-call notes
* Forward interactions to CRM (HubSpot)
* Persist audio + metadata

---

## 🔗 Integration Agents

### **9. HubSpot CRM Agent**

* Create or update customer profiles
* Sync conversations
* Attach call summaries
* Trigger follow-up tasks for sales/ops

### **10. Stripe Billing Agent**

* Start subscription flows
* Validate user identity
* Manage invoices, refunds, proration
* Sync payment status to backend agents

---

## 🗺️ Agent Orchestration Flow

1. User enters → text, voice, or form input
2. Router Agent classifies intent
3. Router invokes one or more specialist agents
4. Agents exchange structured messages
5. Compliance agent evaluates all outbound responses
6. Cache layer stores deterministic outputs
7. System responds via:

   * Text
   * Voice
   * UI
   * CRM/billing event

---

## 🧩 Shared Tools Used by Agents

* **Function calling schemas**
* **Structured validation (Zod)**
* **Shared knowledge base**
* **Idempotency keys**
* **Event logging**
* **Analytics hooks**
* **Cost tracking counters**

---

## 📌 Development Notes

* Agents are designed to be replaced individually without breaking the system.
* All agents must emit **deterministic JSON** for internal communication.
* Each agent should have its own test suite under `/test/agents`.
* Future versions will introduce:

  * Reinforcement learning loops
  * Memory embeddings
  * Real-time plan pricing updates

---

