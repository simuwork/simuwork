// IncidentAgent.js - Manages production incident state and monitoring

import BaseAgent from './BaseAgent';
import { eventBus, EventTypes } from '../systems/EventBus';
import { worldState } from '../systems/WorldState';

class IncidentAgent extends BaseAgent {
  constructor() {
    super('incident', {
      role: 'Incident System',
      personality: {
        style: 'automated',
        traits: ['objective', 'data_driven'],
      },
      responseDelay: 500, // Fast automated responses
      proactivityChance: 0.2, // Reduced - only important alerts
    });

    this.alertsSent = 0;
    this.hasEscalated = false;
    this.initialAlertSent = false;
  }

  initialize() {
    super.initialize();

    // Subscribe to events
    this.subscribeToEvents([
      EventTypes.SCENARIO_PHASE_CHANGE,
      EventTypes.TESTS_PASSED,
      EventTypes.USER_DEPLOY,
      EventTypes.TIME_TICK,
      'director_trigger_agent',
    ]);

    // Send initial incident alert
    this.sendInitialAlert();
  }

  sendInitialAlert() {
    // Prevent duplicate initial alerts
    if (this.initialAlertSent) {
      return;
    }

    const state = this.observeState();
    const incidentState = state.agents.incident;

    this.sendMessage(
      `🚨 INCIDENT ALERT [${incidentState.severity}]\nService: Payments API\nIssue: Validation failures for $0 authorizations\nAffected Users: ${incidentState.affectedUsers}\nStatus: INVESTIGATING\nAssigned: You\n\nRecent Error Log:\n[2024-11-06 14:23:41] ERROR: PaymentValidationError: Amount validation failed\n[2024-11-06 14:23:45] ERROR: Gateway rejected $0.00 authorization\n[2024-11-06 14:24:12] ERROR: 127 failed transactions in last 5 minutes`,
      { type: 'alert', severity: incidentState.severity, category: 'incident' }
    );

    this.alertsSent++;
    this.initialAlertSent = true;
  }

  handleEvent(event) {
    super.handleEvent(event);

    switch (event.type) {
      case EventTypes.TIME_TICK:
        this.onTimeTick(event.payload);
        break;

      case EventTypes.TESTS_PASSED:
        this.onTestsPassed();
        break;

      case EventTypes.USER_DEPLOY:
        this.onDeploy();
        break;

      case EventTypes.SCENARIO_PHASE_CHANGE:
        this.onPhaseChange(event.payload);
        break;
    }
  }

  onTimeTick(payload) {
    const state = this.observeState();
    const { timeElapsed } = payload;
    const incidentState = state.agents.incident;

    // Escalate if taking too long
    if (timeElapsed > 180 && !this.hasEscalated && !incidentState.escalating) {
      this.escalateIncident();
    }

    // Periodic status updates (less frequent)
    if (timeElapsed % 120 === 0 && timeElapsed > 0) {
      this.sendStatusUpdate();
    }

    // Don't constantly increase affected users
    // Only once at specific intervals
    if (timeElapsed === 90 && state.scenario.phase !== 'aftermath') {
      this.increaseAffectedUsers();
    }
  }

  escalateIncident() {
    const state = this.observeState();
    const oldSeverity = state.agents.incident.severity;
    const newSeverity = 'P1';

    this.sendMessage(
      `⚠️  INCIDENT ESCALATED: ${oldSeverity} → ${newSeverity}\nReason: Incident duration exceeded threshold\nAffected Users: ${state.agents.incident.affectedUsers * 2} (doubled)\nAction Required: Immediate resolution needed\n\nAdditional monitoring alerts:\n[14:27:03] WARN: Error rate: 15%\n[14:27:08] WARN: Customer support tickets increasing`,
      { type: 'escalation', severity: newSeverity, priority: 'critical' }
    );

    worldState.updateAgent('incident', {
      severity: newSeverity,
      escalating: true,
      affectedUsers: state.agents.incident.affectedUsers * 2,
    });

    eventBus.publish(EventTypes.INCIDENT_ESCALATED, {
      oldSeverity,
      newSeverity,
    }, this.id);

    this.hasEscalated = true;
    this.alertsSent++;
  }

  sendStatusUpdate() {
    const state = this.observeState();
    const incidentState = state.agents.incident;
    const phase = state.scenario.phase;

    if (phase === 'investigation') {
      this.sendMessage(
        `📊 Incident Status Update\nSeverity: ${incidentState.severity}\nDuration: ${Math.floor(state.scenario.timeElapsed / 60)} minutes\nAffected Users: ${incidentState.affectedUsers}\nStatus: Investigation in progress`,
        { type: 'status_update', automated: true }
      );
    }

    this.alertsSent++;
  }

  increaseAffectedUsers() {
    const state = this.observeState();
    const currentCount = state.agents.incident.affectedUsers;
    const increment = Math.floor(Math.random() * 20) + 5;
    const newCount = currentCount + increment;

    worldState.updateAgent('incident', {
      affectedUsers: newCount,
    });

    // Only alert if significant increase
    if (increment > 15) {
      this.sendMessage(
        `📈 User Impact Update: ${currentCount} → ${newCount} affected users (+${increment} in last 30s)`,
        { type: 'impact_update', automated: true, severity: 'warning' }
      );
      this.alertsSent++;
    }
  }

  onTestsPassed() {
    this.sendMessage(
      `✅ Test Suite Results\nTests Passed: 12/12\nCoverage: Positive, zero, and negative amount cases\nStatus: Fix validated\n\nNext Step: Deploy to production`,
      { type: 'validation', sentiment: 'positive', automated: true }
    );
  }

  onDeploy() {
    setTimeout(() => {
      this.sendMessage(
        `🚀 Deployment successful\nService: Payments API\nVersion: v2.1.3\nStatus: Monitoring...\n\n[14:35:12] INFO: New validation logic active\n[14:35:15] INFO: 0 errors in last 60 seconds\n[14:35:20] INFO: $0.00 authorizations correctly rejected\n[14:35:25] SUCCESS: Issue resolved`,
        { type: 'deployment', sentiment: 'positive' }
      );

      this.resolveIncident();
    }, 2000);
  }

  resolveIncident() {
    worldState.updateAgent('incident', {
      severity: 'RESOLVED',
      escalating: false,
    });

    eventBus.publish(EventTypes.INCIDENT_RESOLVED, {
      duration: worldState.getState().scenario.timeElapsed,
      finalAffectedUsers: worldState.getState().agents.incident.affectedUsers,
    }, this.id);

    setTimeout(() => {
      this.sendMessage(
        `✨ INCIDENT CLOSED\nTotal Duration: ${Math.floor(worldState.getState().scenario.timeElapsed / 60)} minutes\nTotal Affected Users: ${worldState.getState().agents.incident.affectedUsers}\nResolution: Payment validation logic updated\nPost-Incident Actions: Update monitoring rules, add regression tests\n\nIncident Report generated and filed.`,
        { type: 'resolution', category: 'incident_closed' }
      );
    }, 3000);
  }

  onPhaseChange(payload) {
    const { to } = payload;

    if (to === 'resolution') {
      this.sendMessage(
        `📋 Incident Update\nStatus: INVESTIGATING → RESOLVING\nCode changes detected. Running validation...`,
        { type: 'phase_update', automated: true }
      );
    }
  }

  getMetrics() {
    return {
      ...super.getMetrics(),
      alertsSent: this.alertsSent,
      hasEscalated: this.hasEscalated,
    };
  }
}

export default IncidentAgent;
