// Security events worth a trace (refused media access, abuse limits reached).
// One JSON line per event on stderr, easy to grep or ship to a log collector.
// Only ids are recorded: no file names, no storage keys, no personal data.
export function logSecurityEvent(event, details = {}) {
  console.warn(JSON.stringify({ type: 'security', event, at: new Date().toISOString(), ...details }));
}
