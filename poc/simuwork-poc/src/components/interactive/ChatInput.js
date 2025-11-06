// ChatInput.js - Interactive chat input to communicate with agents

import React, { useState, useRef, useEffect } from 'react';
import { eventBus, EventTypes } from '../../systems/EventBus';
import { worldState } from '../../systems/WorldState';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingPreview, setTypingPreview] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Subscribe to typing state
    const unsubscribe = worldState.subscribe((newState) => {
      setIsTyping(newState.ui.userTyping || false);
      setTypingPreview(newState.ui.typingPreview || '');
    });

    return unsubscribe;
  }, []);

  const quickQuestions = [
    "What's the bug?",
    "Where should I start?",
    "Can you explain the error?",
    "What should I change?",
    "Is this the right fix?",
  ];

  const handleSend = () => {
    if (!message.trim() || isSending) {
      return;
    }

    setIsSending(true);

    // Add user message to chat
    worldState.addMessage({
      agentId: 'user',
      agentRole: 'You',
      content: message,
      type: 'user_message',
    });

    // Publish question event
    eventBus.publish(EventTypes.USER_ASK_QUESTION, {
      question: message,
      timestamp: Date.now(),
    }, 'user');

    // Record action
    worldState.recordUserAction({
      type: 'ask_question',
      question: message,
    });

    // Clear input
    setMessage('');

    // Reset sending state
    setTimeout(() => {
      setIsSending(false);
    }, 500);
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-container">
      <div className="quick-questions">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            className="quick-question-btn"
            onClick={() => handleQuickQuestion(q)}
            disabled={isSending}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="chat-input-box">
        {isTyping ? (
          <div className="typing-preview">
            <span className="typing-dots">●●●</span>
            <span className="typing-text">{typingPreview}</span>
            <span className="typing-cursor">|</span>
          </div>
        ) : (
          <>
            <textarea
              ref={inputRef}
              className="chat-textarea"
              placeholder="Ask a question to the team..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              rows={2}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? '⏳' : '📤'} Send
            </button>
          </>
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

        .quick-questions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .quick-question-btn {
          padding: 4px 10px;
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 16px;
          font-size: 11px;
          color: #495057;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .quick-question-btn:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
          transform: translateY(-1px);
        }

        .quick-question-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chat-input-box {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .chat-textarea {
          flex: 1;
          padding: 10px;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          resize: none;
          transition: border-color 0.2s;
          background: white;
        }

        .chat-textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .chat-textarea:disabled {
          background: #e9ecef;
          cursor: not-allowed;
        }

        .send-button {
          padding: 10px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
          transform: none;
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
      `}</style>
    </div>
  );
};

export default ChatInput;
