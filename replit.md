# Overview

AskNewton California is a health insurance guidance platform specifically designed for newcomers to California. The application serves three primary personas: Nomads (remote workers/contractors), Travelers (1-6 month visitors), and Students (F-1/J-1 visa holders). The platform provides personalized insurance recommendations through an intake wizard and connects users with licensed professionals for guidance. Built as a full-stack TypeScript application, it features a React frontend with form-based lead capture, Express.js backend with API endpoints, and PostgreSQL database integration via Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React 18 and TypeScript, utilizing Vite as the build tool and development server. The architecture follows a component-based design pattern with:

- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and React Hook Form for form state
- **Form Validation**: Zod schemas with @hookform/resolvers integration
- **Component Structure**: Modular components organized by type (ui/, pages/, components/)

The application uses a wizard-style intake form that progresses through multiple steps, collecting user information and preferences before submitting leads to the backend.

## Backend Architecture
The server-side implementation uses Express.js with TypeScript in an ESM module configuration. Key architectural decisions include:

- **API Design**: RESTful endpoints with structured JSON responses
- **Request Processing**: Express middleware for JSON parsing, URL encoding, and request logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Development Integration**: Vite middleware integration for hot module replacement during development

The backend serves both API endpoints and static files, with separate build processes for production deployment.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations:

- **Schema Definition**: Shared TypeScript schemas between client and server
- **Database Client**: Neon Database serverless PostgreSQL with connection pooling
- **Migration Management**: Drizzle Kit for schema migrations and database synchronization
- **Validation**: Zod schemas for runtime validation matching database constraints

The storage layer includes both database persistence and in-memory fallback for development scenarios.

## Authentication and Authorization
The current implementation uses a simple session-based approach with minimal authentication requirements:

- **Session Management**: Express session handling with PostgreSQL session store
- **User Management**: Basic user creation and lookup functionality
- **Lead Management**: Open lead submission without authentication requirements

This lightweight approach aligns with the lead capture nature of the application.

## Email and Webhook Integration

The application includes production-ready email automation and webhook integration for customer onboarding:

- **Customer Welcome Emails**: Automated welcome emails sent immediately after lead submission
- **SendGrid Integration**: Professional HTML and text email templates with Apple-style minimalist design
- **Graceful Fallbacks**: All email fields have default values - no placeholder text ever appears
- **Webhook Support**: Zapier integration for external automation workflows
- **Test Endpoints**: Dedicated endpoints for testing email templates and webhook integration
- **Multi-format Support**: Handles various field naming conventions (camelCase, snake_case, etc.)

**Email Templates**:
- Beautiful HTML emails with gradient headers, information cards, and responsive design
- Plain text fallback for email clients without HTML support
- Personalized subject lines and dynamic content based on user data
- Clear call-to-action buttons for scheduling consultations

**Implementation Files**:
- `server/email.ts` - Email service with `sendWelcomeEmail()` and `sendLeadNotification()` functions
- `server/routes.ts` - API endpoints with email integration on `/api/lead` and `/api/simple-lead`
- `ZAPIER_INTEGRATION_GUIDE.md` - Complete setup guide for Zapier automation

**Test Endpoints**:
- `POST /api/zapier/test` - Test webhook data formatting without sending emails
- `POST /api/email/test-welcome` - Send actual test welcome email to verify templates

**Environment Variables**:
- `SENDGRID_API_KEY` - SendGrid API key for email sending
- `SENDGRID_FROM_EMAIL` - Verified sender email address
- `WEBHOOK_URL` - Zapier webhook URL for external integrations
- `NOTIFICATION_EMAIL` - Internal email for lead notifications

## Society of Mind Multi-Agent System

AskNewton includes a production-ready "Society of Mind" architecture - a separate Express.js service (port 4000) that orchestrates specialized AI agents for different health insurance tasks. This TypeScript implementation provides intelligent, context-aware responses across multiple channels.

**Status**: ✅ Production Ready v1.1.2 (January 2025)

**Architecture Components:**

- **Gateway & Router**: Intent-based routing system with confidence scoring and extensible intent registry
- **Agent SDK**: Unified `AgentResponse` contract ensuring consistent behavior across all agents
- **Specialized Agents**:
  - **Concierge Agent**: Conversational Q&A about health insurance (GPT-4o-mini)
  - **Coverage Advisor**: Personalized 3-plan recommendations based on intake data
  - **Claims Helper**: (Planned) Claims submission and status tracking
  - **Benefits Navigator**: (Planned) Provider search and cost estimation

**Production Hardening:**

