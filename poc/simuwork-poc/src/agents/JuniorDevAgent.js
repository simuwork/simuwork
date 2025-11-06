// JuniorDevAgent.js - Eager junior developer who asks questions and creates mentorship opportunities

import BaseAgent from './BaseAgent';
import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class JuniorDevAgent extends BaseAgent {
  constructor() {
    super('junior_dev', {
      role: 'Junior Developer',
      personality: {
        style: 'friendly',
        traits: ['eager', 'curious', 'sometimes_confused'],
      },
      responseDelay: 1000,
      proactivityChance: 0.2,
    });

    this.askedForHelp = false;
    this.questionsAsked = 0;
  }

  initialize() {
    super.initialize();

    // Subscribe to events
    this.subscribeToEvents([
      EventTypes.SCENARIO_PHASE_CHANGE,
      EventTypes.USER_DECISION,
      EventTypes.TESTS_PASSED,
      'director_trigger_agent',
      'scenario_teammate_help_request',
    ]);
  }

  shouldReact(event) {
    if (!super.shouldReact(event)) {
      return false;
    }

    // React if specifically triggered
    if (event.type === 'director_trigger_agent') {
      return event.payload.agentId === this.id;
    }

    if (event.type === 'scenario_teammate_help_request') {
      return !this.askedForHelp; // Only ask once
    }

    return true;
  }

  handleEvent(event) {
    super.handleEvent(event);

    switch (event.type) {
      case 'director_trigger_agent':
        this.handleDirectorTrigger(event.payload);
        break;

      case EventTypes.SCENARIO_PHASE_CHANGE:
        this.onPhaseChange(event.payload);
        break;

      case EventTypes.USER_DECISION:
        this.onUserDecision(event.payload);
        break;

      case EventTypes.TESTS_PASSED:
        this.onTestsPassed();
        break;

      case 'scenario_teammate_help_request':
        this.requestHelp();
        break;
    }
  }

  handleDirectorTrigger(payload) {
    switch (payload.action) {
      case 'request_help':
        this.requestHelp();
        break;

      case 'thank_user':
        this.thankUser();
        break;

      case 'ask_question':
        this.askLearningQuestion(payload.context);
        break;
    }
  }

  onPhaseChange(payload) {
    const { to } = payload;

    if (to === 'investigation') {
      this.sendMessage(
        "Oh, I was just looking at that code yesterday! The validation logic seemed a bit odd to me but I wasn't sure. Let me know if you need a second pair of eyes!",
        { type: 'observation', helpfulness: 'low' }
      );

      this.updateAgentState({
        mood: 'interested',
      });
    }
  }

  requestHelp() {
    if (this.askedForHelp) {
      return; // Already asked
    }

    const state = this.observeState();
    const phase = state.scenario.phase;

    if (phase === 'investigation' && state.scenario.timeElapsed > 90) {
      this.sendMessage(
        "Hey! Sorry to bother you while you're debugging, but I'm seeing similar errors in the refund API - payment validation failures. Do you think these could be related? Should I file a separate ticket or wait for your fix?",
        { type: 'help_request', priority: 'medium', requiresDecision: true }
      );

      this.askedForHelp = true;
      this.questionsAsked++;

      this.updateAgentState({
        needsHelp: true,
        mood: 'uncertain',
      });

      // Trigger decision point for user
      this.createDecisionPoint();
    }
  }

  createDecisionPoint() {
    // This creates a decision point in the UI
    worldState.updateState({
      ui: {
        pendingDecision: {
          id: 'help_junior_dev',
          prompt: 'Alex (Junior Dev) is asking about related errors in the refund API. What do you do?',
          options: [
            {
              id: 'help_now',
              label: 'Help Alex investigate now',
              impact: 'Helps teammate, but may delay your current task',
            },
            {
              id: 'help_later',
              label: 'Ask Alex to hold off until you finish',
              impact: 'Stay focused on current task',
            },
            {
              id: 'explain_likely_related',
              label: 'Explain it\'s likely the same issue',
              impact: 'Share knowledge, Alex waits for your fix',
            },
          ],
        },
      },
    });
  }

  onUserDecision(payload) {
    const { decision, decisionId } = payload;

    if (decisionId !== 'help_junior_dev') {
      return;
    }

    switch (decision) {
      case 'help_now':
        this.sendMessage(
          "Oh awesome, thanks! Let me share my screen... yeah, see here? Same validation error. So should I wait for your fix or is this something different?",
          { type: 'response', sentiment: 'grateful' }
        );

        this.updateAgentState({
          relationshipWithUser: Math.min(100, this.getAgentState().relationshipWithUser + 20),
          mood: 'happy',
          needsHelp: false,
        });

        // User loses some time but gains communication skill
        worldState.updateUserSkill('communication', 1);

        setTimeout(() => {
          this.sendMessage(
            "Got it! That makes sense. I'll wait for your fix and test it against the refund API too. Thanks for explaining!",
            { type: 'understanding', sentiment: 'appreciative' }
          );
        }, 3000);
        break;

      case 'help_later':
        this.sendMessage(
          "Totally understand! I'll hold tight and check back with you once you've finished. Good luck with the fix!",
          { type: 'response', sentiment: 'understanding' }
        );

        this.updateAgentState({
          relationshipWithUser: Math.max(0, this.getAgentState().relationshipWithUser - 5),
          mood: 'patient',
          needsHelp: true,
        });
        break;

      case 'explain_likely_related':
        this.sendMessage(
          "Ohhh that makes sense! So if you fix the validation in process_payment, it should handle both cases. I'll wait for your fix and verify it works for refunds too. Thanks for the explanation!",
          { type: 'response', sentiment: 'enlightened' }
        );

        this.updateAgentState({
          relationshipWithUser: Math.min(100, this.getAgentState().relationshipWithUser + 15),
          mood: 'learning',
          needsHelp: false,
        });

        // User gains communication skill
        worldState.updateUserSkill('communication', 0.5);
        break;
    }

    // Clear the decision
    worldState.updateState({
      ui: {
        pendingDecision: null,
      },
    });
  }

  onTestsPassed() {
    if (this.askedForHelp) {
      setTimeout(() => {
        this.sendMessage(
          "Just tested your fix against the refund API - working perfectly! Thanks for explaining the connection earlier. Learned something new today!",
          { type: 'confirmation', sentiment: 'excited' }
        );

        this.updateAgentState({
          mood: 'accomplished',
        });
      }, 2000);
    } else {
      this.sendMessage(
        "Nice! Saw your tests pass. The fix looks clean!",
        { type: 'observation', sentiment: 'positive' }
      );
    }
  }

  thankUser() {
    this.sendMessage(
      "By the way, thanks for being patient with my questions earlier. I really appreciate having teammates who take time to explain things!",
      { type: 'gratitude', sentiment: 'warm' }
    );
  }

  askLearningQuestion(context) {
    const questions = {
      validation: "Quick question - why do we validate on the backend if we're also validating on the frontend? Is it just for security?",
      testing: "How do you decide what edge cases to test for? I always feel like I'm missing something.",
      exceptions: "When should we create custom exception classes vs just using ValueError? I've seen both in our codebase.",
    };

    const question = questions[context] || "Hey, got a minute for a quick question about the fix?";

    this.askQuestion(question);
    this.questionsAsked++;
  }

  getMetrics() {
    return {
      ...super.getMetrics(),
      questionsAsked: this.questionsAsked,
      askedForHelp: this.askedForHelp,
    };
  }
}

export default JuniorDevAgent;
