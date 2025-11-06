import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css';

const STEP_DELAY_MS = 3500;

const demoSteps = [
  {
    title: 'Orientation',
    summary:
      "Welcome to SimuWork. Meet your multi-agent mentors guiding a backend debugging challenge at a Stripe-like company.",
    candidateAction: null,
    aiInteractions: [
      {
        agent: 'System',
        message:
          "Context loaded: Payments API is intermittently failing for zero-dollar authorizations. Let the mentors walk you through the diagnosis.",
      },
      {
        agent: 'Feedback Coordinator Agent',
        message:
          "We will orchestrate the session while you observe how SimuWork mentors a junior engineer end-to-end.",
      },
    ],
  },
  {
    title: 'Initial Scan',
    summary:
      'The candidate reviews the failing helper function responsible for validating payment amounts before dispatching to the gateway.',
    candidateAction: {
      type: 'code',
      label: 'payments/utils.py',
      content: `def process_payment(amount):\n    if amount > 0:\n        return "Success"\n    else:\n        raise ValueError("Invalid amount")`,
    },
    aiInteractions: [
      {
        agent: 'Code Reviewer Agent',
        message:
          'Preflight review: Guard clause allows zero-dollar amounts through. That contradicts payment specs requiring strictly positive values.',
      },
      {
        agent: 'Architecture Advisor Agent',
        message:
          'Downstream gateway rejects zero authorizations. Recommend shifting validation left before the service fan-out.',
      },
    ],
  },
  {
    title: 'Mentor Sync',
    summary:
      'Agents collaborate to coach the candidate, aligning on validation strategy and communicating next steps.',
    candidateAction: null,
    aiInteractions: [
      {
        agent: 'Feedback Coordinator Agent',
        message:
          'Coordinating consensus: tighten guard to enforce positive amounts and surface actionable error messaging to the client.',
      },
      {
        agent: 'Architecture Advisor Agent',
        message:
          'Ensure the API remains idempotent. Suggest raising a domain error that the client middleware can translate for UX.',
      },
    ],
  },
  {
    title: 'Implementation',
    summary:
      'The candidate applies the guidance, updating validation and returning consistent responses.',
    candidateAction: {
      type: 'code',
      label: 'payments/utils.py',
      content: `class PaymentValidationError(ValueError):\n    pass\n\n\ndef process_payment(amount):\n    if amount <= 0:\n        raise PaymentValidationError("Amount must be greater than zero")\n    # Simulate gateway dispatch\n    return "Success"`,
    },
    aiInteractions: [
      {
        agent: 'Code Reviewer Agent',
        message:
          'Regression tests re-run: zero and negative paths now raise PaymentValidationError. Happy path untouched.',
      },
      {
        agent: 'Architecture Advisor Agent',
        message:
          'New exception keeps the contract explicit. Suggest logging payload metadata before dispatch for future observability.',
      },
    ],
  },
  {
    title: 'Wrap-up',
    summary:
      'Simulation concludes with mentors highlighting outcomes and unlocking the credential.',
    candidateAction: {
      type: 'terminal',
      label: 'CI Pipeline',
      content: `$ pytest tests/payments/test_process_payment.py\n==================== 12 passed in 0.42s ====================`,
    },
    aiInteractions: [
      {
        agent: 'Feedback Coordinator Agent',
        message:
          'Credential granted: Backend Debugging - Payments API. Candidate demonstrated applied mentorship learning.',
      },
      {
        agent: 'System',
        message:
          'SimuWork captures transcripts, diff summaries, and mentor hand-offs automatically for reporting.',
      },
    ],
  },
];

const agentVariants = {
  initial: { x: -16, opacity: 0 },
  animate: (i) => ({ x: 0, opacity: 1, transition: { delay: i * 0.2 } }),
  exit: { x: 16, opacity: 0 },
};

const App = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  const progressPercent = useMemo(() => {
    if (demoSteps.length <= 1) {
      return 0;
    }
    return (step / (demoSteps.length - 1)) * 100;
  }, [step]);

  useEffect(() => {
    if (!isPlaying || step >= demoSteps.length - 1) {
      return undefined;
    }

    timerRef.current = setTimeout(() => {
      setStep((prev) => Math.min(prev + 1, demoSteps.length - 1));
    }, STEP_DELAY_MS);

    return () => clearTimeout(timerRef.current);
  }, [isPlaying, step]);

  useEffect(() => {
    if (step === demoSteps.length - 1) {
      setIsPlaying(false);
    }
  }, [step]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleReplay = () => {
    setStep(0);
    setIsPlaying(true);
  };

  const currentStep = demoSteps[step];

  const renderCandidateAction = () => {
    if (!currentStep.candidateAction) {
      return <p className="placeholder-text">Awaiting next move from the candidate...</p>;
    }

    const { type, content, label } = currentStep.candidateAction;

    if (type === 'code') {
      return (
        <div>
          <p className="code-label">{label}</p>
          <SyntaxHighlighter language="python" style={docco} customStyle={{ borderRadius: '12px', fontSize: '0.95rem' }}>
            {content}
          </SyntaxHighlighter>
        </div>
      );
    }

    if (type === 'terminal') {
      return (
        <div className="terminal-shell">
          <div className="terminal-header">
            <span className="terminal-dot dot-red" />
            <span className="terminal-dot dot-yellow" />
            <span className="terminal-dot dot-green" />
            <span className="terminal-label">{label}</span>
          </div>
          <pre className="terminal-content">{content}</pre>
        </div>
      );
    }

    return <pre className="fallback-block">{content}</pre>;
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <header className="app-header">
          <div className="header-copy">
            <h1 className="title">SimuWork Multi-Agent Demo</h1>
            <p className="subtitle">
              Observe how SimuWork orchestrates a team of AI mentors to guide a candidate through a backend debugging scenario.
            </p>
          </div>
          <div className="header-controls">
            <button type="button" onClick={handleTogglePlay} className="primary-button">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button type="button" onClick={handleReplay} className="secondary-button">
              Replay
            </button>
          </div>
        </header>

        <section className="layout-grid">
          <motion.div
            key={`candidate-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <h2>Candidate Workspace</h2>
              <p>Simulated actions update automatically as the scenario unfolds.</p>
            </div>
            <div className="card-body">{renderCandidateAction()}</div>
          </motion.div>

          <motion.div
            key={`agents-${step}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card"
          >
            <div className="card-header">
              <h2>Multi-Agent Mentorship</h2>
              <p>Agents collaborate, layering guidance and feedback for the candidate.</p>
            </div>
            <p className="summary-bubble">{currentStep.summary}</p>
            <div className="agent-messages">
              <AnimatePresence>
                {currentStep.aiInteractions.map((interaction, index) => (
                  <motion.div
                    key={`${interaction.agent}-${index}`}
                    custom={index}
                    variants={agentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="agent-message"
                  >
                    <p className="agent-name">{interaction.agent}</p>
                    <p className="agent-text">{interaction.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </section>

        <footer className="progress-footer">
          <div className="progress-meta">
            <span>Timeline</span>
            <span>
              Step {step + 1} of {demoSteps.length} • {currentStep.title}
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          {step === demoSteps.length - 1 && (
            <p className="progress-complete">
              Simulation complete. Choose Replay to watch the auto-guided mentoring flow again or integrate live agents for production demos.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default App;
