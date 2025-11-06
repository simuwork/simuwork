// TerminalOutput.js - Display test results and system output

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { eventBus, EventTypes } from '../../systems/EventBus';

const TerminalOutput = () => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    // Subscribe to test events
    const unsubTestsStarted = eventBus.subscribe(EventTypes.USER_RUN_TESTS, () => {
      setIsRunning(true);
      addOutput('$ pytest tests/payments/test_process_payment.py', 'command');
      addOutput('Collecting tests...', 'info');
    });

    const unsubTestsPassed = eventBus.subscribe(EventTypes.TESTS_PASSED, (event) => {
      setIsRunning(false);
      addOutput('', 'blank');
      addOutput('test_positive_amount_succeeds ✓', 'success');
      addOutput('test_zero_amount_rejected ✓', 'success');
      addOutput('test_negative_amount_rejected ✓', 'success');
      addOutput('test_returns_success_message ✓', 'success');
      addOutput('test_raises_validation_error ✓', 'success');
      addOutput('', 'blank');
      addOutput(`==================== ${event.payload.testCount} passed in 0.42s ====================`, 'success');
      addOutput('', 'blank');
      addOutput('✅ All tests passed!', 'success-bold');
    });

    const unsubTestsFailed = eventBus.subscribe(EventTypes.TESTS_FAILED, (event) => {
      setIsRunning(false);
      addOutput('', 'blank');
      addOutput('test_positive_amount_succeeds ✓', 'success');

      event.payload.failedTests.forEach((failure) => {
        addOutput(`test_${failure.test} ✗`, 'error');
        addOutput(`  ${failure.error}`, 'error-detail');
      });

      addOutput('', 'blank');
      addOutput(`==================== ${event.payload.failedTests.length} failed, ${12 - event.payload.failedTests.length} passed ====================`, 'error');
      addOutput('', 'blank');
      addOutput('❌ Some tests failed. Review the errors above.', 'error-bold');
    });

    return () => {
      unsubTestsStarted();
      unsubTestsPassed();
      unsubTestsFailed();
    };
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const addOutput = (text, type = 'info') => {
    setOutput((prev) => [
      ...prev,
      {
        id: `output_${Date.now()}_${Math.random()}`,
        text,
        type,
        timestamp: Date.now(),
      },
    ]);
  };

  const getLineClass = (type) => {
    const classes = {
      command: 'terminal-command',
      info: 'terminal-info',
      success: 'terminal-success',
      'success-bold': 'terminal-success-bold',
      error: 'terminal-error',
      'error-detail': 'terminal-error-detail',
      'error-bold': 'terminal-error-bold',
      warning: 'terminal-warning',
      blank: 'terminal-blank',
    };
    return classes[type] || 'terminal-info';
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-dots">
          <span className="dot dot-red"></span>
          <span className="dot dot-yellow"></span>
          <span className="dot dot-green"></span>
        </div>
        <span className="terminal-title">Test Output</span>
        <button className="terminal-clear" onClick={clearOutput}>
          Clear
        </button>
      </div>

      <div className="terminal-body">
        {output.length === 0 && !isRunning && (
          <div className="terminal-empty">
            <span className="empty-icon">📝</span>
            <p>Run tests to see output here</p>
          </div>
        )}

        <AnimatePresence>
          {output.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`terminal-line ${getLineClass(line.type)}`}
            >
              {line.text || '\u00A0'}
            </motion.div>
          ))}
        </AnimatePresence>

        {isRunning && (
          <motion.div
            className="terminal-line terminal-running"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            Running tests...
          </motion.div>
        )}

        <div ref={terminalEndRef} />
      </div>

      <style>{`
        .terminal-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        }

        .terminal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: #2d2d2d;
          border-bottom: 1px solid #3e3e3e;
        }

        .terminal-dots {
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .dot-red {
          background: #ff5f56;
        }

        .dot-yellow {
          background: #ffbd2e;
        }

        .dot-green {
          background: #27c93f;
        }

        .terminal-title {
          flex: 1;
          font-size: 12px;
          color: #cccccc;
          text-align: center;
        }

        .terminal-clear {
          padding: 4px 8px;
          background: transparent;
          color: #cccccc;
          border: 1px solid #3e3e3e;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .terminal-clear:hover {
          background: #3e3e3e;
          border-color: #4e4e4e;
        }

        .terminal-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          color: #d4d4d4;
          font-size: 13px;
          line-height: 1.6;
        }

        .terminal-body::-webkit-scrollbar {
          width: 8px;
        }

        .terminal-body::-webkit-scrollbar-track {
          background: #1e1e1e;
        }

        .terminal-body::-webkit-scrollbar-thumb {
          background: #3e3e3e;
          border-radius: 4px;
        }

        .terminal-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6e6e6e;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
          opacity: 0.5;
        }

        .terminal-empty p {
          font-size: 14px;
        }

        .terminal-line {
          margin: 2px 0;
          padding-left: 4px;
        }

        .terminal-command {
          color: #4ec9b0;
          font-weight: 500;
        }

        .terminal-command::before {
          content: '> ';
          color: #858585;
        }

        .terminal-info {
          color: #d4d4d4;
        }

        .terminal-success {
          color: #4ec9b0;
        }

        .terminal-success-bold {
          color: #4ec9b0;
          font-weight: 600;
        }

        .terminal-error {
          color: #f48771;
        }

        .terminal-error-detail {
          color: #f48771;
          padding-left: 20px;
          font-size: 12px;
        }

        .terminal-error-bold {
          color: #f48771;
          font-weight: 600;
        }

        .terminal-warning {
          color: #dcdcaa;
        }

        .terminal-blank {
          height: 8px;
        }

        .terminal-running {
          color: #569cd6;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default TerminalOutput;
