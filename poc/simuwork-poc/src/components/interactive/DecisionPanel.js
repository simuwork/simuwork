// DecisionPanel.js - Interactive decision-making component

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eventBus, EventTypes } from '../../systems/EventBus';
import { worldState } from '../../systems/WorldState';

const DecisionPanel = ({ decision, onDecisionMade }) => {
  const handleDecision = (optionId) => {
    // Publish decision event
    eventBus.publish(EventTypes.USER_DECISION, {
      decisionId: decision.id,
      decision: optionId,
      timestamp: Date.now(),
    }, 'user');

    // Record action
    worldState.recordUserAction({
      type: 'decision',
      decisionId: decision.id,
      choice: optionId,
    });

    if (onDecisionMade) {
      onDecisionMade(optionId);
    }
  };

  if (!decision) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="decision-panel-overlay"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="decision-panel-content"
        >
          <div className="decision-header">
            <span className="decision-icon">🤔</span>
            <h3>Decision Required</h3>
          </div>

          <p className="decision-prompt">{decision.prompt}</p>

          <div className="decision-options">
            {decision.options.map((option) => (
              <button
                key={option.id}
                className="decision-option"
                onClick={() => handleDecision(option.id)}
              >
                <div className="option-label">{option.label}</div>
                {option.impact && (
                  <div className="option-impact">→ {option.impact}</div>
                )}
              </button>
            ))}
          </div>

          <div className="decision-hint">
            💡 Your choice will affect team dynamics and scenario progression
          </div>
        </motion.div>

        <style>{`
          .decision-panel-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(4px);
          }

          .decision-panel-content {
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 600px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .decision-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .decision-icon {
            font-size: 32px;
          }

          .decision-header h3 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
          }

          .decision-prompt {
            font-size: 16px;
            line-height: 1.6;
            color: #495057;
            margin-bottom: 24px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #3498db;
          }

          .decision-options {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .decision-option {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .decision-option:hover {
            border-color: #3498db;
            background: #f0f8ff;
            transform: translateX(4px);
          }

          .option-label {
            font-size: 15px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 6px;
          }

          .option-impact {
            font-size: 13px;
            color: #6c757d;
            font-style: italic;
          }

          .decision-hint {
            font-size: 13px;
            color: #6c757d;
            text-align: center;
            padding: 12px;
            background: #fff8e1;
            border-radius: 6px;
            border: 1px solid #ffe082;
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default DecisionPanel;
