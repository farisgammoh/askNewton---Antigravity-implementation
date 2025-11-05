# Plan Data Integration Guide

This document provides a concrete plan for integrating real Covered California / ACA plan data into the Society of Mind system.

## Current State (MVP)

The Coverage Advisor currently uses mock plan data from `src/tools/planCatalog.ts`:
```typescript
const MOCK_PLANS: Plan[] = [
  { id: 'p1', name: 'Nomad Bronze 4500', metal: 'Bronze', premium: 320, ... }
]
```

This is sufficient for MVP testing but needs to be replaced with real data.

## Integration Approaches

### Option 1: Covered California API (Recommended)

**Pros:**
- Official data source
- Real-time pricing
- Complete plan details

**Cons:**
- Requires Covered California partnership/approval
- API access may have costs
- Need to handle rate limits

**Implementation Steps:**

1. **Register for API Access**
   - Contact Covered California developer relations
   - Obtain API credentials
   - Review API documentation

2. **Create API Client**
```typescript
// src/tools/coveredCA/client.ts
import axios from 'axios'

export class CoveredCAClient {
  private baseUrl = 'https://api.covered.ca.gov/v1'
  private apiKey = process.env.COVERED_CA_API_KEY

  async searchPlans(params: {
    zip: string
    age: number
    household_size: number
    income?: number
  }) {
    const response = await axios.get(`${this.baseUrl}/plans/search`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
      params
    })
    return response.data
  }

  async getPlanDetails(planId: string) {
    const response = await axios.get(`${this.baseUrl}/plans/${planId}`)
    return response.data
  }

  async getProviderNetwork(planId: string, zip: string) {
    const response = await axios.get(`${this.baseUrl}/plans/${planId}/network`, {
      params: { zip }
    })
    return response.data
  }
}
```

3. **Cache Plan Data**
```typescript
// src/tools/coveredCA/cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedPlans(cacheKey: string) {
  const cached = await redis.get(`plans:${cacheKey}`)
  return cached ? JSON.parse(cached) : null
}

export async function cachePlans(cacheKey: string, plans: any[], ttl = 3600) {
  await redis.setex(`plans:${cacheKey}`, ttl, JSON.stringify(plans))
}
```

4. **Update Plan Catalog**
```typescript
// src/tools/planCatalog.ts
import { CoveredCAClient } from './coveredCA/client.js'
import { getCachedPlans, cachePlans } from './coveredCA/cache.js'

const client = new CoveredCAClient()

export async function findPlans(params: {
  zip: string
  age: number
  doctors: string[]
  meds: string[]
  budget?: number
}) {
  const cacheKey = `${params.zip}-${params.age}-${params.budget || 'any'}`
  
  // Try cache first
  let plans = await getCachedPlans(cacheKey)
  
  if (!plans) {
    // Fetch from API
    const apiPlans = await client.searchPlans({
      zip: params.zip,
      age: params.age,
      household_size: 1 // TODO: Get from intake
    })
    
    // Transform to our format
    plans = apiPlans.map(transformPlan)
    
    // Cache for 1 hour
    await cachePlans(cacheKey, plans, 3600)
  }
  
  // Filter by budget and other criteria
  return filterPlans(plans, params)
}

function transformPlan(apiPlan: any): Plan {
  return {
    id: apiPlan.plan_id,
    name: apiPlan.marketing_name,
    metal: apiPlan.metal_level,
    premium: apiPlan.premium,
    oop_max: apiPlan.out_of_pocket_max,
    network: apiPlan.provider_network_ids
  }
}
```

---

### Option 2: Healthcare.gov Marketplace API

**Pros:**
- Federal marketplace data
- Multi-state support
- Well-documented

**Cons:**
- May not have CA-specific enhanced plans
- Requires federal API access

**Implementation:**
Similar to Option 1, but using Healthcare.gov API endpoints.

---

### Option 3: Database with Periodic Sync

**Pros:**
- Faster lookups (no external API calls)
- Works offline
- Full control over data

**Cons:**
- Need to sync data regularly
- May have stale pricing
- Requires storage

