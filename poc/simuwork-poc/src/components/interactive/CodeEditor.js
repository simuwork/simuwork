// CodeEditor.js - Interactive code editor component

import React, { useState, useEffect } from 'react';
import { eventBus, EventTypes } from '../../systems/EventBus';
import { worldState } from '../../systems/WorldState';

const initialCode = `def process_payment(amount):
    if amount > 0:
        return "Success"
    else:
        raise ValueError("Invalid amount")`;

const CodeEditor = ({ onCodeChange }) => {
  const [code, setCode] = useState(initialCode);
  const [hasChanges, setHasChanges] = useState(false);
  const [lineHighlights, setLineHighlights] = useState([]);

  useEffect(() => {
    // Subscribe to code changes from demo controller
    const unsubscribe = worldState.subscribe((newState) => {
      if (newState.ui.codeEditorContent && newState.ui.codeEditorContent !== code) {
        setCode(newState.ui.codeEditorContent);
        setHasChanges(newState.ui.codeEditorContent !== initialCode);
      }
    });

    return unsubscribe;
  }, [code]);

  useEffect(() => {
    // Update world state when code changes manually
    if (!worldState.getState().ui.codeEditorContent || code === worldState.getState().ui.codeEditorContent) {
      worldState.updateState({
        scenario: {
          codebase: {
            currentFile: 'payments/utils.py',
            hasChanges,
          },
        },
        ui: {
          codeEditorContent: code,
        },
      });
    }
  }, [code, hasChanges]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    setHasChanges(newCode !== initialCode);

    // Publish code change event
    eventBus.publish(EventTypes.USER_CODE_CHANGE, {
      code: newCode,
      hasChanges: newCode !== initialCode,
      timestamp: Date.now(),
    }, 'user');

    // Record user action
    worldState.recordUserAction({
      type: 'code_change',
      code: newCode,
    });

    if (onCodeChange) {
      onCodeChange(newCode);
    }
  };

  const handleRunTests = () => {
    // Analyze code and determine if tests pass
    const testsPass = analyzeCode(code);

    // Publish test run event
    eventBus.publish(EventTypes.USER_RUN_TESTS, {
      code,
      timestamp: Date.now(),
    }, 'user');

    // Simulate test execution
    setTimeout(() => {
      if (testsPass) {
        eventBus.publish(EventTypes.TESTS_PASSED, {
          code,
          testCount: 12,
        }, 'system');

        worldState.updateState({
          scenario: {
            codebase: {
              testsPass: true,
            },
          },
        });

        worldState.completeObjective('obj_2');
      } else {
        const failedTests = getFailedTests(code);

        eventBus.publish(EventTypes.TESTS_FAILED, {
          code,
          failedTests,
        }, 'system');

        worldState.updateState({
          scenario: {
            codebase: {
              testsPass: false,
            },
          },
        });
      }
    }, 1500);

    // Record action
    worldState.recordUserAction({
      type: 'run_tests',
      result: testsPass ? 'pass' : 'fail',
    });
  };

  const analyzeCode = (codeStr) => {
    // Check if the code fixes the validation bug
    const hasCorrectCondition = codeStr.includes('amount <= 0');
    const raisesError = codeStr.includes('raise');

    return hasCorrectCondition && raisesError;
  };

  const getFailedTests = (codeStr) => {
    const failures = [];

    if (!codeStr.includes('amount <= 0')) {
      failures.push({
        test: 'test_zero_amount_rejected',
        error: 'AssertionError: Expected ValueError for amount=0',
      });
    }

    if (!codeStr.includes('raise')) {
      failures.push({
        test: 'test_invalid_amount_raises_error',
        error: 'AssertionError: No exception raised for invalid amount',
      });
    }

    return failures;
  };

  const getLineNumbers = () => {
    return code.split('\n').map((_, i) => i + 1);
  };

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <div className="file-tab">
          <span className="file-icon">📄</span>
          <span className="file-name">payments/utils.py</span>
          {hasChanges && <span className="file-modified">●</span>}
        </div>
        <button
          className="run-tests-button"
          onClick={handleRunTests}
          disabled={!hasChanges}
        >
          ▶ Run Tests
        </button>
      </div>

      <div className="code-editor-body">
        <div className="line-numbers">
          {getLineNumbers().map((lineNum) => (
            <div
              key={lineNum}
              className={`line-number ${lineHighlights.includes(lineNum) ? 'highlighted' : ''}`}
            >
              {lineNum}
            </div>
          ))}
        </div>

        <textarea
          className="code-textarea"
          value={code}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder="Write your code here..."
        />
      </div>

      <style>{`
        .code-editor-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .code-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #2d2d2d;
          border-bottom: 1px solid #3e3e3e;
        }

        .file-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: #1e1e1e;
          border-radius: 4px;
          font-size: 13px;
          color: #cccccc;
        }

        .file-icon {
          font-size: 14px;
        }

        .file-name {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
        }

        .file-modified {
          color: #4ec9b0;
          font-size: 18px;
          line-height: 1;
        }

        .run-tests-button {
          padding: 6px 16px;
          background: #0e639c;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .run-tests-button:hover:not(:disabled) {
          background: #1177bb;
        }

        .run-tests-button:disabled {
          background: #3e3e3e;
          color: #6e6e6e;
          cursor: not-allowed;
        }

        .code-editor-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .line-numbers {
          display: flex;
          flex-direction: column;
          background: #1e1e1e;
          padding: 16px 8px;
          border-right: 1px solid #3e3e3e;
          user-select: none;
        }

        .line-number {
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 13px;
          line-height: 20px;
          color: #858585;
          text-align: right;
          min-width: 30px;
          padding-right: 12px;
        }

        .line-number.highlighted {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .code-textarea {
          flex: 1;
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 13px;
          line-height: 20px;
          padding: 16px;
          border: none;
          outline: none;
          resize: none;
          tab-size: 4;
        }

        .code-textarea::selection {
          background: #264f78;
        }
      `}</style>
    </div>
  );
};

export default CodeEditor;
