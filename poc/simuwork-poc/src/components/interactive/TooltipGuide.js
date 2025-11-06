// TooltipGuide.js - Automatic narration balloons for demo presentation
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TooltipGuide.css';

const TooltipGuide = ({ narration }) => {
  if (!narration) return null;

  const getPositionStyle = () => {
    const positions = {
      'top-left': { top: '80px', left: '20px' },
      'top-center': { top: '80px', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '80px', right: '20px' },
      'center-left': { top: '50%', left: '20px', transform: 'translateY(-50%)' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'center-right': { top: '50%', right: '20px', transform: 'translateY(-50%)' },
      'bottom-left': { bottom: '80px', left: '20px' },
      'bottom-center': { bottom: '80px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '80px', right: '20px' },
      'objectives': { top: '120px', left: '40px' },
      'code': { top: '150px', left: '50%', transform: 'translateX(-50%)' },
      'messages': { top: '120px', right: '40px' },
      'terminal': { bottom: '120px', left: '40px' }
    };
    return positions[narration.position] || positions['center'];
  };

  const getPointerClass = () => {
    if (narration.position && narration.position.includes('top')) return 'pointer-top';
    if (narration.position && narration.position.includes('bottom')) return 'pointer-bottom';
    if (narration.position && narration.position.includes('left')) return 'pointer-left';
    if (narration.position && narration.position.includes('right')) return 'pointer-right';
    return '';
  };

  return (
    <AnimatePresence>
      <motion.div
        className="tooltip-guide-overlay-narration"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`tooltip-balloon ${getPointerClass()} ${narration.color || 'blue'}`}
          style={getPositionStyle()}
          initial={{ scale: 0.5, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Agent Icon */}
          {narration.agent && (
            <div className="guide-agent-header">
              <span className="guide-agent-icon">{narration.agentIcon || '🤖'}</span>
              <span className="guide-agent-name">{narration.agent}</span>
            </div>
          )}

          {/* Title */}
          {narration.title && (
            <h3 className="guide-title">{narration.title}</h3>
          )}

          {/* Description */}
          <p className="guide-description">{narration.description}</p>

          {/* Highlight specific info */}
          {narration.highlight && (
            <div className="guide-highlight">
              <span className="highlight-icon">✨</span>
              {narration.highlight}
            </div>
          )}
        </motion.div>

        {/* Spotlight effect */}
        {narration.spotlight && (
          <motion.div
            className="spotlight-indicator"
            style={narration.spotlight}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TooltipGuide;
