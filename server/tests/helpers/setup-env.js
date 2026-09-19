// Import this FIRST in a test that loads application modules without booting the
// server: it sets the test environment before src/config/env.js reads it.
import { applyTestEnv } from './env.js';

applyTestEnv();
