# AskNewton – Cost Optimization Monitoring & Dashboards

This document describes how to monitor OpenAI usage, cache performance, and idempotent request savings.

---

## 1. Database Tables

### 1.1 `openai_call_log`

Tracks each OpenAI API call for cost monitoring and usage analysis.

**Columns:**
- `id` - UUID primary key
- `endpoint` – Logical name (e.g., `personas.generate`, `chat.completion`, `personas.images.generate`)
- `model` – Model used (e.g., `gpt-5`, `dall-e-3`)
- `tokens_prompt` – Prompt tokens used (optional)
- `tokens_completion` – Completion tokens used (optional)
- `cost_usd` – Estimated cost in USD (optional, for future use)
- `created_at` – Timestamp of the call

### 1.2 `persona_cache`

Tracks unique persona input sets and their cached personas.

**Columns:**
- `id` - UUID primary key
- `input_hash` – SHA-256 hash of input parameters (unique)
- `personas_json` – JSON array of cached personas
- `created_at` – Cache entry creation time

### 1.3 `request_log`

Tracks idempotent responses for expensive endpoints.

**Columns:**
- `id` - UUID primary key
- `request_hash` – SHA-256 hash of request (unique)
- `response_json` – Cached response data
- `created_at` – Log entry creation time

---

## 2. Core Monitoring Queries

### 2.1 Persona Cache Metrics

**Total cache entries:**

```sql
SELECT COUNT(*) AS total_persona_cache_entries
FROM persona_cache;
```

**New entries per day (last 30 days):**

```sql
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS new_entries
FROM persona_cache
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

**Age distribution (how "stale" personas are):**

```sql
SELECT
  CASE
    WHEN created_at >= NOW() - INTERVAL '1 day' THEN '0-1 days'
    WHEN created_at >= NOW() - INTERVAL '7 days' THEN '1-7 days'
    WHEN created_at >= NOW() - INTERVAL '30 days' THEN '7-30 days'
    ELSE '30+ days'
  END AS age_bucket,
  COUNT(*) AS count
FROM persona_cache
GROUP BY age_bucket
ORDER BY
  CASE age_bucket
    WHEN '0-1 days' THEN 1
    WHEN '1-7 days' THEN 2
    WHEN '7-30 days' THEN 3
    ELSE 4
  END;
```

---

### 2.2 Idempotent Requests

**Total deduped responses stored:**

```sql
SELECT COUNT(*) AS total_idempotent_entries
FROM request_log;
```

**Daily idempotent entries (proxy for duplicate-expensive requests):**

```sql
SELECT
  DATE(created_at) AS day,
  COUNT(*) AS requests_deduped
FROM request_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day;
```

---

### 2.3 OpenAI Cost Analysis

**Daily OpenAI calls by endpoint (last 30 days):**

```sql
SELECT
  DATE(created_at) AS day,
  endpoint,
  COUNT(*) AS num_calls
FROM openai_call_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day, endpoint
ORDER BY day, endpoint;
```

**Total calls by model:**

```sql
SELECT
  model,
  COUNT(*) AS total_calls
FROM openai_call_log
GROUP BY model
ORDER BY total_calls DESC;
```

**Token usage by endpoint (when available):**

```sql
SELECT
  endpoint,
  COUNT(*) AS num_calls,
  SUM(CAST(tokens_prompt AS INT)) AS total_prompt_tokens,
  SUM(CAST(tokens_completion AS INT)) AS total_completion_tokens,
  SUM(CAST(tokens_prompt AS INT) + CAST(tokens_completion AS INT)) AS total_tokens
FROM openai_call_log
WHERE tokens_prompt IS NOT NULL AND tokens_completion IS NOT NULL
GROUP BY endpoint
ORDER BY total_tokens DESC;
```

**Cost estimation (if cost_usd is populated):**

```sql
SELECT
  DATE(created_at) AS day,
  endpoint,
  SUM(CAST(cost_usd AS NUMERIC)) AS total_cost_usd
FROM openai_call_log
WHERE cost_usd IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY day, endpoint
ORDER BY day, endpoint;
```

---

### 2.4 Approximate Persona Cache Hit Ratio

This query estimates how effectively the persona cache is working:

```sql
WITH persona_calls AS (
  SELECT COUNT(*) AS num_calls
  FROM openai_call_log
  WHERE endpoint = 'personas.generate'
),
persona_misses AS (
  SELECT COUNT(*) AS num_unique_sets
  FROM persona_cache
)
SELECT
  num_calls,
  num_unique_sets,
  CASE 
    WHEN num_calls > 0 THEN 
      1.0 - (num_unique_sets::decimal / num_calls)
    ELSE 0
  END AS cache_hit_ratio,
  CASE 
    WHEN num_calls > 0 THEN 
      ROUND((1.0 - (num_unique_sets::decimal / num_calls)) * 100, 2)
    ELSE 0
  END AS cache_hit_percentage
