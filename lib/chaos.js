// lib/chaos.js - Chaos Engineering for Webhook Server
import * as metrics from './metrics.js';

class ChaosEngine {
  constructor() {
    this.scenarios = new Map();
    this.activeScenarios = new Set();
  }

  // Register chaos scenarios
  registerScenario(name, scenario) {
    this.scenarios.set(name, scenario);
  }

  // Start a chaos scenario
  async startScenario(name, duration = 60000) {
    if (this.activeScenarios.has(name)) {
      throw new Error(`Scenario ${name} already active`);
    }

    const scenario = this.scenarios.get(name);
    if (!scenario) {
      throw new Error(`Unknown scenario: ${name}`);
    }

    console.log(`🔥 CHAOS: Starting ${name} for ${duration}ms`);
    this.activeScenarios.add(name);
    metrics.inc('chaos_scenarios_started');

    try {
      await scenario.start();
      
      // Auto-stop after duration
      setTimeout(async () => {
        if (this.activeScenarios.has(name)) {
          await this.stopScenario(name);
        }
      }, duration);

      return { started: true, scenario: name, duration };
    } catch (err) {
      this.activeScenarios.delete(name);
      console.error(`🔥 CHAOS: Failed to start ${name}:`, err);
      throw err;
    }
  }

  // Stop a chaos scenario
  async stopScenario(name) {
    if (!this.activeScenarios.has(name)) {
      throw new Error(`Scenario ${name} not active`);
    }

    const scenario = this.scenarios.get(name);
    console.log(`🔥 CHAOS: Stopping ${name}`);
    
    try {
      await scenario.stop();
      this.activeScenarios.delete(name);
      metrics.inc('chaos_scenarios_stopped');
      return { stopped: true, scenario: name };
    } catch (err) {
      console.error(`🔥 CHAOS: Failed to stop ${name}:`, err);
      throw err;
    }
  }

  // Get active scenarios
  getActiveScenarios() {
    return Array.from(this.activeScenarios);
  }

  // Stop all scenarios
  async stopAll() {
    const results = [];
    for (const name of this.activeScenarios) {
      try {
        await this.stopScenario(name);
        results.push({ scenario: name, stopped: true });
      } catch (err) {
        results.push({ scenario: name, stopped: false, error: err.message });
      }
    }
    return results;
  }
}

// Chaos scenarios
const scenarios = {
  // Kill Slack webhook responses
  killSlack: {
    start: async () => {
      // Monkey-patch fetch to fail Slack requests
      const originalFetch = global.fetch || (await import('node-fetch')).default;
      global._chaosOriginalFetch = originalFetch;
      
      global.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('hooks.slack.com')) {
          console.log('🔥 CHAOS: Blocking Slack request');
          throw new Error('CHAOS: Slack service unavailable');
        }
        return originalFetch(url, options);
      };
    },
    stop: async () => {
      if (global._chaosOriginalFetch) {
        global.fetch = global._chaosOriginalFetch;
        delete global._chaosOriginalFetch;
      }
    }
  },

  // Inject high latency
  highLatency: {
    start: async () => {
      const originalFetch = global.fetch || (await import('node-fetch')).default;
      global._chaosOriginalFetch = originalFetch;
      
      global.fetch = async (url, options) => {
        // Add 5-15 second delay to external requests
        const delay = 5000 + Math.random() * 10000;
        console.log(`🔥 CHAOS: Injecting ${Math.round(delay)}ms latency`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return originalFetch(url, options);
      };
    },
    stop: async () => {
      if (global._chaosOriginalFetch) {
        global.fetch = global._chaosOriginalFetch;
        delete global._chaosOriginalFetch;
      }
    }
  },

  // Intermittent failures (50% failure rate)
  intermittentFailures: {
    start: async () => {
      const originalFetch = global.fetch || (await import('node-fetch')).default;
      global._chaosOriginalFetch = originalFetch;
      
      global.fetch = async (url, options) => {
        if (Math.random() < 0.5) {
          console.log('🔥 CHAOS: Simulating intermittent failure');
          throw new Error('CHAOS: Random network failure');
        }
        return originalFetch(url, options);
      };
    },
    stop: async () => {
      if (global._chaosOriginalFetch) {
        global.fetch = global._chaosOriginalFetch;
        delete global._chaosOriginalFetch;
      }
    }
  },

  // ElevenLabs API failures
  killElevenLabs: {
    start: async () => {
      const originalFetch = global.fetch || (await import('node-fetch')).default;
      global._chaosOriginalFetch = originalFetch;
      
      global.fetch = async (url, options) => {
        if (typeof url === 'string' && url.includes('elevenlabs')) {
          console.log('🔥 CHAOS: Blocking ElevenLabs request');
          const error = new Error('CHAOS: ElevenLabs service unavailable');
          error.status = 503;
          throw error;
        }
        return originalFetch(url, options);
      };
    },
    stop: async () => {
      if (global._chaosOriginalFetch) {
        global.fetch = global._chaosOriginalFetch;
        delete global._chaosOriginalFetch;
      }
    }
  },

  // Database query slowdown
  slowDatabase: {
    start: async () => {
      // This would require DB connection monkey-patching
      console.log('🔥 CHAOS: Database slowdown activated (simulated)');
      global._chaosDbDelay = 2000;
    },
    stop: async () => {
      delete global._chaosDbDelay;
    }
  }
};

// Initialize chaos engine
export const chaosEngine = new ChaosEngine();

// Register all scenarios
for (const [name, scenario] of Object.entries(scenarios)) {
  chaosEngine.registerScenario(name, scenario);
}

// Chaos testing utilities
export async function startChaos(scenario, duration) {
  return chaosEngine.startScenario(scenario, duration);
}

export async function stopChaos(scenario) {
  return chaosEngine.stopScenario(scenario);
}

export function getChaosStatus() {
  return {
    active: chaosEngine.getActiveScenarios(),
    available: Array.from(chaosEngine.scenarios.keys())
  };
}

export async function stopAllChaos() {
  return chaosEngine.stopAll();
}