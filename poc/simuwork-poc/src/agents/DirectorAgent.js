// DirectorAgent.js - Master orchestrator that coordinates all agents and scenario flow

import BaseAgent from './BaseAgent';
import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class DirectorAgent extends BaseAgent {
  constructor() {
    super('director', {
      role: 'Orchestrator',
      responseDelay: 500,
      proactivityChance: 0.1, // Much less proactive
    });

    this.tickInterval = null;
    this.tickRate = 15000; // Check state every 15 seconds (slower)
    this.complications = [];
    this.lastTickTime = 0;
  }

  initialize() {
    super.initialize();

    // Subscribe to all events for orchestration
    this.subscribeToEvents([
      EventTypes.USER_CODE_CHANGE,
      EventTypes.USER_RUN_TESTS,
      EventTypes.USER_ASK_QUESTION,
      EventTypes.TESTS_PASSED,
      EventTypes.TESTS_FAILED,
      EventTypes.SCENARIO_OBJECTIVE_COMPLETE,
      EventTypes.USER_DECISION,
    ]);

    // Start the simulation tick
    this.startTick();
  }

  // Start simulation tick
  startTick() {
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickRate);
  }

  // Main orchestration loop
  tick() {
    const state = this.observeState();
    const now = Date.now();

    // Throttle ticks - don't run too frequently
    if (now - this.lastTickTime < this.tickRate) {
      return;
    }
    this.lastTickTime = now;

    // Increment time
    worldState.incrementTime(15);

    // Evaluate current scenario state
    this.evaluateProgress(state);

    // Check if should trigger events
    this.checkForEvents(state);

    // Update agent states based on context
    this.updateAgentStates(state);

    // Publish tick event
    eventBus.publish(EventTypes.TIME_TICK, {
      timeElapsed: state.scenario.timeElapsed,
    }, this.id);
  }

  // Evaluate user progress
  evaluateProgress(state) {
    const { scenario, user } = state;

    // Check if objectives are complete
    if (worldState.areObjectivesComplete() && scenario.phase !== 'aftermath') {
      this.transitionToPhase('aftermath');
    }

    // Check for stuck users
    const lastAction = user.actionsHistory[user.actionsHistory.length - 1];
    if (lastAction && Date.now() - lastAction.timestamp > 60000) {
      // No action in 60 seconds
      this.triggerEvent('user_inactive', { duration: 60 });
    }

    // Check difficulty level
    if (user.actionsHistory.length > 10) {
      const recentMistakes = user.actionsHistory.slice(-10).filter(a => a.result === 'error');
      if (recentMistakes.length > 7) {
        // User struggling - ease up
        this.adjustDifficulty('easier');
      }
    }
  }

  // Check for triggering new events
  checkForEvents(state) {
    const { scenario, agents } = state;

    // Phase-specific events
    switch (scenario.phase) {
      case 'orientation':
        if (scenario.timeElapsed > 30) {
          this.transitionToPhase('investigation');
        }
        break;

      case 'investigation':
        // Trigger complication if user taking too long
        if (scenario.timeElapsed > 120 && !this.complications.includes('time_pressure')) {
          this.triggerComplication('time_pressure');
        }

        // Maybe introduce teammate request
        if (scenario.timeElapsed > 90 && this.shouldTriggerEvent(0.3)) {
          this.triggerComplication('teammate_help_request');
        }
        break;

      case 'resolution':
        // Check if tests are passing
        if (scenario.codebase.testsPass) {
          worldState.completeObjective('obj_3');
        }
        break;

      case 'aftermath':
        // Wrap up scenario
        if (scenario.timeElapsed > 300) {
          this.completeScenario();
        }
        break;
    }

    // Random proactive events
    if (this.shouldActProactively() && this.shouldTriggerEvent(0.2)) {
      this.triggerRandomEvent(state);
    }
  }

  // Trigger complication
  triggerComplication(complicationType) {
    if (this.complications.includes(complicationType)) {
      return; // Already triggered
    }

    this.complications.push(complicationType);

    eventBus.publish(EventTypes.SCENARIO_COMPLICATION, {
      type: complicationType,
      timestamp: Date.now(),
    }, this.id);

    console.log(`[Director] Triggered complication: ${complicationType}`);
  }

  // Trigger random event based on context
  triggerRandomEvent(state) {
    const events = [
      'incident_escalation',
      'stakeholder_question',
      'teammate_suggestion',
      'system_slowdown',
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    this.triggerEvent(event, {});
  }

  // Generic event trigger
  triggerEvent(eventName, data) {
    eventBus.publish(`scenario_${eventName}`, data, this.id);
  }

  // Transition to new scenario phase
  transitionToPhase(newPhase) {
    const currentPhase = worldState.getState().scenario.phase;

    if (currentPhase === newPhase) {
      return;
    }

    console.log(`[Director] Transitioning from ${currentPhase} to ${newPhase}`);

    worldState.setScenarioPhase(newPhase);

    eventBus.publish(EventTypes.SCENARIO_PHASE_CHANGE, {
      from: currentPhase,
      to: newPhase,
    }, this.id);

    // Trigger phase-specific actions
    this.onPhaseTransition(newPhase);
  }

  // Handle phase transitions
  onPhaseTransition(phase) {
    switch (phase) {
      case 'investigation':
        // Senior dev gives initial guidance
        eventBus.publish('director_trigger_agent', {
          agentId: 'senior_dev',
          action: 'initial_guidance',
        }, this.id);
        break;

      case 'resolution':
        // PM checks in on progress
        eventBus.publish('director_trigger_agent', {
          agentId: 'pm',
          action: 'check_progress',
        }, this.id);
        break;

      case 'aftermath':
        // All agents provide wrap-up
        eventBus.publish('director_trigger_agent', {
          agentId: 'senior_dev',
          action: 'final_review',
        }, this.id);
        eventBus.publish('director_trigger_agent', {
          agentId: 'pm',
          action: 'acknowledge_completion',
        }, this.id);
        break;
    }
  }

  // Update agent states based on scenario
  updateAgentStates(state) {
    const { scenario, agents } = state;

    // PM stress increases if incident unresolved
    if (scenario.phase === 'investigation' && scenario.timeElapsed > 120) {
      worldState.updateAgent('pm', {
        stressLevel: Math.min(100, agents.pm.stressLevel + 1),
        mood: agents.pm.stressLevel > 80 ? 'stressed' : 'concerned',
      });
    }

    // Senior dev becomes more available if user struggling
    const recentErrors = state.user.actionsHistory.slice(-5).filter(a => a.result === 'error');
    if (recentErrors.length > 3) {
      worldState.updateAgent('senior_dev', {
        availability: Math.min(1.0, agents.senior_dev.availability + 0.1),
        mood: 'supportive',
      });
    }

    // Incident severity escalates
    if (scenario.timeElapsed > 180 && !agents.incident.escalating) {
      worldState.updateAgent('incident', {
        escalating: true,
        severity: 'P1',
        affectedUsers: agents.incident.affectedUsers * 2,
      });

      // Trigger escalation event
      eventBus.publish(EventTypes.INCIDENT_ESCALATED, {
        oldSeverity: 'P2',
        newSeverity: 'P1',
      }, this.id);
    }
  }

  // Adjust scenario difficulty
  adjustDifficulty(direction) {
    const state = worldState.getState();
    const currentDifficulty = state.scenario.difficulty;

    let newDifficulty = currentDifficulty;
    if (direction === 'easier') {
      newDifficulty = Math.max(1, currentDifficulty - 1);
    } else if (direction === 'harder') {
      newDifficulty = Math.min(10, currentDifficulty + 1);
    }

    if (newDifficulty !== currentDifficulty) {
      worldState.updateState({
        scenario: { difficulty: newDifficulty },
      }, this.id);

      console.log(`[Director] Adjusted difficulty: ${currentDifficulty} -> ${newDifficulty}`);
    }
  }

  // Determine if event should trigger
  shouldTriggerEvent(probability) {
    return Math.random() < probability;
  }

  // Complete scenario
  completeScenario() {
    console.log('[Director] Scenario complete!');

    eventBus.publish(EventTypes.SCENARIO_COMPLETE, {
      timeElapsed: worldState.getState().scenario.timeElapsed,
      objectivesComplete: worldState.areObjectivesComplete(),
    }, this.id);

    // Stop tick
    this.stopTick();
  }

  // Handle user actions
  handleEvent(event) {
    super.handleEvent(event);

    switch (event.type) {
      case EventTypes.USER_CODE_CHANGE:
        this.onUserCodeChange(event.payload);
        break;

      case EventTypes.USER_RUN_TESTS:
        this.onUserRunTests(event.payload);
        break;

      case EventTypes.TESTS_PASSED:
        this.onTestsPassed(event.payload);
        break;

      case EventTypes.TESTS_FAILED:
        this.onTestsFailed(event.payload);
        break;

      case EventTypes.USER_ASK_QUESTION:
        this.onUserQuestion(event.payload);
        break;

      case EventTypes.USER_DECISION:
        this.onUserDecision(event.payload);
        break;
    }
  }

  onUserCodeChange(payload) {
    // Potentially trigger code review
    if (this.shouldTriggerEvent(0.3)) {
      eventBus.publish('director_trigger_agent', {
        agentId: 'senior_dev',
        action: 'review_code',
        code: payload.code,
      }, this.id);
    }
  }

  onUserRunTests() {
    // Transition to resolution phase if not already there
    const phase = worldState.getState().scenario.phase;
    if (phase === 'investigation') {
      this.transitionToPhase('resolution');
    }
  }

  onTestsPassed() {
    worldState.completeObjective('obj_3');

    // Update user skills
    worldState.updateUserSkill('debugging', 1);
    worldState.updateUserSkill('testing', 0.5);
  }

  onTestsFailed(payload) {
    // Maybe provide hint if user failing repeatedly
    const recentFailures = this.recall(
      (m) => m.event.type === EventTypes.TESTS_FAILED
    );

    if (recentFailures.length > 2) {
      eventBus.publish('director_trigger_agent', {
        agentId: 'senior_dev',
        action: 'provide_hint',
        context: 'repeated_test_failures',
      }, this.id);
    }
  }

  onUserQuestion(payload) {
    // Route question to appropriate agent
    const questionType = this.categorizeQuestion(payload.question);

    const agentMap = {
      technical: 'senior_dev',
      business: 'pm',
      process: 'senior_dev',
    };

    const targetAgent = agentMap[questionType] || 'senior_dev';

    eventBus.publish('director_trigger_agent', {
      agentId: targetAgent,
      action: 'answer_question',
      question: payload.question,
    }, this.id);
  }

  onUserDecision(payload) {
    // Record decision impact
    console.log(`[Director] User made decision: ${payload.decision}`);

    // Decisions can affect relationships
    if (payload.decision === 'help_teammate') {
      worldState.updateAgent('junior_dev', {
        relationshipWithUser: Math.min(100, worldState.getState().agents.junior_dev.relationshipWithUser + 10),
      });
    }
  }

  categorizeQuestion(question) {
    const questionLower = question.toLowerCase();

    if (questionLower.includes('why') || questionLower.includes('how') || questionLower.includes('code')) {
      return 'technical';
    }

    if (questionLower.includes('deadline') || questionLower.includes('priority') || questionLower.includes('impact')) {
      return 'business';
    }

    return 'technical';
  }

  // Stop tick
  stopTick() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // Cleanup
  destroy() {
    this.stopTick();
    super.destroy();
  }
}

export default DirectorAgent;
