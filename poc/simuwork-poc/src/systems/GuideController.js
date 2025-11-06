// GuideController.js - Manages automatic narration tooltips during demo
import { eventBus, EventTypes } from './EventBus';

class GuideController {
  constructor() {
    this.currentNarration = null;
    this.subscribers = [];
    this.autoHideTimer = null;
  }

  /**
   * Show a narration tooltip
   */
  showNarration(narration) {
    // Clear any existing auto-hide timer
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
    }

    this.currentNarration = narration;
    this.notifySubscribers();

    // Auto-hide after duration (default 6 seconds)
    const duration = narration.duration || 6000;
    this.autoHideTimer = setTimeout(() => {
      this.hideNarration();
    }, duration);

    eventBus.publish(EventTypes.NARRATION_SHOWN, { narration });
  }

  /**
   * Hide current narration
   */
  hideNarration() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }

    this.currentNarration = null;
    this.notifySubscribers();
  }

  /**
   * Get the current narration
   */
  getCurrentNarration() {
    return this.currentNarration;
  }

  /**
   * Reset the guide
   */
  reset() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    this.currentNarration = null;
    this.notifySubscribers();
  }

  /**
   * Subscribe to narration changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  /**
   * Notify all subscribers of changes
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.currentNarration));
  }
}

// Singleton instance
export const guideController = new GuideController();
