// ChatInput.js - Simplified for demo to only show typing animation

import React, { useState, useEffect } from 'react';
import { worldState } from '../../systems/WorldState';

const ChatInput = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [typingPreview, setTypingPreview] = useState('');

  useEffect(() => {
    // Subscribe to typing state
    const unsubscribe = worldState.subscribe((newState) => {
      setIsTyping(newState.ui.userTyping || false);
      setTypingPreview(newState.ui.typingPreview || '');
    });

    return unsubscribe;
  }, []);

  return (
    <div className="chat-input-container">
      <div className="chat-input-box">
        {isTyping ? (
          <div className="typing-preview">
            <span className="typing-dots">●●●</span>
            <span className="typing-text">{typingPreview}</span>
            <span className="typing-cursor">|</span>
          </div>
        ) : (
          <div className="chat-textarea-placeholder">
            Ask a question to the team...
          </div>
        )}
      </div>

      <style>{`
        .chat-input-container {
          border-top: 2px solid #e9ecef;
          background: #f8f9fa;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-input-box {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .typing-preview {
          flex: 1;
          padding: 12px;
          background: linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%);
          border: 2px solid #667eea;
          border-radius: 8px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 48px;
        }

        .typing-dots {
          color: #667eea;
          font-size: 12px;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .typing-text {
          flex: 1;
          color: #495057;
        }

        .typing-cursor {
          color: #667eea;
          font-weight: bold;
          animation: blink 1s infinite;
        }

        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .chat-textarea-placeholder {
          flex: 1;
          padding: 10px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          color: #6c757d;
          background: white;
          min-height: 48px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default ChatInput;