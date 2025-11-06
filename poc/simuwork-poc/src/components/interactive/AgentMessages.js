// AgentMessages.js - Display real-time messages from AI agents

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { worldState } from '../../systems/WorldState';

const agentAvatars = {
  senior_dev: '👨‍💻',
  pm: '👩‍💼',
  junior_dev: '🧑‍💻',
  incident: '🚨',
  director: '🎯',
};

const agentNames = {
  senior_dev: 'Marcus (Senior Dev)',
  pm: 'Sarah (PM)',
  junior_dev: 'Alex (Junior Dev)',
  incident: 'Incident Monitor',
  director: 'System',
};

const AgentMessages = () => {
  const [messages, setMessages] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Subscribe to world state changes
    const unsubscribe = worldState.subscribe((newState) => {
      setMessages(newState.ui.messages || []);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Auto-scroll to TOP when new messages arrive (since newest is at top)
    if (containerRef.current) {
      const container = containerRef.current.querySelector('.messages-list');
      if (container) {
        // Smooth scroll to top to show new message
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [messages]);

  const getMessageStyle = (message) => {
    const styles = {
      alert: { borderColor: '#f44336', background: 'rgba(244, 67, 54, 0.1)' },
      warning: { borderColor: '#ff9800', background: 'rgba(255, 152, 0, 0.1)' },
      hint: { borderColor: '#2196f3', background: 'rgba(33, 150, 243, 0.1)' },
      approval: { borderColor: '#4caf50', background: 'rgba(76, 175, 80, 0.1)' },
      escalation: { borderColor: '#f44336', background: 'rgba(244, 67, 54, 0.15)' },
    };

    return styles[message.type] || {};
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="agent-messages-container" ref={containerRef}>
      <div className="messages-header">
        <div>
          <h3>Team Communications</h3>
          <span className="latest-first-badge">Latest First ↓</span>
        </div>
        <span className="message-count">{messages.length} messages</span>
      </div>

      <div className="messages-list">
        <AnimatePresence initial={false}>
          {[...messages].reverse().map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="message-item"
              style={getMessageStyle(message)}
            >
              <div className="message-header-row">
                <div className="message-agent">
                  <span className="agent-avatar">
                    {agentAvatars[message.agentId] || '💬'}
                  </span>
                  <span className="agent-name">
                    {agentNames[message.agentId] || message.agentRole}
                  </span>
                </div>
                <span className="message-time">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>

              <div className="message-content">
                {message.content.split('\n').map((line, i) => (
                  <div key={i} className="message-line">
                    {line}
                  </div>
                ))}
              </div>

              {message.type && (
                <div className="message-metadata">
                  <span className="message-type-badge">{message.type}</span>
                  {message.severity && (
                    <span className={`severity-badge severity-${message.severity}`}>
                      {message.severity}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .agent-messages-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .messages-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .messages-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }

        .latest-first-badge {
          display: inline-block;
          font-size: 11px;
          color: #667eea;
          font-weight: 500;
          padding: 2px 6px;
          background: #e8eaf6;
          border-radius: 4px;
        }

        .message-count {
          font-size: 13px;
          color: #6c757d;
          padding: 4px 8px;
          background: white;
          border-radius: 12px;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .messages-list::-webkit-scrollbar {
          width: 8px;
        }

        .messages-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .messages-list::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }

        .messages-list::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }

        .message-item {
          padding: 12px;
          background: #f8f9fa;
          border-left: 3px solid #dee2e6;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .message-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .message-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .message-agent {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .agent-avatar {
          font-size: 20px;
          line-height: 1;
        }

        .agent-name {
          font-weight: 600;
          font-size: 14px;
          color: #2c3e50;
        }

        .message-time {
          font-size: 12px;
          color: #6c757d;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        }

        .message-content {
          font-size: 14px;
          line-height: 1.6;
          color: #495057;
          white-space: pre-wrap;
        }

        .message-line {
          margin: 2px 0;
        }

        .message-metadata {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .message-type-badge {
          display: inline-block;
          padding: 2px 8px;
          background: #e9ecef;
          color: #495057;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .severity-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .severity-high, .severity-critical {
          background: #fff3f3;
          color: #d32f2f;
        }

        .severity-warning, .severity-medium {
          background: #fff8e1;
          color: #f57c00;
        }

        .severity-info, .severity-low {
          background: #e3f2fd;
          color: #1976d2;
        }
      `}</style>
    </div>
  );
};

export default AgentMessages;
