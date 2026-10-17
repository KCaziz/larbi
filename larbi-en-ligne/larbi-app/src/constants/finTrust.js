// Trust and data centre (P6-19), screen C25. Lifts the "droit à l'effacement"
// point P5-05 left open: a self-service, complete and immediate deletion now
// exists.
//
// « Suppression selon la politique légale » never branches on a retention
// obligation in this platform: the client's own decision (2026-10-11, P6-01
// point 9) is that account deletion is always complete and immediate, with no
// retention period to honour. DELETION_POLICY says so, so the screen and the
// API state the client's own decision instead of a sentence somebody wrote.
export const DELETION_POLICY = { immediate: true, retentionDays: 0 };

// « Appareils connectés »: nothing in FINCLUDIA persists a session — the
// cookie carries a signed, stateless token (services/token.service.js), and
// there is no session table to read a device list FROM. Declared here rather
// than invented: building a real device list is a session-tracking feature
// of its own, not a screen that merely reads one.
export const DEVICES_BLOCKED = { reason: 'noSessionTracking' };

// What "complétude" checks, mechanically — never a creditworthiness
// judgement, which is why the client's own words forbid calling it one.
export const COMPLETENESS_CHECKS = ['public', 'onboarding', 'income', 'budget', 'goal', 'consents'];