FROM persona_calls, persona_misses;
```

---

## 3. Grafana / BI Dashboard Panels

You can create visualizations using these queries in Grafana (Postgres data source), Metabase, or any other BI tool.

### Panel 1: Daily OpenAI Calls by Endpoint

**Type:** Time series  
**Query:**

```sql
SELECT
  created_at AS time,
  endpoint,
  COUNT(*) AS value
FROM openai_call_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY time_bucket('1 day', created_at), endpoint
ORDER BY time;
```

**Y-axis:** Number of calls  
**Legend:** `{{endpoint}}`

---

### Panel 2: Persona Cache Growth

**Type:** Bar chart or time series  
**Query:**

```sql
SELECT
  DATE(created_at) AS time,
  COUNT(*) AS value
FROM persona_cache
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY time;
```

**Interpretation:**
- Spikes indicate new unique persona configurations
- Flat line over time indicates stable usage with high cache reuse

---

### Panel 3: Idempotent Requests Over Time

**Type:** Time series  
**Query:**

```sql
SELECT
  DATE(created_at) AS time,
  COUNT(*) AS value
FROM request_log
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY time;
```

**Interpretation:**
- Each entry represents a saved duplicate request (cost saved)

---

### Panel 4: API Calls by Model

**Type:** Pie chart or table  
**Query:**

```sql
SELECT
  model,
  COUNT(*) AS total_calls
FROM openai_call_log
GROUP BY model
ORDER BY total_calls DESC;
```

**Shows:** Distribution of usage across different OpenAI models

---

### Panel 5: Persona Cache Hit Ratio

**Type:** Single stat panel (0-100%)  
**Query:**

```sql
WITH persona_calls AS (
  SELECT COUNT(*) AS num_calls
  FROM openai_call_log
  WHERE endpoint = 'personas.generate'
),
persona_misses AS (
  SELECT COUNT(*) AS num_unique_sets
  FROM persona_cache
)
SELECT
  ROUND((1.0 - (num_unique_sets::decimal / GREATEST(num_calls, 1))) * 100, 2) AS cache_hit_percentage
FROM persona_calls, persona_misses;
```

**Target:** > 70% indicates excellent cache performance

---

## 4. Cost Savings Estimation

### Manual Cost Calculation

If you populate `cost_usd` field, you can track exact costs. Otherwise, estimate using:

**GPT-5 Pricing (example rates):**
- Prompt: $0.0015 per 1K tokens
- Completion: $0.006 per 1K tokens

**DALL-E 3 Pricing:**
- $0.04 per standard image (1024x1024)

**Query to estimate GPT-5 costs:**

```sql
SELECT
  endpoint,
  SUM(
    (CAST(tokens_prompt AS NUMERIC) / 1000.0 * 0.0015) +
    (CAST(tokens_completion AS NUMERIC) / 1000.0 * 0.006)
  ) AS estimated_cost_usd
FROM openai_call_log
WHERE model = 'gpt-5'
  AND tokens_prompt IS NOT NULL
  AND tokens_completion IS NOT NULL
GROUP BY endpoint;
```

---

## 5. Monitoring Recommendations

### Daily Checks
1. Review cache hit ratio (should be > 50% for stable usage)
2. Check for unusual spikes in API calls
3. Monitor token usage trends

### Weekly Reviews
1. Analyze cost trends by endpoint
2. Review persona cache age distribution
3. Identify opportunities for additional caching

### Monthly Analysis
1. Calculate total OpenAI costs vs. savings from cache
2. Review cache effectiveness and adjust strategies
3. Identify optimization opportunities

---

## 6. Alerts and Thresholds

Consider setting up alerts for:

- **High API usage:** > 1000 calls per day
- **Low cache hit rate:** < 30% for persona generation
- **Sudden cost spike:** > 2x average daily cost
- **Cache size growth:** Unexpected growth in cache tables

---

## 7. Next Steps

To enhance monitoring further:

1. **Add cost tracking:** Populate `cost_usd` field with actual costs
2. **Set up Grafana:** Create automated dashboards with these queries
3. **Implement alerts:** Use Grafana alerts or application-level monitoring
4. **Track user impact:** Correlate cost savings with user experience metrics
5. **Add more caching layers:** Identify other expensive operations to cache

---

## Appendix: Quick Commands

**Check current cache stats:**

```bash
npm run db:query -- "SELECT COUNT(*) FROM persona_cache"
npm run db:query -- "SELECT COUNT(*) FROM openai_call_log"
npm run db:query -- "SELECT COUNT(*) FROM request_log"
```

**Export data for analysis:**

```bash
npm run db:export -- openai_call_log > logs/openai_calls.csv
```

---

**Last Updated:** January 2025  
**Version:** 1.0
