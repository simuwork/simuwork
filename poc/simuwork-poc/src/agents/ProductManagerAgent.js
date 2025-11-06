// ProductManagerAgent.js - Business-focused PM providing context and gentle pressure

import BaseAgent from './BaseAgent';
import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class ProductManagerAgent extends BaseAgent {
  constructor() {
    super('pm', {
      role: 'Product Manager',
      personality: {
        style: 'business_focused',
        traits: ['organized', 'deadline_conscious', 'empathetic'],
      },
      responseDelay: 1500,
      proactivityChance: 0.15, // Less frequent check-ins
    });

    this.checkInCount = 0;
    this.lastCheckIn = null;
  }

  initialize() {
    super.initialize();

    // Subscribe to events
    this.subscribeToEvents([
      EventTypes.SCENARIO_PHASE_CHANGE,
      EventTypes.INCIDENT_ESCALATED,
      EventTypes.TESTS_PASSED,
      EventTypes.SCENARIO_OBJECTIVE_COMPLETE,
      'director_trigger_agent',
      'scenario_time_pressure',
    ]);

    // Check in periodically
    this.scheduleCheckIns();
  }

  scheduleCheckIns() {
    // Check in every 2 minutes (less spam)
    this.checkInInterval = setInterval(() => {
      this.periodicCheckIn();
    }, 120000);
  }

  periodicCheckIn() {
    const state = this.observeState();
    const phase = state.scenario.phase;
    const timeElapsed = state.scenario.timeElapsed;

    // Only check in during active phases
    if (phase !== 'investigation' && phase !== 'resolution') {
      return;
    }

    // Don't spam check-ins
    if (this.lastCheckIn && Date.now() - this.lastCheckIn < 45000) {
      return;
    }

    const messages = [
      "Hey, just checking in - how's the debugging going? Any ETA on the fix?",
      "Quick update: we're seeing more reports coming in. Any progress on your end?",
      "Do you need any help or context? I can pull in additional resources if needed.",
      "Just want to keep you in the loop - the support team is fielding questions about this. No pressure, but keeping them updated helps.",
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    this.sendMessage(message, { type: 'check_in' });
    this.lastCheckIn = Date.now();
    this.checkInCount++;

    // Update stress level
    this.updateAgentState({
      stressLevel: Math.min(100, this.getAgentState().stressLevel + 5),
    });
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

      case EventTypes.INCIDENT_ESCALATED:
        this.onIncidentEscalation(event.payload);
        break;

      case EventTypes.TESTS_PASSED:
        this.onTestsPassed();
        break;

      case EventTypes.SCENARIO_OBJECTIVE_COMPLETE:
        this.onObjectiveComplete(event.payload);
        break;

      case 'scenario_time_pressure':
        this.applyPressure();
        break;
    }
  }

  handleDirectorTrigger(payload) {
    switch (payload.action) {
      case 'check_progress':
        this.checkProgress();
        break;

      case 'acknowledge_completion':
        this.acknowledgeCompletion();
        break;

      case 'provide_context':
        this.provideBusinessContext();
        break;
    }
  }

  onPhaseChange(payload) {
    const { from, to } = payload;

    if (to === 'investigation') {
      this.sendMessage(
        "Hey team! We've got reports of payment failures for $0 authorizations. This is impacting about 127 users right now. Not critical yet, but we should get this fixed soon. I'm flagging this as P2 priority.",
        { type: 'incident_notification', priority: 'P2' }
      );

      this.updateAgentState({
        mood: 'concerned',
        stressLevel: 40,
      });
    } else if (to === 'resolution') {
      this.sendMessage(
        "Saw you're running tests - great! Let me know when you have a fix validated and I'll coordinate with the deployment team.",
        { type: 'coordination' }
      );
    } else if (to === 'aftermath') {
      // Handled in acknowledgeCompletion
    }
  }

  onIncidentEscalation(payload) {
    const { oldSeverity, newSeverity } = payload;

    this.sendMessage(
      `Heads up - this just got escalated to ${newSeverity}. Affected users doubled. I'm not trying to stress you out, but leadership is asking questions. What's your current status?`,
      { type: 'escalation', priority: newSeverity }
    );

    this.updateAgentState({
      mood: 'stressed',
      stressLevel: 85,
    });
  }

  onTestsPassed() {
    this.sendMessage(
      "Tests passing - excellent! That's what I like to see. Can you walk me through the fix? I need to update the incident report.",
      { type: 'approval', sentiment: 'positive' }
    );

    this.updateAgentState({
      mood: 'relieved',
      stressLevel: Math.max(20, this.getAgentState().stressLevel - 30),
    });
  }

  onObjectiveComplete(payload) {
    const state = this.observeState();

    if (state.scenario.objectives.every((obj) => obj.completed)) {
      // All objectives done
      this.sendMessage(
        "Perfect timing! I'll notify the team that the fix is ready. Really appreciate you handling this quickly and thoroughly.",
        { type: 'completion', sentiment: 'grateful' }
      );
    }
  }

  checkProgress() {
    const state = this.observeState();
    const timeElapsed = state.scenario.timeElapsed;

    if (timeElapsed < 120) {
      this.sendMessage(
        "No rush, but wanted to check - have you identified the root cause yet? Understanding the 'why' helps us prevent similar issues.",
        { type: 'progress_check', tone: 'curious' }
      );
    } else {
      this.sendMessage(
        "Hey, just want to make sure you're not stuck. Do you need me to pull in someone else to pair with you on this?",
        { type: 'progress_check', tone: 'concerned' }
      );
    }
  }

  acknowledgeCompletion() {
    const state = this.observeState();
    const timeElapsed = state.scenario.timeElapsed;

    const timeInMinutes = Math.floor(timeElapsed / 60);

    if (timeInMinutes < 5) {
      this.sendMessage(
        `Wow, ${timeInMinutes} minutes - that's impressive turnaround! Thanks for jumping on this so quickly. I'm updating the incident status to resolved.`,
        { type: 'completion', sentiment: 'impressed' }
      );
    } else if (timeInMinutes < 10) {
      this.sendMessage(
        `Great work getting this resolved in ${timeInMinutes} minutes. The fix looks solid and tests are passing. Marking as complete!`,
        { type: 'completion', sentiment: 'satisfied' }
      );
    } else {
      this.sendMessage(
        `Thanks for staying with this and getting it right. ${timeInMinutes} minutes is totally reasonable for thorough debugging. Issue resolved!`,
        { type: 'completion', sentiment: 'grateful' }
      );
    }

    // Update relationship based on performance
    const relationshipChange = timeInMinutes < 5 ? 20 : timeInMinutes < 10 ? 15 : 10;

    this.updateAgentState({
      relationshipWithUser: Math.min(100, this.getAgentState().relationshipWithUser + relationshipChange),
      mood: 'pleased',
      stressLevel: 10,
    });
  }

  provideBusinessContext() {
    this.sendMessage(
      "For context: these $0 auth checks are used by our fraud detection system to validate card details before actual charges. So when they fail, it blocks legitimate users from adding payment methods. That's why this is higher priority than you might initially think.",
      { type: 'context', category: 'business_logic' }
    );
  }

  applyPressure() {
    const state = this.observeState();
    const stressLevel = this.getAgentState().stressLevel;

    if (stressLevel < 70) {
      this.sendMessage(
        "The support team is getting more tickets about this. Not panicking yet, but wanted you to be aware of the growing impact.",
        { type: 'pressure', intensity: 'low' }
      );
    } else {
      this.sendMessage(
        "I hate to be that PM, but I'm getting pulled into meetings about this. Any update I can share?",
        { type: 'pressure', intensity: 'medium' }
      );
    }

    this.updateAgentState({
      stressLevel: Math.min(100, stressLevel + 10),
    });
  }

  destroy() {
    if (this.checkInInterval) {
      clearInterval(this.checkInInterval);
    }
    super.destroy();
  }

  getMetrics() {
    return {
      ...super.getMetrics(),
      checkInCount: this.checkInCount,
    };
  }
}

export default ProductManagerAgent;
