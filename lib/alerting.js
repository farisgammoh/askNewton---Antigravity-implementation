// lib/alerting.js - Alerting integration for Prometheus metrics
import fetch from 'node-fetch';
import * as metrics from './metrics.js';

class AlertManager {
  constructor() {
    this.rules = new Map();
    this.lastAlerts = new Map();
    this.cooldownMs = 5 * 60 * 1000; // 5 minute cooldown between alerts
  }

  // Add an alerting rule
  addRule(name, config) {
    this.rules.set(name, {
      metric: config.metric,
      threshold: config.threshold,
      operator: config.operator || 'greater_than', // greater_than, less_than, equals
      message: config.message,
      channels: config.channels || ['slack'], // slack, email, webhook
      cooldownMs: config.cooldownMs || this.cooldownMs,
      enabled: config.enabled !== false
    });
  }

  // Check all rules and fire alerts
  async checkAlerts() {
    const currentMetrics = metrics.snapshot();
    const alerts = [];

    for (const [ruleName, rule] of this.rules.entries()) {
      if (!rule.enabled) continue;

      const currentValue = currentMetrics[rule.metric] || 0;
      const shouldAlert = this.evaluateCondition(currentValue, rule.threshold, rule.operator);

      if (shouldAlert) {
        const lastAlert = this.lastAlerts.get(ruleName);
        const now = Date.now();

        // Check cooldown
        if (!lastAlert || (now - lastAlert.timestamp) > rule.cooldownMs) {
          const alert = {
            rule: ruleName,
            metric: rule.metric,
            value: currentValue,
            threshold: rule.threshold,
            message: this.formatMessage(rule.message, rule.metric, currentValue, rule.threshold),
            timestamp: now,
            channels: rule.channels
          };

          alerts.push(alert);
          this.lastAlerts.set(ruleName, alert);
        }
      }
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }

    return alerts;
  }

  evaluateCondition(value, threshold, operator) {
    switch (operator) {
      case 'greater_than': return value > threshold;
      case 'greater_equal': return value >= threshold;
      case 'less_than': return value < threshold;
      case 'less_equal': return value <= threshold;
      case 'equals': return value === threshold;
      case 'not_equals': return value !== threshold;
      default: return false;
    }
  }

  formatMessage(template, metric, value, threshold) {
    return template
      .replace('{metric}', metric)
      .replace('{value}', value)
      .replace('{threshold}', threshold)
      .replace('{timestamp}', new Date().toISOString());
  }

  async sendAlert(alert) {
    console.log(`🚨 ALERT: ${alert.message}`);
    
    const promises = alert.channels.map(channel => {
      switch (channel) {
        case 'slack': return this.sendSlackAlert(alert);
        case 'email': return this.sendEmailAlert(alert);
        case 'webhook': return this.sendWebhookAlert(alert);
        default: return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  async sendSlackAlert(alert) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) return;

    try {
      const payload = {
        text: `🚨 AskNewton Webhook Server Alert`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${alert.message}*\n\n*Metric:* ${alert.metric}\n*Value:* ${alert.value}\n*Threshold:* ${alert.threshold}\n*Time:* ${new Date(alert.timestamp).toISOString()}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Check the webhook server health and metrics for more details."
            },
            accessory: {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Health"
              },
              url: `http://localhost:3000/health/resilience`
            }
          }
        ]
      };

      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      console.log(`📱 Slack alert sent for: ${alert.rule}`);
    } catch (err) {
      console.error(`❌ Failed to send Slack alert:`, err.message);
    }
  }

  async sendEmailAlert(alert) {
    // Email integration would require SMTP setup
    console.log(`📧 Email alert (not configured): ${alert.message}`);
  }

  async sendWebhookAlert(alert) {
    const webhookUrl = process.env.ALERT_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'webhook_alert',
          alert,
          server: 'asknewton-webhooks'
        }),
        signal: AbortSignal.timeout(5000)
      });

      console.log(`🔗 Webhook alert sent for: ${alert.rule}`);
    } catch (err) {
      console.error(`❌ Failed to send webhook alert:`, err.message);
    }
  }

  // Get alert status
  getStatus() {
    return {
      rules: Array.from(this.rules.entries()).map(([name, rule]) => ({
        name,
        ...rule,
        lastAlert: this.lastAlerts.get(name)?.timestamp || null
      })),
      totalRules: this.rules.size,
      activeRules: Array.from(this.rules.values()).filter(rule => rule.enabled).length
    };
  }

  // Enable/disable rule
  setRuleEnabled(name, enabled) {
    const rule = this.rules.get(name);
    if (rule) {
      rule.enabled = enabled;
      return true;
    }
    return false;
  }
}

// Default alert manager instance
export const alertManager = new AlertManager();

// Default alerting rules for production readiness
alertManager.addRule('circuit_breakers_opening', {
  metric: 'circuit_open',
  threshold: 2,
  operator: 'greater_equal',
  message: '🚨 Multiple circuit breakers opening - external services failing',
  channels: ['slack']
});

alertManager.addRule('high_delivery_failures', {
  metric: 'outbound_failed', 
  threshold: 10,
  operator: 'greater_than',
  message: '🚨 High delivery failure rate - {value} failed deliveries',
  channels: ['slack']
});

alertManager.addRule('dlq_backlog_high', {
  metric: 'retry_exhausted',
  threshold: 5,
  operator: 'greater_than', 
  message: '⚠️ Dead letter queue backlog growing - {value} exhausted retries',
  channels: ['slack']
});

alertManager.addRule('signature_attack', {
  metric: 'invalid_signature_total',
  threshold: 20,
  operator: 'greater_than',
  message: '🚨 Potential attack - {value} invalid signature attempts',
  channels: ['slack'],
  cooldownMs: 2 * 60 * 1000 // 2 minutes
});

alertManager.addRule('error_spike', {
  metric: 'errors_total',
  threshold: 15,
  operator: 'greater_than',
  message: '🔥 Error spike detected - {value} total errors',
  channels: ['slack']
});

// Start monitoring (call this from server startup)
let alertingInterval;

export function startAlerting(intervalMs = 30000) {
  if (alertingInterval) return;
  
  console.log(`🚨 Starting alerting monitor (check every ${intervalMs}ms)`);
  
  alertingInterval = setInterval(async () => {
    try {
      await alertManager.checkAlerts();
    } catch (err) {
      console.error('Alerting check failed:', err);
    }
  }, intervalMs);
}

export function stopAlerting() {
  if (alertingInterval) {
    clearInterval(alertingInterval);
    alertingInterval = null;
    console.log('🚨 Alerting monitor stopped');
  }
}