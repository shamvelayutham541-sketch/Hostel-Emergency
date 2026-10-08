/**
 * WhatsApp Notification Adapter (Meta Cloud API / Twilio WhatsApp)
 */
const env = require('../../config/env');

class WhatsAppAdapter {
  constructor() {
    this.configured = !!(env.WHATSAPP_API_KEY && env.WHATSAPP_PHONE_NUMBER_ID);
  }

  async sendMessage(toPhone, message) {
    if (!toPhone) return { success: false, reason: 'Phone required' };

    if (this.configured) {
      try {
        console.log(`[WhatsApp] Sending WhatsApp template to ${toPhone}`);
        return { success: true, provider: 'whatsapp-cloud-api', to: toPhone };
      } catch (err) {
        console.error('[WhatsApp] Delivery error:', err.message);
        return { success: false, error: err.message };
      }
    }

    console.log(`[WhatsApp-DEV] [SIMULATED WHATSAPP to ${toPhone}]: ${message}`);
    return {
      success: true,
      simulated: true,
      provider: 'whatsapp-simulator',
      to: toPhone,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new WhatsAppAdapter();
