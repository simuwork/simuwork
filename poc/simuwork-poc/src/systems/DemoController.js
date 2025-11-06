// DemoController.js - Orchestrates the scripted demo playback

import { demoScript } from './DemoScript';
import { worldState } from './WorldState';
import { eventBus, EventTypes } from './EventBus';
import { guideController } from './GuideController';

class DemoController {
  constructor() {
    this.isPlaying = false;
    this.currentIndex = 0;
    this.startTime = null;
    this.timers = [];
    this.typingTimer = null;
  }

  // Start the demo
  start() {
    if (this.isPlaying) {
      return;
    }

    console.log('[DemoController] Starting choreographed demo...');
    this.isPlaying = true;
    this.currentIndex = 0;
    this.startTime = Date.now();

    // Schedule all script actions
    this.scheduleActions();
  }

  // Schedule all actions based on script timing
  scheduleActions() {
    demoScript.forEach((action, index) => {
      const delay = action.time * 1000; // Convert to milliseconds

      const timer = setTimeout(() => {
        this.executeAction(action, index);
      }, delay);

      this.timers.push(timer);
    });
  }

  // Execute a single script action
  executeAction(action, index) {
    console.log(`[DemoController] Executing action ${index}:`, action.type);
    this.currentIndex = index;

    switch (action.type) {
      case 'show_narration':
        this.showNarration(action.narration);
        break;

      case 'user_message':
        this.showTypingMessage(action.content, action.typingDuration || 2000);
        break;

      case 'agent_message':
        this.triggerAgentMessage(action);
        break;

      case 'code_change':
        this.applyCodeChange(action.code);
        break;

      case 'run_tests':
        this.runTests();
        break;

      case 'user_decision_auto':
        this.makeDecision(action.decisionId, action.choice);
        break;

      case 'scenario_complete':
        this.completeScenario();
        break;

      default:
        console.warn('[DemoController] Unknown action type:', action.type);
    }
  }

  // Show narration tooltip
  showNarration(narration) {
    guideController.showNarration(narration);
  }

  // Show typing animation then user message
  showTypingMessage(content, duration) {
    // Show typing indicator
    worldState.updateState({
      ui: {
        userTyping: true,
      },
    });

    // Simulate typing with character-by-character reveal
    let currentText = '';
    const chars = content.split('');
    const charDelay = duration / chars.length;

    chars.forEach((char, i) => {
      setTimeout(() => {
        currentText += char;
        worldState.updateState({
          ui: {
            typingPreview: currentText,
          },
        });
      }, charDelay * i);
    });

    // After typing complete, send message
    setTimeout(() => {
      worldState.updateState({
        ui: {
          userTyping: false,
          typingPreview: '',
        },
      });

      worldState.addMessage({
        agentId: 'user',
        agentRole: 'You',
        content,
        type: 'user_message',
      });

      // Publish question event if it's a question
      if (content.includes('?')) {
        eventBus.publish(EventTypes.USER_ASK_QUESTION, {
          question: content,
          timestamp: Date.now(),
        }, 'user');
      }

      worldState.recordUserAction({
        type: 'user_message',
        content,
      });
    }, duration);
  }

  // Trigger agent to send message
  triggerAgentMessage(action) {
    if (action.trigger) {
      // Trigger via event system
      eventBus.publish('director_trigger_agent', {
        agentId: action.agentId,
        action: action.trigger,
      });
    } else if (action.message) {
      // Direct message
      worldState.addMessage({
        agentId: action.agentId,
        agentRole: this.getAgentRole(action.agentId),
        content: action.message,
        type: 'response',
      });
    }
  }

  // Apply code changes to editor
  applyCodeChange(code) {
    worldState.updateState({
      ui: {
        codeEditorContent: code,
      },
      scenario: {
        codebase: {
          currentFile: 'payments/utils.py',
          hasChanges: true,
        },
      },
    });

    // Publish code change event
    eventBus.publish(EventTypes.USER_CODE_CHANGE, {
      code,
      hasChanges: true,
      timestamp: Date.now(),
    }, 'user');

    worldState.recordUserAction({
      type: 'code_change',
      code,
    });
  }

  // Run tests
  runTests() {
    eventBus.publish(EventTypes.USER_RUN_TESTS, {
      code: worldState.getState().ui.codeEditorContent,
      timestamp: Date.now(),
    }, 'user');

    worldState.recordUserAction({
      type: 'run_tests',
    });
  }

  // Make automated decision
  makeDecision(decisionId, choice) {
    eventBus.publish(EventTypes.USER_DECISION, {
      decisionId,
      decision: choice,
      timestamp: Date.now(),
    }, 'user');

    worldState.recordUserAction({
      type: 'decision',
      decisionId,
      choice,
    });
  }

  // Complete scenario
  completeScenario() {
    eventBus.publish(EventTypes.SCENARIO_COMPLETE, {
      timeElapsed: worldState.getState().scenario.timeElapsed,
      objectivesComplete: worldState.areObjectivesComplete(),
    });
  }

  // Get agent role name
  getAgentRole(agentId) {
    const roles = {
      senior_dev: 'Senior Engineer',
      pm: 'Product Manager',
      junior_dev: 'Junior Developer',
      incident: 'Incident System',
    };
    return roles[agentId] || 'System';
  }

  // Pause demo
  pause() {
    if (!this.isPlaying) {
      return;
    }

    console.log('[DemoController] Pausing demo...');
    this.isPlaying = false;

    // Clear all timers
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers = [];

    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  // Resume demo
  resume() {
    if (this.isPlaying) {
      return;
    }

    console.log('[DemoController] Resuming demo...');
    this.isPlaying = true;

    // Calculate elapsed time and reschedule remaining actions
    const elapsed = (Date.now() - this.startTime) / 1000;

    demoScript.slice(this.currentIndex + 1).forEach((action) => {
      const delay = (action.time - elapsed) * 1000;

      if (delay > 0) {
        const timer = setTimeout(() => {
          this.executeAction(action, demoScript.indexOf(action));
        }, delay);

        this.timers.push(timer);
      }
    });
  }

  // Stop and reset demo
  stop() {
    console.log('[DemoController] Stopping demo...');
    this.pause();
    this.currentIndex = 0;
    this.startTime = null;
  }

  // Get current progress
  getProgress() {
    return {
      currentIndex: this.currentIndex,
      totalSteps: demoScript.length,
      progress: (this.currentIndex / demoScript.length) * 100,
    };
  }
}

// Singleton instance
export const demoController = new DemoController();
export default DemoController;