**Database Schema:**
```typescript
// shared/schema.ts - Add these tables

export const plans = pgTable('plans', {
  id: varchar('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  carrier: varchar('carrier', { length: 100 }),
  metal_level: varchar('metal_level', { length: 20 }),
  premium: integer('premium').notNull(),
  oop_max: integer('oop_max').notNull(),
  deductible: integer('deductible'),
  network_type: varchar('network_type', { length: 50 }),
  coverage_area: varchar('coverage_area', { length: 5 }), // ZIP prefix
  effective_date: date('effective_date'),
  termination_date: date('termination_date'),
  raw_data: jsonb('raw_data') // Store full API response
})

export const planBenefits = pgTable('plan_benefits', {
  id: serial('id').primaryKey(),
  plan_id: varchar('plan_id').references(() => plans.id),
  benefit_type: varchar('benefit_type', { length: 100 }),
  covered: boolean('covered'),
  copay: integer('copay'),
  coinsurance: integer('coinsurance'),
  limitations: text('limitations')
})

export const providerNetworks = pgTable('provider_networks', {
  id: serial('id').primaryKey(),
  plan_id: varchar('plan_id').references(() => plans.id),
  provider_name: varchar('provider_name', { length: 255 }),
  provider_type: varchar('provider_type', { length: 50 }),
  npi: varchar('npi', { length: 20 }),
  address: text('address'),
  accepting_new_patients: boolean('accepting_new_patients')
})
```

**Sync Script:**
```typescript
// scripts/sync-plans.ts
import { CoveredCAClient } from '../src/tools/coveredCA/client.js'
import { db } from '../server/db.js'
import { plans, planBenefits, providerNetworks } from '../shared/schema.js'

async function syncPlans() {
  const client = new CoveredCAClient()
  
  console.log('Fetching plans from Covered CA...')
  const allPlans = await client.getAllPlans()
  
  console.log(`Syncing ${allPlans.length} plans to database...`)
  
  for (const apiPlan of allPlans) {
    // Upsert plan
    await db.insert(plans)
      .values({
        id: apiPlan.plan_id,
        name: apiPlan.marketing_name,
        carrier: apiPlan.issuer_name,
        metal_level: apiPlan.metal_level,
        premium: apiPlan.premium,
        oop_max: apiPlan.out_of_pocket_max,
        deductible: apiPlan.deductible,
        network_type: apiPlan.network_type,
        coverage_area: apiPlan.zip_prefix,
        effective_date: new Date(apiPlan.effective_date),
        termination_date: apiPlan.termination_date ? new Date(apiPlan.termination_date) : null,
        raw_data: apiPlan
      })
      .onConflictDoUpdate({
        target: plans.id,
        set: {
          premium: apiPlan.premium,
          oop_max: apiPlan.out_of_pocket_max
        }
      })
    
    // Sync benefits
    for (const benefit of apiPlan.benefits) {
      await db.insert(planBenefits).values({
        plan_id: apiPlan.plan_id,
        benefit_type: benefit.type,
        covered: benefit.covered,
        copay: benefit.copay,
        coinsurance: benefit.coinsurance,
        limitations: benefit.limitations
      })
    }
  }
  
  console.log('Sync complete!')
}

// Run daily via cron or BullMQ
syncPlans().catch(console.error)
```

**Query Plans from DB:**
```typescript
// src/tools/planCatalog.ts
import { db } from '../../server/db.js'
import { plans, providerNetworks } from '../../shared/schema.js'
import { and, eq, lte, sql } from 'drizzle-orm'

export async function findPlans(params: {
  zip: string
  age: number
  doctors: string[]
  meds: string[]
  budget?: number
}) {
  const zipPrefix = params.zip.substring(0, 3)
  
  const dbPlans = await db.select()
    .from(plans)
    .where(
      and(
        eq(plans.coverage_area, zipPrefix),
        params.budget ? lte(plans.premium, params.budget + 50) : undefined,
        sql`current_date BETWEEN effective_date AND COALESCE(termination_date, '2099-12-31')`
      )
    )
    .orderBy(plans.premium)
    .limit(10)
  
  // Check doctor network matches
  const planIds = dbPlans.map(p => p.id)
  const networkMatches = await db.select()
    .from(providerNetworks)
    .where(sql`plan_id = ANY(${planIds}) AND provider_name ILIKE ANY(${params.doctors.map(d => `%${d}%`)})`)
  
  // Transform and score
  return dbPlans.map(p => transformPlan(p, networkMatches))
}
```

---

### Option 4: pgvector for Semantic Plan Search

**Use Case:** Natural language plan search ("I want a plan that covers mental health and has low copays")

**Setup:**

1. **Enable pgvector Extension**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. **Add Embeddings to Plans Table**
```typescript
export const plans = pgTable('plans', {
  // ... existing fields ...
  description_embedding: vector('description_embedding', { dimensions: 1536 })
})
```

