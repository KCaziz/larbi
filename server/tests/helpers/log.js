// Captures what the (in-process) server writes with console.warn / console.error,
// so a test can assert on security events and keep the test report quiet.
export function captureConsole(method = 'warn') {
  const original = console[method];
  const lines = [];
  console[method] = (...args) => {
    lines.push(args.map((a) => (a instanceof Error ? a.stack : String(a))).join(' '));
  };
  return {
    lines,
    restore() {
      console[method] = original;
    },
    // Parsed JSON lines of type "security" (see src/utils/securityLog.js).
    events() {
      return lines
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter((event) => event?.type === 'security');
    },
  };
}
