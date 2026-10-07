// Startup file for cPanel "Setup Node.js App" (Phusion Passenger).
// Passenger loads its startup file with require(), which cannot load this
// project's ES modules directly: this CommonJS file simply imports the real
// entry point. Locally, keep using `npm start` (src/server.js).
import('./src/server.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