3. **Generate Embeddings**
```typescript
import { openai } from '../utils/openai.js'

async function generatePlanEmbedding(plan: Plan) {
  const text = `${plan.name} - ${plan.metal_level} tier. 
    Premium: $${plan.premium}/month. 
    Out-of-pocket max: $${plan.oop_max}. 
    Network: ${plan.network_type}. 
    Benefits: ${plan.benefits.join(', ')}`
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  
  return response.data[0].embedding
}

// Store embedding
await db.update(plans)
  .set({ description_embedding: embedding })
  .where(eq(plans.id, planId))
```

4. **Semantic Search**
```typescript
export async function semanticPlanSearch(query: string, topK = 5) {
  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query)
  
  // Find similar plans
  const results = await db.execute(sql`
    SELECT *, 
      1 - (description_embedding <=> ${queryEmbedding}::vector) as similarity
    FROM plans
    WHERE description_embedding IS NOT NULL
    ORDER BY description_embedding <=> ${queryEmbedding}::vector
    LIMIT ${topK}
  `)
  
  return results.rows
}
```

---

## Recommended Implementation Timeline

### Week 1: Database Setup
- [ ] Add plans, planBenefits, providerNetworks tables to schema
- [ ] Run migrations: `npm run db:push`
- [ ] Enable pgvector extension

### Week 2: Data Sourcing
- [ ] Choose API source (Covered CA or Healthcare.gov)
- [ ] Obtain API credentials
- [ ] Build API client wrapper
- [ ] Test fetching sample plans

### Week 3: Sync Pipeline
- [ ] Build sync script
- [ ] Transform API data to our schema
- [ ] Set up daily sync job (cron or BullMQ)
- [ ] Initial data load

### Week 4: Integration
- [ ] Update `findPlans()` to query database
- [ ] Add Redis caching layer
- [ ] Test Coverage Advisor with real data
- [ ] Performance optimization

### Week 5: Enhancements
- [ ] Generate and store plan embeddings
- [ ] Implement semantic search
- [ ] Add plan comparison features
- [ ] Build admin dashboard for plan management

---

## Performance Optimization

### Caching Strategy
```
Request → Check Redis → Check Postgres → Fetch from API
    ↓          ↓             ↓               ↓
  Return ← Cache (1hr) ← Cache (24hr) ← Cache (7d)
```

### Index Recommendations
```sql
CREATE INDEX idx_plans_coverage ON plans(coverage_area, metal_level, premium);
CREATE INDEX idx_plans_dates ON plans(effective_date, termination_date);
CREATE INDEX idx_provider_networks_plan ON provider_networks(plan_id);
CREATE INDEX idx_provider_networks_name ON provider_networks USING gin(provider_name gin_trgm_ops);
```

### Query Optimization
- Use query result caching (Redis)
- Limit result sets (pagination)
- Pre-compute common queries
- Use materialized views for complex aggregations

---

## Monitoring & Alerts

### Key Metrics
- **Plan data freshness**: Last sync timestamp
- **API call latency**: External API response times
- **Cache hit rate**: % of requests served from cache
- **Plan availability**: # of active plans per ZIP

### Alerts
- Sync failures (24hr+ stale data)
- API rate limit approaching
- Missing plan data for active ZIPs
- Significant premium changes (>10%)

---

## Cost Considerations

### API Costs
- Covered CA API: TBD (contact for pricing)
- OpenAI embeddings: ~$0.0001 per plan (~$20 for 200k plans)

### Storage Costs
- Plans table: ~10MB for 10k plans
- Embeddings: ~6MB per 1k plans (1536 dimensions)
- Provider networks: ~100MB for comprehensive CA data

### Operational Costs
- Daily sync: ~5 minutes runtime
- Cache storage (Redis): ~100MB
- Database: ~500MB total

---

## Security & Compliance

### Data Protection
- Store API keys in environment variables
- Encrypt plan pricing data at rest
- Log all plan data access
- Regular security audits

### HIPAA Considerations
- Plan data itself is not PHI
- User intake data + plan selections = PHI
- Ensure proper consent and encryption
- Maintain audit trails

---

## Next Steps

1. **Choose data source**: Covered CA API vs Healthcare.gov vs manual CSV import
2. **Set up database schema**: Run migrations for new tables
3. **Build initial sync**: Start with small dataset (1 county)
4. **Test integration**: Verify Coverage Advisor works with real data
5. **Scale up**: Expand to all CA counties
6. **Add features**: Semantic search, plan comparisons, subsidy calculations

**Questions to answer:**
- Which API source is available to us?
- What are the API rate limits and costs?
- How often do plan prices change?
- Do we need multi-year historical data?
