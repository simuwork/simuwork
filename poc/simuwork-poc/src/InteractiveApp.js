// InteractiveApp.js - Main interactive living platform demo

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import CodeEditor from './components/interactive/CodeEditor';
import AgentMessages from './components/interactive/AgentMessages';
import TerminalOutput from './components/interactive/TerminalOutput';
import ObjectivesPanel from './components/interactive/ObjectivesPanel';
import TooltipGuide from './components/interactive/TooltipGuide';
import { agentOrchestrator } from './systems/AgentOrchestrator';
import { worldState } from './systems/WorldState';
import { eventBus, EventTypes } from './systems/EventBus';
import { demoController } from './systems/DemoController';
import { guideController } from './systems/GuideController';
import './InteractiveApp.css';

const InteractiveApp = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);
  const [currentNarration, setCurrentNarration] = useState(null);

  useEffect(() => {
    // Initialize the agent system
    console.log('Initializing SimuWork Living Platform...');
    agentOrchestrator.initialize();
    setIsInitialized(true);

    // Subscribe to scenario completion
    const unsubComplete = eventBus.subscribe(EventTypes.SCENARIO_COMPLETE, () => {
      setScenarioComplete(true);
    });

    // Subscribe to system ready
    const unsubReady = eventBus.subscribe(EventTypes.SYSTEM_READY, () => {
      console.log('System ready!');
    });

    // Subscribe to narration changes
    const unsubNarration = guideController.subscribe((narration) => {
      setCurrentNarration(narration);
    });

    // Cleanup on unmount
    return () => {
      unsubComplete();
      unsubReady();
      unsubNarration();
      agentOrchestrator.destroy();
      guideController.reset();
    };
  }, []);

  const handleRestart = () => {
    setScenarioComplete(false);
    setDemoStarted(false);
    demoController.stop();
    guideController.reset();
    agentOrchestrator.restart();
  };

  const handleStartDemo = () => {
    // Start the demo - narrations will appear automatically
    setDemoStarted(true);
    demoController.start();
  };

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Initializing AI Agents...</p>
      </div>
    );
  }

  return (
    <div className="interactive-app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            SimuWork <span className="live-badge">LIVE</span>
          </h1>
          <p className="app-subtitle">
            Living AI-Powered Job Simulation Platform
          </p>
        </div>
        <div className="header-right">
          {!demoStarted ? (
            <button className="btn-primary btn-large" onClick={handleStartDemo}>
              ▶️ Start Interactive Demo
            </button>
          ) : (
            <button className="btn-secondary" onClick={handleRestart}>
              🔄 Restart
            </button>
          )}
          <div className="status-indicator">
            <span className="status-dot"></span>
            Agents Active
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="left-column">
          <section className="section objectives-section">
            <ObjectivesPanel />
          </section>

          <section className="section terminal-section">
            <TerminalOutput />
          </section>
        </div>

        <div className="center-column">
          <section className="section code-section">
            <CodeEditor />
          </section>
        </div>

        <div className="right-column">
          <section className="section messages-section">
            <AgentMessages />
          </section>
        </div>
      </main>

      {/* Automatic Narration Tooltips */}
      <AnimatePresence>
        {currentNarration && (
          <TooltipGuide narration={currentNarration} />
        )}
      </AnimatePresence>

      {/* Completion overlay */}
      <AnimatePresence>
        {scenarioComplete && (
          <div className="completion-overlay">
            <div className="completion-content">
              <h2>🎉 Scenario Complete!</h2>
              <p>
                You've successfully completed the Payment API debugging challenge.
              </p>
              <div className="completion-stats">
                <div className="stat">
                  <span className="stat-label">Time Elapsed</span>
                  <span className="stat-value">
                    {Math.floor(worldState.getState().scenario.timeElapsed / 60)}m
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Objectives</span>
                  <span className="stat-value">
                    {worldState.getState().scenario.objectives.length}/{worldState.getState().scenario.objectives.length}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Team Rating</span>
                  <span className="stat-value">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
              <button className="btn-primary" onClick={handleRestart}>
                Try Another Scenario
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <footer className="app-footer">
        <p className="footer-text">
          💡 This is a living simulation - AI agents are responding to your actions in real-time
        </p>
      </footer>
    </div>
  );
};

export default InteractiveApp;
