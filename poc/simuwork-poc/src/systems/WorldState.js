// WorldState.js - Centralized state management for the living simulation

class WorldState {
  constructor() {
    this.state = {
      // User Profile
      user: {
        id: 'user_001',
        skillLevels: {
          debugging: 3,
          systemDesign: 2,
          testing: 3,
          communication: 4,
          problemSolving: 3,
        },
        reputation: 50,
        completedScenarios: [],
        currentObjectives: [],
        learningStyle: 'hands-on',
        actionsHistory: [],
      },

      // World State
      world: {
        currentTime: Date.now(),
        company: {
          name: 'PayFlow',
          techStack: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker'],
          culture: 'fast-paced startup',
          size: 'Series B, 50 engineers',
        },
        activeIncidents: [],
        techDebt: ['payment_validation', 'error_handling'],
        recentEvents: [],
        timeElapsed: 0,
      },

      // Scenario State
      scenario: {
        id: 'payment_validation_bug',
        type: 'debugging',
        difficulty: 3,
        phase: 'orientation', // orientation, investigation, resolution, aftermath
        objectives: [
          { id: 'obj_1', text: 'Investigate payment validation failures', completed: false },
          { id: 'obj_2', text: 'Fix the validation logic', completed: false },
          { id: 'obj_3', text: 'Verify fix with tests', completed: false },
        ],
        timeElapsed: 0,
        userActions: [],
        complications: [],
        codebase: {
          currentFile: 'payments/utils.py',
          hasChanges: false,
          testsPass: false,
        },
      },

      // Agent States
      agents: {
        senior_dev: {
          mood: 'neutral',
          currentFocus: 'code_review',
          memory: [],
          relationshipWithUser: 60,
          availability: 0.8,
        },
        pm: {
          mood: 'concerned',
          currentFocus: 'incident_tracking',
          memory: [],
          relationshipWithUser: 50,
          stressLevel: 60,
        },
        junior_dev: {
          mood: 'eager',
          currentFocus: 'learning',
          memory: [],
          relationshipWithUser: 70,
          needsHelp: false,
        },
        incident: {
          severity: 'P2',
          affectedUsers: 127,
          escalating: false,
        },
      },

      // UI State
      ui: {
        messages: [],
        notifications: [],
        codeEditorContent: '',
        terminalOutput: '',
        activePanel: 'code',
      },
    };

    this.listeners = [];
    this.history = [];
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Update state and notify listeners
  updateState(updates, source = 'system') {
    const previousState = { ...this.state };

    // Deep merge updates
    this.state = this.deepMerge(this.state, updates);

    // Record history
    this.history.push({
      timestamp: Date.now(),
      source,
      updates,
      previousState,
    });

    // Notify all listeners
    this.notifyListeners(this.state, updates);

    return this.state;
  }

  // Deep merge helper
  deepMerge(target, source) {
    const output = { ...target };
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Add state change listener
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners of state change
  notifyListeners(newState, updates) {
    this.listeners.forEach((listener) => {
      listener(newState, updates);
    });
  }

  // Get state slice
  getSlice(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  // Add user action to history
  recordUserAction(action) {
    this.updateState({
      user: {
        actionsHistory: [...this.state.user.actionsHistory, {
          timestamp: Date.now(),
          ...action,
        }],
      },
      scenario: {
        userActions: [...this.state.scenario.userActions, action],
      },
    }, 'user_action');
  }

  // Add message to UI
  addMessage(message) {
    const currentMessages = this.state.ui.messages || [];
    const newMessages = [...currentMessages, {
      id: `msg_${Date.now()}`,
      timestamp: Date.now(),
      ...message,
    }];

    // Limit to last 50 messages to prevent infinite growth
    const limitedMessages = newMessages.slice(-50);

    this.updateState({
      ui: {
        messages: limitedMessages,
      },
    }, 'message');
  }

  // Update scenario phase
  setScenarioPhase(phase) {
    this.updateState({
      scenario: { phase },
      world: { recentEvents: [...this.state.world.recentEvents, `Phase changed to ${phase}`] },
    }, 'scenario');
  }

  // Complete objective
  completeObjective(objectiveId) {
    const objectives = this.state.scenario.objectives.map((obj) =>
      obj.id === objectiveId ? { ...obj, completed: true } : obj
    );

    this.updateState({
      scenario: { objectives },
    }, 'objective_complete');
  }

  // Update agent state
  updateAgent(agentId, updates) {
    this.updateState({
      agents: {
        [agentId]: {
          ...this.state.agents[agentId],
          ...updates,
        },
      },
    }, `agent_${agentId}`);
  }

  // Get time elapsed in scenario
  getTimeElapsed() {
    return this.state.scenario.timeElapsed;
  }

  // Increment time
  incrementTime(seconds) {
    this.updateState({
      scenario: {
        timeElapsed: this.state.scenario.timeElapsed + seconds,
      },
      world: {
        currentTime: this.state.world.currentTime + (seconds * 1000),
      },
    }, 'time_tick');
  }

  // Check if all objectives are complete
  areObjectivesComplete() {
    return this.state.scenario.objectives.every((obj) => obj.completed);
  }

  // Get user skill level
  getUserSkill(skillName) {
    return this.state.user.skillLevels[skillName] || 0;
  }

  // Update user skill
  updateUserSkill(skillName, delta) {
    const currentLevel = this.getUserSkill(skillName);
    const newLevel = Math.max(1, Math.min(10, currentLevel + delta));

    this.updateState({
      user: {
        skillLevels: {
          ...this.state.user.skillLevels,
          [skillName]: newLevel,
        },
      },
    }, 'skill_update');
  }

  // Reset for new scenario
  reset() {
    const userId = this.state.user.id;
    const userSkills = this.state.user.skillLevels;
    const userReputation = this.state.user.reputation;

    this.state = new WorldState().state;
    this.state.user.id = userId;
    this.state.user.skillLevels = userSkills;
    this.state.user.reputation = userReputation;

    this.notifyListeners(this.state, { type: 'reset' });
  }
}

// Singleton instance
export const worldState = new WorldState();
export default WorldState;
