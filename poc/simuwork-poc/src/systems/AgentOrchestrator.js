// AgentOrchestrator.js - Initializes and manages all agents in the simulation

import DirectorAgent from '../agents/DirectorAgent';
import SeniorDevAgent from '../agents/SeniorDevAgent';
import ProductManagerAgent from '../agents/ProductManagerAgent';
import JuniorDevAgent from '../agents/JuniorDevAgent';
import IncidentAgent from '../agents/IncidentAgent';
import { eventBus, EventTypes } from './EventBus';
import { worldState } from './WorldState';

class AgentOrchestrator {
  constructor() {
    this.agents = {};
    this.isRunning = false;
    this.initialized = false;
  }

  // Initialize all agents
  initialize() {
    if (this.initialized) {
      console.warn('[Orchestrator] Already initialized - skipping');
      return this.agents; // Return existing agents
    }

    console.log('[Orchestrator] Initializing agent system...');

    // Create all agents
    this.agents.director = new DirectorAgent();
    this.agents.senior_dev = new SeniorDevAgent();
    this.agents.pm = new ProductManagerAgent();
    this.agents.junior_dev = new JuniorDevAgent();
    this.agents.incident = new IncidentAgent();

    // Subscribe to world state changes
    worldState.subscribe((newState, updates) => {
      this.onStateChange(newState, updates);
    });

    this.initialized = true;
    this.isRunning = true;

    // Publish system ready event
    eventBus.publish(EventTypes.SYSTEM_READY, {
      agentCount: Object.keys(this.agents).length,
      timestamp: Date.now(),
    });

    console.log(`[Orchestrator] ${Object.keys(this.agents).length} agents initialized and running`);
  }

  // Handle state changes
  onStateChange(newState, updates) {
    // Agents will react via their event subscriptions
    // This is for orchestrator-level logging and coordination
    if (updates.scenario?.phase) {
      console.log(`[Orchestrator] Scenario phase: ${updates.scenario.phase}`);
    }
  }

  // Get specific agent
  getAgent(agentId) {
    return this.agents[agentId];
  }

  // Get all agents
  getAllAgents() {
    return { ...this.agents };
  }

  // Get agent metrics
  getMetrics() {
    const metrics = {};

    Object.entries(this.agents).forEach(([id, agent]) => {
      metrics[id] = agent.getMetrics();
    });

    return metrics;
  }

  // Pause all agents
  pause() {
    if (!this.isRunning) {
      return;
    }

    console.log('[Orchestrator] Pausing agents...');
    this.isRunning = false;

    Object.values(this.agents).forEach((agent) => {
      agent.isActive = false;
    });

    // Stop director tick
    if (this.agents.director) {
      this.agents.director.stopTick();
    }
  }

  // Resume all agents
  resume() {
    if (this.isRunning) {
      return;
    }

    console.log('[Orchestrator] Resuming agents...');
    this.isRunning = true;

    Object.values(this.agents).forEach((agent) => {
      agent.isActive = true;
    });

    // Restart director tick
    if (this.agents.director) {
      this.agents.director.startTick();
    }
  }

  // Reset simulation
  reset() {
    console.log('[Orchestrator] Resetting simulation...');

    // Pause first
    this.pause();

    // Reset world state
    worldState.reset();

    // Clear event history
    eventBus.clearHistory();

    // Destroy all agents
    Object.values(this.agents).forEach((agent) => {
      agent.destroy();
    });

    this.agents = {};
    this.initialized = false;
    this.isRunning = false;

    console.log('[Orchestrator] Reset complete');
  }

  // Restart simulation
  restart() {
    this.reset();
    this.initialize();
  }

  // Destroy orchestrator
  destroy() {
    console.log('[Orchestrator] Destroying orchestrator...');

    // Destroy all agents
    Object.values(this.agents).forEach((agent) => {
      agent.destroy();
    });

    this.agents = {};
    this.initialized = false;
    this.isRunning = false;
  }

  // Check if system is ready
  isReady() {
    return this.initialized && this.isRunning;
  }

  // Get system status
  getStatus() {
    return {
      initialized: this.initialized,
      running: this.isRunning,
      agentCount: Object.keys(this.agents).length,
      metrics: this.getMetrics(),
      worldState: worldState.getState(),
    };
  }

  // Manually trigger agent action (for testing)
  triggerAgent(agentId, action, payload = {}) {
    const agent = this.agents[agentId];

    if (!agent) {
      console.error(`[Orchestrator] Agent not found: ${agentId}`);
      return;
    }

    eventBus.publish('director_trigger_agent', {
      agentId,
      action,
      ...payload,
    });
  }

  // Get agent states from world
  getAgentStates() {
    return worldState.getState().agents;
  }
}

// Singleton instance
export const agentOrchestrator = new AgentOrchestrator();
export default AgentOrchestrator;
