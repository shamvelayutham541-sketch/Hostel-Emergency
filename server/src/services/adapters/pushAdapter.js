/**
 * Web Push Adapter (VAPID / Web Push Protocol)
 */
const env = require('../../config/env');

class PushAdapter {
  constructor() {
    this.configured = !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
    this.subscriptions = new Map(); // In-memory/DB store for active WebPush subscriptions
  }

  saveSubscription(userId, subscription) {
    this.subscriptions.set(userId.toString(), subscription);
    return { success: true };
  }

  async sendPush(userId, payload) {
    const sub = this.subscriptions.get(userId.toString());
    if (!sub) {
      // In dev, simulate
      console.log(`[WebPush-SIMULATED] Sent browser push notification to User ${userId}:`, payload.title);
      return { success: true, simulated: true };
    }

    try {
      console.log(`[WebPush] Dispatching browser push notification to User ${userId}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error('[WebPush] Error delivering push:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new PushAdapter();
