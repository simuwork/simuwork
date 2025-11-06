// EventBus.js - Communication system for agents to observe and react to events

class EventBus {
  constructor() {
    this.subscribers = {};
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  // Subscribe to specific event types
  subscribe(eventType, handler, subscriberId = null) {
    if (!this.subscribers[eventType]) {
      this.subscribers[eventType] = [];
    }

    const subscription = {
      id: subscriberId || `sub_${Date.now()}_${Math.random()}`,
      handler,
      subscribedAt: Date.now(),
    };

    this.subscribers[eventType].push(subscription);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventType, subscription.id);
    };
  }

  // Unsubscribe from event
  unsubscribe(eventType, subscriptionId) {
    if (this.subscribers[eventType]) {
      this.subscribers[eventType] = this.subscribers[eventType].filter(
        (sub) => sub.id !== subscriptionId
      );
    }
  }

  // Publish event to all subscribers
  publish(eventType, payload = {}, source = 'system') {
    const event = {
      type: eventType,
      payload,
      source,
      timestamp: Date.now(),
      id: `evt_${Date.now()}_${Math.random()}`,
    };

    // Record in history
    this.recordEvent(event);

    // Log event for debugging
    console.log(`[EventBus] ${eventType}`, payload);

    // Notify all subscribers
    if (this.subscribers[eventType]) {
      this.subscribers[eventType].forEach((subscription) => {
        try {
          subscription.handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Also notify wildcard subscribers (listening to all events)
    if (this.subscribers['*']) {
      this.subscribers['*'].forEach((subscription) => {
        try {
          subscription.handler(event);
        } catch (error) {
          console.error('Error in wildcard event handler:', error);
        }
      });
    }

    return event;
  }

  // Record event in history
  recordEvent(event) {
    this.eventHistory.push(event);

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  // Get recent events
  getRecentEvents(count = 10, eventType = null) {
    let events = [...this.eventHistory];

    if (eventType) {
      events = events.filter((e) => e.type === eventType);
    }

    return events.slice(-count);
  }

  // Get all events of specific type
  getEventsByType(eventType) {
    return this.eventHistory.filter((e) => e.type === eventType);
  }

  // Clear history
  clearHistory() {
    this.eventHistory = [];
  }

  // Get subscriber count
  getSubscriberCount(eventType = null) {
    if (eventType) {
      return this.subscribers[eventType]?.length || 0;
    }

    return Object.values(this.subscribers).reduce(
      (total, subs) => total + subs.length,
      0
    );
  }

  // List all event types being listened to
  getEventTypes() {
    return Object.keys(this.subscribers);
  }
}

// Event type constants
export const EventTypes = {
  // User actions
  USER_CODE_CHANGE: 'user_code_change',
  USER_RUN_TESTS: 'user_run_tests',
  USER_ASK_QUESTION: 'user_ask_question',
  USER_DEPLOY: 'user_deploy',
  USER_VIEW_FILE: 'user_view_file',
  USER_DECISION: 'user_decision',

  // Agent actions
  AGENT_MESSAGE: 'agent_message',
  AGENT_CODE_REVIEW: 'agent_code_review',
  AGENT_HINT: 'agent_hint',
  AGENT_QUESTION: 'agent_question',

  // Scenario events
  SCENARIO_PHASE_CHANGE: 'scenario_phase_change',
  SCENARIO_OBJECTIVE_COMPLETE: 'scenario_objective_complete',
  SCENARIO_COMPLICATION: 'scenario_complication',
  SCENARIO_COMPLETE: 'scenario_complete',

  // Incident events
  INCIDENT_CREATED: 'incident_created',
  INCIDENT_ESCALATED: 'incident_escalated',
  INCIDENT_RESOLVED: 'incident_resolved',

  // Test events
  TESTS_STARTED: 'tests_started',
  TESTS_PASSED: 'tests_passed',
  TESTS_FAILED: 'tests_failed',

  // Code events
  CODE_ERROR: 'code_error',
  CODE_WARNING: 'code_warning',
  CODE_QUALITY_CHECK: 'code_quality_check',

  // Time events
  TIME_TICK: 'time_tick',
  DEADLINE_APPROACHING: 'deadline_approaching',
  DEADLINE_MISSED: 'deadline_missed',

  // State changes
  STATE_UPDATED: 'state_updated',

  // System events
  SYSTEM_READY: 'system_ready',
  SYSTEM_ERROR: 'system_error',
};

// Singleton instance
export const eventBus = new EventBus();
export default EventBus;
