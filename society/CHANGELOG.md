# Changelog

All notable changes to the AskNewton Society of Mind project.

## [1.1.1] - 2025-01-07 - Schema Validation Fix

### Fixed
- **Critical**: Made `payload` field optional in `AgentResponse` schema
- Error responses now explicitly set `payload: null` for proper validation
- Added automated tests for AgentResponse schema validation
- All response helpers now properly validate against schema

### Added
- Unit tests for AgentResponse schema (`src/tests/agentResponse.test.ts`)

---

## [1.1.0] - 2025-01-07 - Production Hardening

### Added

**Unified Response Format**
- Created `AgentResponse` schema with standardized envelope
- All agents now return `{ status, agent, timestamp, metadata, payload, error }`
- Helper functions: `successResponse()`, `errorResponse()`, `partialResponse()`

**Intent Registry System**
- Centralized intent configuration in `orchestrator/intents.ts`
- Priority-based intent detection with confidence scoring
- Extensible registration for future agents
- Required field validation per intent

**Robust Error Handling**
- Concierge Agent: 3 retries with exponential backoff
- Coverage Advisor: 2 retries with timeout protection
- Graceful degradation with fallback responses
- Tool-level error handling (plan search, LLM calls)

**Security Middleware**
- API key authentication (`apiKeyAuth`)
- Channel validation middleware
- Rate limiting (60 req/min per IP, in-memory store)
- Development mode bypass for testing

**Improved LLM Integration**
- Coverage Advisor uses structured JSON output
- Timeout protection (30s concierge, 45s coverage)
- Better prompt engineering for explanations
- Fallback explanations if LLM fails

**Plan Data Integration Guide**
- Created `PLAN_DATA_INTEGRATION.md` with 4 integration approaches
- Database schema for plan storage
- Sync pipeline design
- pgvector semantic search setup
- Performance optimization strategies

### Changed

**Router Enhancements**
- Intent inference with confidence scoring
- Proper error responses for missing fields
- Routing decision logging
- Processing time tracking

**Coverage Advisor**
- Replaced brittle newline parsing with structured JSON
- Added step-by-step error handling
- Empty plan handling with user-friendly messages
- Metadata tracking (plans considered, processing time)

**Concierge Agent**
- Timeout and retry logic
- Empty response detection
- Better system prompts
- Token usage tracking

### Fixed
- Brittle LLM response parsing (newline split)
- Missing error handling in tool calls
- Inconsistent response formats across agents
- No timeout protection on OpenAI calls
- Missing validation for intent requirements

### Documentation
- Updated README with security features
- Added PLAN_DATA_INTEGRATION.md
- Created CHANGELOG.md
- Updated .env.example with auth variables

---

## [1.0.0] - 2025-01-07 - MVP Release

### Added
- Express gateway server (port 4000)
- Orchestrator/router with basic intent detection
- Concierge agent (conversational Q&A)
- Coverage Advisor agent (3-plan recommendations)
- Zod data contracts (IntakeProfile, PlanRecommendationSet)
- Mock plan catalog and provider directory
- BullMQ queue infrastructure
- OpenAI integration
- Example request payloads
- Comprehensive documentation (README, QUICKSTART, INTEGRATION)

### Technical Stack
- TypeScript with strict mode
- Express.js
- Zod validation
- OpenAI GPT-4o-mini
- BullMQ (optional)
- PostgreSQL support (optional)

---

## Upcoming

### [1.2.0] - Real Data Integration
- [ ] Covered California API client
- [ ] Plan database schema
- [ ] Daily sync pipeline
- [ ] Redis caching layer
- [ ] Provider network lookup

### [1.3.0] - New Agents
- [ ] Claims Helper Agent
- [ ] Benefits Navigator Agent
- [ ] Eligibility & Subsidy Agent

### [2.0.0] - MGA Ready
- [ ] Compliance & Governance Agent
- [ ] Underwriting & Risk Agent
- [ ] Multi-state support
- [ ] SOC2/HIPAA maturity
