// DemoScript.js - Choreographed demo script for pitch presentation

export const demoScript = [
  // Opening narration
  {
    time: 0,
    type: 'show_narration',
    narration: {
      agent: 'SimuWork AI',
      agentIcon: '🎯',
      title: 'Welcome to SimuWork',
      description: 'Watch as multiple AI agents work together to mentor you through a real Payment API debugging challenge.',
      position: 'top-center',
      color: 'blue',
      duration: 5000,
    },
  },

  // Phase 1: Orientation & Initial Context
  {
    time: 3,
    type: 'agent_message',
    agentId: 'incident',
    trigger: 'auto',
  },
  {
    time: 4,
    type: 'show_narration',
    narration: {
      agent: 'Incident Agent',
      agentIcon: '🚨',
      description: 'The Incident Agent detects a critical bug and alerts the team automatically.',
      position: 'messages',
      color: 'orange',
      duration: 5000,
      spotlight: {
        top: '110px',
        right: '20px',
        width: '380px',
        height: '150px'
      }
    },
  },
  {
    time: 8,
    type: 'agent_message',
    agentId: 'pm',
    trigger: 'phase_change_investigation',
  },
  {
    time: 12,
    type: 'agent_message',
    agentId: 'senior_dev',
    trigger: 'initial_guidance',
  },
  {
    time: 13,
    type: 'show_narration',
    narration: {
      agent: 'Senior Engineer AI',
      agentIcon: '💻',
      description: 'The Senior Engineer AI provides guidance and helps you investigate the code.',
      position: 'messages',
      color: 'blue',
      duration: 5000,
    },
  },

  // Phase 2: User Investigation
  {
    time: 18,
    type: 'user_message',
    content: "What's causing the payment validation failures?",
    typingDuration: 2000,
  },
  {
    time: 19,
    type: 'show_narration',
    narration: {
      agent: 'Student Interaction',
      agentIcon: '👤',
      description: 'Students can ask questions and get instant, personalized feedback from AI mentors.',
      position: 'messages',
      color: 'green',
      duration: 5000,
    },
  },
  {
    time: 21,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Good question. Take a look at the process_payment function - specifically the validation logic. What condition is being checked before we process the payment?",
  },
  {
    time: 28,
    type: 'user_message',
    content: "I see it checks if amount > 0. Is that the bug?",
    typingDuration: 2000,
  },
  {
    time: 31,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Exactly! Think about it - if amount is 0, does that condition catch it? What happens with zero-dollar authorizations?",
  },
  {
    time: 36,
    type: 'user_message',
    content: "Oh! Zero passes through because 0 is not > 0, but it's also not raising an error.",
    typingDuration: 2500,
  },
  {
    time: 40,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Bingo! You've found the root cause. Zero-dollar amounts slip through the validation. Now, how would you fix this?",
  },

  // Phase 3: Junior Dev Interruption (Decision Point)
  {
    time: 45,
    type: 'agent_message',
    agentId: 'junior_dev',
    trigger: 'teammate_help_request',
  },
  {
    time: 50,
    type: 'user_decision_auto',
    decisionId: 'help_junior_dev',
    choice: 'explain_likely_related',
  },

  // Phase 4: PM Check-in
  {
    time: 58,
    type: 'agent_message',
    agentId: 'pm',
    trigger: 'check_progress',
  },
  {
    time: 62,
    type: 'user_message',
    content: "Found the bug - the validation isn't catching zero amounts. Working on the fix now.",
    typingDuration: 2500,
  },
  {
    time: 66,
    type: 'agent_message',
    agentId: 'pm',
    message: "Great work! Let me know once you have tests passing and I'll coordinate the deployment.",
  },

  // Phase 5: Code Fix
  {
    time: 72,
    type: 'user_message',
    content: "How should I structure the fix? Should I create a custom exception?",
    typingDuration: 2500,
  },
  {
    time: 76,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Good thinking! Yes, create a PaymentValidationError exception class. Then change the condition to `if amount <= 0:` and raise that exception. This makes the error explicit and easier to handle upstream.",
  },
  {
    time: 82,
    type: 'code_change',
    code: `class PaymentValidationError(ValueError):
    pass


def process_payment(amount):
    if amount <= 0:
        raise PaymentValidationError("Amount must be greater than zero")
    # Simulate gateway dispatch
    return "Success"`,
  },
  {
    time: 83,
    type: 'show_narration',
    narration: {
      agent: 'Code Editor',
      agentIcon: '⌨️',
      description: 'The student writes code with real-time AI analysis checking for bugs and security issues.',
      position: 'code',
      color: 'purple',
      duration: 5000,
      spotlight: {
        top: '110px',
        left: '340px',
        right: '420px',
        height: '400px'
      }
    },
  },
  {
    time: 85,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Looking good! The logic is now correct - rejecting zero and negative amounts. Run the tests to validate.",
  },

  // Phase 6: Test Run
  {
    time: 90,
    type: 'run_tests',
  },
  {
    time: 91,
    type: 'show_narration',
    narration: {
      agent: 'Testing Agent',
      agentIcon: '🧪',
      description: 'The Testing Agent automatically runs tests and provides instant feedback on code quality.',
      position: 'terminal',
      color: 'green',
      duration: 5000,
      spotlight: {
        bottom: '80px',
        left: '20px',
        width: '300px',
        height: '250px'
      }
    },
  },
  {
    time: 93,
    type: 'agent_message',
    agentId: 'senior_dev',
    message: "Perfect! All 12 tests passing. The fix correctly handles positive, zero, and negative amounts. Nice work!",
  },
  {
    time: 98,
    type: 'agent_message',
    agentId: 'pm',
    message: "Tests passing - excellent! That's what I like to see. I'm updating the incident status to resolved.",
  },
  {
    time: 102,
    type: 'agent_message',
    agentId: 'junior_dev',
    message: "Just tested your fix against the refund API - working perfectly! Thanks for explaining the connection earlier.",
  },

  // Phase 7: Completion
  {
    time: 108,
    type: 'agent_message',
    agentId: 'incident',
    message: "✅ All tests passed!\n\n🎉 INCIDENT CLOSED\nTotal Duration: ~2 minutes\nResolution: Payment validation logic updated\nCredential Awarded: Backend Debugging - Payments API",
  },
  {
    time: 109,
    type: 'show_narration',
    narration: {
      agent: 'SimuWork',
      agentIcon: '🎉',
      title: 'Challenge Complete!',
      description: 'Students earn verified credentials proving they successfully completed real-world company challenges.',
      position: 'top-center',
      color: 'green',
      highlight: 'Employer-recognized credentials that stand out on resumes',
      duration: 6000,
    },
  },
  {
    time: 112,
    type: 'scenario_complete',
  },
];

export default demoScript;
