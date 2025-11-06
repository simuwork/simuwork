// SeniorDevAgent.js - Technical mentor providing code guidance and reviews

import BaseAgent from './BaseAgent';
import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class SeniorDevAgent extends BaseAgent {
  constructor() {
    super('senior_dev', {
      role: 'Senior Engineer',
      personality: {
        style: 'socratic',
        traits: ['patient', 'thorough', 'occasionally_cryptic'],
      },
      responseDelay: 2000, // Takes time to think
      proactivityChance: 0.1, // Less reactive to every change
    });

    this.codeReviewCount = 0;
    this.hintsGiven = 0;
  }

  initialize() {
    super.initialize();

    // Subscribe to relevant events
    this.subscribeToEvents([
      EventTypes.USER_CODE_CHANGE,
      EventTypes.USER_ASK_QUESTION,
      EventTypes.TESTS_FAILED,
      EventTypes.SCENARIO_PHASE_CHANGE,
      'director_trigger_agent',
      'scenario_time_pressure',
    ]);
  }

  shouldReact(event) {
    if (!super.shouldReact(event)) {
      return false;
    }

    // Only react if triggered by director or specific user actions
    if (event.type === 'director_trigger_agent') {
      return event.payload.agentId === this.id;
    }

    // React to code changes randomly (simulate reviewing periodically)
    if (event.type === EventTypes.USER_CODE_CHANGE) {
      return this.shouldActProactively();
    }

    return true;
  }

  handleEvent(event) {
    super.handleEvent(event);

    switch (event.type) {
      case 'director_trigger_agent':
        this.handleDirectorTrigger(event.payload);
        break;

      case EventTypes.USER_CODE_CHANGE:
        this.onCodeChange(event.payload);
        break;

      case EventTypes.USER_ASK_QUESTION:
        this.onUserQuestion(event.payload);
        break;

      case EventTypes.TESTS_FAILED:
        this.onTestsFailed(event.payload);
        break;

      case EventTypes.SCENARIO_PHASE_CHANGE:
        this.onPhaseChange(event.payload);
        break;

      case 'scenario_time_pressure':
        this.onTimePressure();
        break;
    }
  }

  handleDirectorTrigger(payload) {
    switch (payload.action) {
      case 'initial_guidance':
        this.provideInitialGuidance();
        break;

      case 'review_code':
        this.reviewCode(payload.code);
        break;

      case 'provide_hint':
        this.provideContextualHint(payload.context);
        break;

      case 'answer_question':
        this.answerQuestion(payload.question);
        break;

      case 'final_review':
        this.provideFinalReview();
        break;
    }
  }

  provideInitialGuidance() {
    const state = this.observeState();
    const phase = state.scenario.phase;

    if (phase === 'investigation') {
      this.sendMessage(
        "Alright, let's tackle this payment validation bug. I took a quick look earlier - the issue seems to be in the validation logic. Start by examining the process_payment function in payments/utils.py. What do you think might be allowing zero-dollar amounts through?",
        { type: 'guidance', priority: 'high' }
      );
    }
  }

  onCodeChange(payload) {
    const { code, hasError } = payload;

    // Analyze code quality
    const issues = this.analyzeCode(code);

    if (issues.critical.length > 0) {
      // Critical issue found
      this.sendMessage(
        `Hold on - I see a potential issue with your changes. ${issues.critical[0].message} This could cause problems in production.`,
        { type: 'warning', severity: 'high' }
      );
    } else if (issues.suggestions.length > 0 && this.shouldActProactively()) {
      // Gentle suggestion
      const suggestion = issues.suggestions[0];
      this.sendMessage(
        `Nice approach! One thought: ${suggestion.message} Not critical, but worth considering.`,
        { type: 'suggestion', severity: 'low' }
      );
    }

    this.codeReviewCount++;
  }

  analyzeCode(code) {
    // Simple static analysis (would be more sophisticated with real LLM)
    const issues = {
      critical: [],
      warnings: [],
      suggestions: [],
    };

    if (code.includes('amount > 0') && !code.includes('amount <= 0')) {
      issues.critical.push({
        message: "Your condition checks for > 0, but what about exactly zero? That's the bug we're fixing!",
        line: code.split('\n').findIndex(l => l.includes('amount > 0')),
      });
    }

    if (!code.includes('raise') && code.includes('if')) {
      issues.suggestions.push({
        message: 'Consider raising an exception for invalid inputs rather than silently returning. Makes debugging easier.',
      });
    }

    if (!code.includes('ValueError') && code.includes('raise')) {
      issues.suggestions.push({
        message: 'You might want to use a custom exception class like PaymentValidationError for better error handling.',
      });
    }

    if (code.length > 500 && !code.includes('"""')) {
      issues.warnings.push({
        message: 'This function is getting long. Consider adding docstrings or breaking it down.',
      });
    }

    return issues;
  }

  onUserQuestion(payload) {
    const { question } = payload;

    // Analyze question type
    const questionLower = question.toLowerCase();

    if (questionLower.includes('zero') || questionLower.includes('0')) {
      this.answerQuestion("Good question about zero-dollar amounts. Think about it from the business logic perspective - should we ever authorize a payment for $0? Check what the payment gateway expects. Sometimes the bug is in the edge case you don't initially consider.");
    } else if (questionLower.includes('test')) {
      this.answerQuestion("For testing this, you'll want to cover at least three cases: positive amounts (should pass), zero (should fail), and negative amounts (should also fail). The test suite is in tests/payments/test_process_payment.py.");
    } else if (questionLower.includes('how')) {
      this.answerQuestion("Rather than giving you the answer directly, let me ask: what have you tried so far? Walking through your debugging process helps me understand where you might be stuck.");
    } else {
      this.answerQuestion("That's a good thing to investigate. Check the relevant files and see what patterns you notice. I'm here if you need another perspective.");
    }
  }

  answerQuestion(answer) {
    this.sendMessage(answer, { type: 'answer' });
  }

  onTestsFailed(payload) {
    const { failedTests } = payload;
    const state = this.observeState();

    // Check how many times tests have failed
    const recentFailures = this.recall(
      (m) => m.event.type === EventTypes.TESTS_FAILED
    ).length;

    if (recentFailures === 1) {
      this.sendMessage(
        "Tests are failing - that's okay, it's part of the process. Take a look at the specific test output. What's it expecting vs what your code is returning?",
        { type: 'encouragement' }
      );
    } else if (recentFailures === 2) {
      this.giveHint(
        "The issue is in your conditional logic. Remember, we need to reject BOTH zero and negative amounts. Check your comparison operator.",
        'warning'
      );
      this.hintsGiven++;
    } else if (recentFailures >= 3) {
      this.sendMessage(
        "Let me be more direct: change `if amount > 0:` to `if amount <= 0:` and raise an error. That's the core fix. The logic should be 'if amount is NOT positive, raise an error'.",
        { type: 'direct_hint', priority: 'high' }
      );
      this.hintsGiven++;
    }
  }

  onPhaseChange(payload) {
    const { to } = payload;

    if (to === 'resolution') {
      this.sendMessage(
        "Good, you're making progress. Now let's make sure your fix actually works. Run the test suite to validate your changes.",
        { type: 'transition' }
      );
    }
  }

  onTimePressure() {
    const state = this.observeState();
    const pmStress = state.agents.pm.stressLevel;

    if (pmStress > 70) {
      this.sendMessage(
        "I know Sarah (PM) is getting anxious, but take your time to get it right. A rushed fix that breaks something else is worse than taking an extra few minutes.",
        { type: 'support' }
      );
    }
  }

  provideContextualHint(context) {
    const hints = {
      repeated_test_failures: "Remember: the condition should catch invalid amounts (zero or negative). Try inverting your logic - what makes an amount invalid rather than valid?",
      stuck_debugging: "Let's break this down: 1) What values should be valid? 2) What values should be invalid? 3) How do you check for invalid values? Start from first principles.",
      wrong_approach: "I see what you're trying to do, but think about where the validation should happen. We want to catch the error before it reaches the gateway.",
    };

    const hint = hints[context] || "Take a step back and think about the problem from a different angle.";
    this.giveHint(hint, 'info');
    this.hintsGiven++;
  }

  provideFinalReview() {
    const state = this.observeState();
    const allPassed = state.scenario.codebase.testsPass;

    if (allPassed) {
      this.sendMessage(
        "Nice work! Your fix correctly handles the edge case. The key lesson here: always consider boundary conditions - zero, negative, null, etc. These edge cases are where most bugs hide. I'll approve your PR.",
        { type: 'approval', sentiment: 'positive' }
      );

      // Update relationship
      this.updateAgentState({
        relationshipWithUser: Math.min(100, this.getAgentState().relationshipWithUser + 15),
        mood: 'pleased',
      });
    } else {
      this.sendMessage(
        "We're close, but tests are still failing. Double-check your logic one more time. The fix is simpler than you might think.",
        { type: 'review', sentiment: 'encouraging' }
      );
    }
  }

  getMetrics() {
    return {
      ...super.getMetrics(),
      codeReviewCount: this.codeReviewCount,
      hintsGiven: this.hintsGiven,
    };
  }
}

export default SeniorDevAgent;
