const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
};

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  incident: (action, id, user) => console.log(`🚨 [INCIDENT-EVENT] [${action}] IncidentID: ${id} | TriggeredBy: ${user}`)
};
