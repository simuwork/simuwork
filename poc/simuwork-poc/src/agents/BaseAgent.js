// BaseAgent.js - Base class for all AI agents in the simulation

import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class BaseAgent {
  constructor(id, config = {}) {
    this.id = id;
    this.role = config.role || 'unknown';
    this.personality = config.personality || {};
    this.memory = [];
    this.maxMemorySize = 20;
    this.subscriptions = [];
    this.isActive = true;

    // Agent configuration
    this.config = {
      responseDelay: config.responseDelay || 1000, // ms before responding
      proactivityChance: config.proactivityChance || 0.3, // chance of unsolicited input
      verbosity: config.verbosity || 'normal', // terse, normal, verbose
      ...config,
    };

    // Initialize agent
    this.initialize();
  }

  // Initialize agent (override in subclasses)
  initialize() {
    console.log(`[${this.id}] Agent initialized`);
  }

  // Subscribe to events
  subscribeToEvents(eventTypes) {
    eventTypes.forEach((eventType) => {
      const unsub = eventBus.subscribe(
        eventType,
        (event) => this.handleEvent(event),
        `${this.id}_${eventType}`
      );
      this.subscriptions.push(unsub);
    });
  }

  // Handle incoming events (override in subclasses)
  handleEvent(event) {
    // Store in memory
    this.remember(event);

    // Decide if agent should react
    if (this.shouldReact(event)) {
      this.react(event);
    }
  }

  // Decide if agent should react to this event
  shouldReact(event) {
    // Don't react to own messages
    if (event.source === this.id) {
      return false;
    }

    // Check if agent is active
    if (!this.isActive) {
      return false;
    }

    // Override in subclasses for specific logic
    return true;
  }

  // React to event (override in subclasses)
  react(event) {
    console.log(`[${this.id}] Reacting to ${event.type}`);
  }

  // Store event in memory
  remember(event) {
    this.memory.push({
      timestamp: Date.now(),
      event,
    });

    // Limit memory size
    if (this.memory.length > this.maxMemorySize) {
      this.memory.shift();
    }
  }

  // Retrieve memories
  recall(filterFn = null) {
    if (filterFn) {
      return this.memory.filter(filterFn);
    }
    return this.memory;
  }

  // Get recent memories
  getRecentMemories(count = 5) {
    return this.memory.slice(-count);
  }

  // Send message to user
  sendMessage(content, metadata = {}) {
    const message = {
      agentId: this.id,
      agentRole: this.role,
      content,
      personality: this.personality.style || 'neutral',
      timestamp: Date.now(),
      ...metadata,
    };

    // Add slight delay for realism
    setTimeout(() => {
      worldState.addMessage(message);
      eventBus.publish(EventTypes.AGENT_MESSAGE, message, this.id);
    }, this.config.responseDelay);

    return message;
  }

  // Provide code review
  reviewCode(code, feedback) {
    const review = {
      agentId: this.id,
      code,
      feedback,
      timestamp: Date.now(),
    };

    eventBus.publish(EventTypes.AGENT_CODE_REVIEW, review, this.id);
    return review;
  }

  // Provide hint
  giveHint(hint, severity = 'info') {
    const hintData = {
      agentId: this.id,
      hint,
      severity, // info, warning, critical
      timestamp: Date.now(),
    };

    worldState.addMessage({
      agentId: this.id,
      agentRole: this.role,
      content: hint,
      type: 'hint',
      severity,
    });

    eventBus.publish(EventTypes.AGENT_HINT, hintData, this.id);
    return hintData;
  }

  // Ask question to user
  askQuestion(question, context = {}) {
    const questionData = {
      agentId: this.id,
      question,
      context,
      timestamp: Date.now(),
    };

    worldState.addMessage({
      agentId: this.id,
      agentRole: this.role,
      content: question,
      type: 'question',
    });

    eventBus.publish(EventTypes.AGENT_QUESTION, questionData, this.id);
    return questionData;
  }

  // Observe world state
  observeState() {
    return worldState.getState();
  }

  // Get agent state from world
  getAgentState() {
    return worldState.getSlice(`agents.${this.id}`) || {};
  }

  // Update agent state
  updateAgentState(updates) {
    worldState.updateAgent(this.id, updates);
  }

  // Check if should act proactively
  shouldActProactively() {
    return Math.random() < this.config.proactivityChance;
  }

  // Generate response based on personality
  generateResponse(baseMessage, context = {}) {
    // This would integrate with LLM in production
    // For POC, use personality templates

    const state = this.observeState();
    const agentState = this.getAgentState();

    // Apply personality modifiers
    let response = baseMessage;

    if (this.personality.style === 'friendly') {
      response = `Hey! ${response}`;
    } else if (this.personality.style === 'formal') {
      response = `${response}`;
    } else if (this.personality.style === 'terse') {
      response = response.split('.')[0]; // Just first sentence
    }

    return response;
  }

  // Cleanup on destroy
  destroy() {
    this.subscriptions.forEach((unsub) => unsub());
    this.subscriptions = [];
    this.isActive = false;
    console.log(`[${this.id}] Agent destroyed`);
  }

  // Get performance metrics
  getMetrics() {
    return {
      messagesSent: this.memory.filter((m) => m.event.type === EventTypes.AGENT_MESSAGE).length,
      hintsGiven: this.memory.filter((m) => m.event.type === EventTypes.AGENT_HINT).length,
      questionsAsked: this.memory.filter((m) => m.event.type === EventTypes.AGENT_QUESTION).length,
      eventsProcessed: this.memory.length,
    };
  }
}

export default BaseAgent;
