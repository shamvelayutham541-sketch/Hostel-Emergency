/**
 * SLA Escalation Monitor Service
 * Runs every 15 seconds to check for unacknowledged incidents exceeding SLA thresholds.
 */
const store = require('../models/dataStore');

class EscalationService {
  constructor() {
    this.timer = null;
  }

  start(io) {
    if (this.timer) clearInterval(this.timer);

    this.timer = setInterval(async () => {
      try {
        const now = Date.now();
        const pendingIncidents = await store.incidents.find({
          status: 'pending',
          slaBreached: { $ne: true }
        });

        for (const inc of pendingIncidents) {
          if (inc.slaDeadline && new Date(inc.slaDeadline).getTime() < now) {
            // SLA breached! Auto escalate
            console.log(`🚨 [SLA BREACH] Incident ${inc._id} exceeded SLA deadline! Auto-escalating to Chief Warden.`);
            
            const updated = await store.incidents.findByIdAndUpdate(inc._id, {
              slaBreached: true,
              priority: 'critical',
              escalated: true,
              escalatedAt: new Date().toISOString(),
              escalatedTo: 'Chief Warden & Security Control Room'
            });

            await store.incidentTimelines.create({
              incidentId: inc._id,
              action: '⚠️ SLA BREACH - AUTOMATIC ESCALATION',
              performedBy: 'System Watchdog Engine',
              details: `Incident remained unacknowledged past the ${inc.priority.toUpperCase()} SLA target. Escalated with maximum emergency alert status!`
            });

            if (io) {
              io.emit('incident:escalated', {
                incidentId: inc._id,
                reason: 'SLA Response Window Breached',
                incident: updated
              });
              io.emit('incident:updated', {
                incidentId: inc._id,
                updates: { slaBreached: true, priority: 'critical', escalated: true }
              });
            }
          }
        }
      } catch (err) {
        console.error('[EscalationService Error]:', err.message);
      }
    }, 15000);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}

module.exports = new EscalationService();
