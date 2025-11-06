// ObjectivesPanel.js - Display scenario objectives and progress

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { worldState } from '../../systems/WorldState';

const ObjectivesPanel = () => {
  const [objectives, setObjectives] = useState([]);
  const [scenarioInfo, setScenarioInfo] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Subscribe to world state
    const unsubscribe = worldState.subscribe((newState) => {
      setObjectives(newState.scenario.objectives || []);
      setScenarioInfo({
        phase: newState.scenario.phase,
        difficulty: newState.scenario.difficulty,
        type: newState.scenario.type,
      });
      setTimeElapsed(newState.scenario.timeElapsed);
    });

    // Initial load
    const state = worldState.getState();
    setObjectives(state.scenario.objectives || []);
    setScenarioInfo({
      phase: state.scenario.phase,
      difficulty: state.scenario.difficulty,
      type: state.scenario.type,
    });

    return unsubscribe;
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseDisplay = (phase) => {
    const phases = {
      orientation: { label: 'Orientation', icon: '🎯', color: '#3498db' },
      investigation: { label: 'Investigation', icon: '🔍', color: '#f39c12' },
      resolution: { label: 'Resolution', icon: '🛠️', color: '#9b59b6' },
      aftermath: { label: 'Aftermath', icon: '✨', color: '#27ae60' },
    };
    return phases[phase] || phases.orientation;
  };

  const completedCount = objectives.filter((obj) => obj.completed).length;
  const progress = objectives.length > 0 ? (completedCount / objectives.length) * 100 : 0;
  const phaseInfo = getPhaseDisplay(scenarioInfo.phase);

  return (
    <div className="objectives-panel">
      <div className="panel-header">
        <h3>Mission Objectives</h3>
        <div className="header-stats">
          <span className="time-badge">⏱ {formatTime(timeElapsed)}</span>
          <span
            className="phase-badge"
            style={{ backgroundColor: phaseInfo.color }}
          >
            {phaseInfo.icon} {phaseInfo.label}
          </span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-text">
            {completedCount} / {objectives.length}
          </span>
        </div>
        <div className="progress-bar-container">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ backgroundColor: phaseInfo.color }}
          />
        </div>
      </div>

      <div className="objectives-list">
        {objectives.map((objective, index) => (
          <motion.div
            key={objective.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`objective-item ${objective.completed ? 'completed' : ''}`}
          >
            <div className="objective-checkbox">
              {objective.completed ? '✓' : index + 1}
            </div>
            <div className="objective-text">{objective.text}</div>
          </motion.div>
        ))}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="completion-badge"
        >
          🎉 All objectives complete!
        </motion.div>
      )}

      <style>{`
        .objectives-panel {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          margin-bottom: 20px;
        }

        .panel-header h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
        }

        .header-stats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .time-badge,
        .phase-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .time-badge {
          background: #e9ecef;
          color: #495057;
        }

        .phase-badge {
          color: white;
        }

        .progress-section {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e9ecef;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .progress-label {
          font-size: 13px;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .progress-text {
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
        }

        .progress-bar-container {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .objectives-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
        }

        .objective-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 2px solid transparent;
          transition: all 0.3s;
        }

        .objective-item:not(.completed):hover {
          border-color: #e9ecef;
          background: #fff;
        }

        .objective-item.completed {
          background: #d4edda;
          border-color: #c3e6cb;
        }

        .objective-checkbox {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          border: 2px solid #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #6c757d;
          flex-shrink: 0;
        }

        .objective-item.completed .objective-checkbox {
          background: #28a745;
          border-color: #28a745;
          color: white;
        }

        .objective-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.5;
          color: #495057;
        }

        .objective-item.completed .objective-text {
          color: #155724;
          text-decoration: line-through;
        }

        .completion-badge {
          margin-top: 16px;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default ObjectivesPanel;
