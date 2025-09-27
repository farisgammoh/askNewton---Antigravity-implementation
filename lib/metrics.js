// lib/metrics.js - Enhanced metrics for resilience patterns
const counters = {
  // Existing webhook metrics
  events_total: 0,
  duplicates_total: 0,
  invalid_signature_total: 0,
  errors_total: 0,
  
  // New resilience metrics
  outbound_ok: 0,
  outbound_retry: 0,
  outbound_failed: 0,
  circuit_open: 0,
  queue_enqueued: 0,
  queue_processed: 0,
  retry_exhausted: 0,
  
  // Chaos engineering metrics
  chaos_scenarios_started: 0,
  chaos_scenarios_stopped: 0,
  
  // Rate limiting metrics
  rate_limiter_acquired: 0,
  rate_limiter_rejected: 0,
  rate_limiter_timeout: 0,
  rate_limiter_errors: 0
};

export function inc(name, value = 1) { 
  counters[name] = (counters[name] || 0) + value; 
}

export function set(name, value) {
  counters[name] = value;
}

export function get(name) {
  return counters[name] || 0;
}

export function snapshot() { 
  return { ...counters }; 
}

export function getPrometheusMetrics() {
  return [
    "# HELP asknewton_events_total Total accepted events",
    "# TYPE asknewton_events_total counter",
    `asknewton_events_total ${counters.events_total}`,
    
    "# HELP asknewton_duplicates_total Total duplicate events",
    "# TYPE asknewton_duplicates_total counter",
    `asknewton_duplicates_total ${counters.duplicates_total}`,
    
    "# HELP asknewton_invalid_signature_total Invalid signature attempts",
    "# TYPE asknewton_invalid_signature_total counter",
    `asknewton_invalid_signature_total ${counters.invalid_signature_total}`,
    
    "# HELP asknewton_errors_total Processing/server errors",
    "# TYPE asknewton_errors_total counter",
    `asknewton_errors_total ${counters.errors_total}`,
    
    "# HELP asknewton_outbound_ok_total Successful outbound deliveries",
    "# TYPE asknewton_outbound_ok_total counter", 
    `asknewton_outbound_ok_total ${counters.outbound_ok}`,
    
    "# HELP asknewton_outbound_retry_total Retrying outbound deliveries",
    "# TYPE asknewton_outbound_retry_total counter",
    `asknewton_outbound_retry_total ${counters.outbound_retry}`,
    
    "# HELP asknewton_outbound_failed_total Failed outbound deliveries",
    "# TYPE asknewton_outbound_failed_total counter",
    `asknewton_outbound_failed_total ${counters.outbound_failed}`,
    
    "# HELP asknewton_circuit_open_total Circuit breaker openings",
    "# TYPE asknewton_circuit_open_total counter",
    `asknewton_circuit_open_total ${counters.circuit_open}`,
    
    "# HELP asknewton_queue_enqueued_total Items enqueued for delivery",
    "# TYPE asknewton_queue_enqueued_total counter",
    `asknewton_queue_enqueued_total ${counters.queue_enqueued}`,
    
    "# HELP asknewton_queue_processed_total Items processed by queue",
    "# TYPE asknewton_queue_processed_total counter",
    `asknewton_queue_processed_total ${counters.queue_processed}`,
    
    "# HELP asknewton_retry_exhausted_total Items that exhausted retries",
    "# TYPE asknewton_retry_exhausted_total counter",
    `asknewton_retry_exhausted_total ${counters.retry_exhausted}`,
    
    "# HELP asknewton_chaos_scenarios_started_total Chaos scenarios started",
    "# TYPE asknewton_chaos_scenarios_started_total counter",
    `asknewton_chaos_scenarios_started_total ${counters.chaos_scenarios_started}`,
    
    "# HELP asknewton_chaos_scenarios_stopped_total Chaos scenarios stopped", 
    "# TYPE asknewton_chaos_scenarios_stopped_total counter",
    `asknewton_chaos_scenarios_stopped_total ${counters.chaos_scenarios_stopped}`,
    
    "# HELP asknewton_rate_limiter_acquired_total Rate limiter tokens acquired",
    "# TYPE asknewton_rate_limiter_acquired_total counter",
    `asknewton_rate_limiter_acquired_total ${counters.rate_limiter_acquired}`,
    
    "# HELP asknewton_rate_limiter_rejected_total Rate limiter requests rejected",
    "# TYPE asknewton_rate_limiter_rejected_total counter", 
    `asknewton_rate_limiter_rejected_total ${counters.rate_limiter_rejected}`,
    
    "# HELP asknewton_rate_limiter_timeout_total Rate limiter acquisition timeouts",
    "# TYPE asknewton_rate_limiter_timeout_total counter",
    `asknewton_rate_limiter_timeout_total ${counters.rate_limiter_timeout}`,
    
    "# HELP asknewton_rate_limiter_errors_total Rate limiter errors",
    "# TYPE asknewton_rate_limiter_errors_total counter",
    `asknewton_rate_limiter_errors_total ${counters.rate_limiter_errors}`
  ].join("\n");
}