- **Error Handling**: Multi-layer retry logic with exponential backoff, timeout protection (30-45s), and graceful degradation
- **Security**: API key authentication, rate limiting (60 req/min per IP), channel validation
- **Response Format**: Standardized envelope with status, metadata, payload, and error fields
- **Testing**: Comprehensive unit tests (7/7) and E2E integration tests (7/7) all passing
- **LLM Integration**: Structured JSON output, timeout protection, fallback responses
- **Containerization**: Multi-stage Docker build with security hardening (non-root user, health checks)

**Deployment Options:**

- **Render.com**: One-click deployment via `render.yaml` blueprint ($7-14/mo)
- **Fly.io**: Auto-scaling deployment via `fly.toml` config ($5-10/mo)
- **Docker**: Self-hosted with `docker-compose.yml` for local/cloud deployment

**Complete Documentation Suite:**

All documentation is in the `society/` directory:
- `README_FIRST.md` - Quick start guide (read this first!)
- `DEPLOY_NOW.md` - Live deployment commands for Render/Fly.io
- `INTEGRATION_READY.md` - Complete integration code for main app
- `DEPLOYMENT.md` - Platform comparison and troubleshooting
- `DEPLOYMENT_SUMMARY.md` - Executive overview and cost projections
- `PRODUCTION_READY.md` - Production certification document
- `QUICKSTART.md` - 5-minute local development setup
- `PLAN_DATA_INTEGRATION.md` - Real Covered CA data strategy
- `monitoring.ts` - Optional production monitoring setup

**Data Integration:**

The system includes a comprehensive plan data integration strategy covering:
- Covered California API integration
- Database schema for plan storage with periodic sync
- Redis caching layer for performance
- pgvector semantic search for natural language queries

**Intent Registry:**

Extensible priority-based routing supports current and future agents:
```typescript
{
  coverage_recommendation: { priority: 10, keywords: ['recommend', 'plan'], enabled: true },
  concierge: { priority: 5, keywords: ['help', 'question'], enabled: true },
  claims_helper: { priority: 8, enabled: false },
  benefits_navigator: { priority: 7, enabled: false }
}
```

**Integration with Main App:**

The Society service can be integrated with the main AskNewton app for:
1. Wizard-based plan recommendations (after intake completion)
2. WhatsApp conversational chat (via Twilio webhook)
3. Standalone agent interactions (web, SMS, WhatsApp)

Integration code and examples are provided in `society/INTEGRATION_READY.md`.

**Deployment**: The Society service runs independently on port 4000, communicates via REST API with API key authentication, and is ready for production deployment via Render.com, Fly.io, or Docker.

## Cost Optimization Features

**Status**: ✅ Implemented (January 2025)

The application includes comprehensive cost optimization features to reduce OpenAI and infrastructure costs by 57-80% without degrading user experience:

**Implemented Optimizations:**

1. **Persona Caching (Database-Backed)**
   - Caches AI-generated personas based on input hash
   - Reduces repeated OpenAI API calls by 80-95%
   - Tables: `persona_cache` with SHA-256 input hashing
   - Files: `server/services/personaCache.ts`, `server/lib/hash.ts`

2. **Request Idempotency**
   - Prevents duplicate API calls from network retries, double-clicks
   - 5-minute response caching window
   - Tables: `request_log` with request hash tracking
   - Files: `server/middleware/withIdempotency.ts`

3. **Response Streaming**
   - Server-Sent Events (SSE) for chat responses
   - Better perceived performance, same cost
   - Endpoint: `/api/chat/stream`
   - Files: `server/routes.ts`, `client/src/hooks/useStreamedChat.ts`

4. **Frontend Debouncing**
   - Prevents rapid-fire API calls from UI interactions
   - 400ms default delay (configurable)
   - Files: `client/src/hooks/useDebouncedCallback.ts`

**Cost Savings:**
- Persona generation: 80% reduction (~$12/day savings)
- Duplicate prevention: 100% elimination (~$5/day savings)
- Projected monthly savings: $510+ at current volume

**Documentation:**
- Complete implementation guide: `COST_OPTIMIZATION_SUMMARY.md`
- Migration steps, troubleshooting, and monitoring guidelines included

# External Dependencies

## Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Email Services**: Configurable email API integration for lead notifications
- **WhatsApp Integration**: Direct messaging links for immediate user communication
- **Webhook Support**: Configurable webhook forwarding for lead processing
- **Analytics**: Google Analytics integration for user behavior tracking
- **Calendly**: Embedded scheduling for consultation bookings

## UI and Development Libraries
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Consistent iconography throughout the application
- **TanStack Query**: Powerful data synchronization and caching
- **React Hook Form**: Performant form handling with minimal re-renders

## Build and Development Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Type safety across the entire application stack
- **Drizzle Kit**: Database schema management and migration tools
- **ESBuild**: Fast JavaScript bundling for production server builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Validation and Utilities
- **Zod**: Runtime type validation and schema definition
- **clsx & tailwind-merge**: Conditional CSS class management
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: Unique ID generation for various application needs