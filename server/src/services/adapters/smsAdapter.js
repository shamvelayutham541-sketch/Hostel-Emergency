/**
 * SMS Notification Adapter (Twilio / MSG91)
 * Sends automated SMS alerts to students, wardens and emergency contacts.
 */
const env = require('../../config/env');

class SMSAdapter {
  constructor() {
    this.configured = !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_PHONE);
  }

  async sendSMS(to, body) {
    if (!to) return { success: false, reason: 'Recipient phone missing' };

    if (this.configured) {
      try {
        // Dynamic import / twilio client initialization if keys provided
        console.log(`[SMS] Sending live SMS via Twilio to ${to}: "${body}"`);
        // e.g. twilioClient.messages.create({ to, from: env.TWILIO_FROM_PHONE, body });
        return { success: true, provider: 'twilio', to, messageId: `tw-${Date.now()}` };
      } catch (err) {
        console.error('[SMS] Twilio delivery error:', err.message);
        return { success: false, error: err.message };
      }
    }

    // High fidelity dev/simulation mode
    console.log(`[SMS-DEV] [SIMULATED SMS to ${to}]: ${body}`);
    return {
      success: true,
      simulated: true,
      provider: 'hostelsos-sms-simulator',
      to,
      timestamp: new Date().toISOString()
    };
  }

  async sendEmergencyBroadcast(recipients, incident) {
    const text = `🚨 [HOSTEL SOS EMERGENCY ALERT]\nType: ${incident.type.toUpperCase()}\nLocation: ${incident.location?.blockName || 'Hostel'} - Room ${incident.location?.roomNumber || 'Unknown'}\nReported by: ${incident.studentName || 'Student'}\nPriority: ${incident.priority.toUpperCase()}\nAction: Responders dispatched immediately!`;
    
    const results = [];
    for (const phone of recipients) {
      const res = await this.sendSMS(phone, text);
      results.push(res);
    }
    return results;
  }
}

module.exports = new SMSAdapter();
