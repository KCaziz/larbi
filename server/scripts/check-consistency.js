// Global consistency check of the CURRENT database and storage (read-only).
//   npm run check:consistency
// Exit code 0 = consistent, 1 = violations (listed), 2 = the check could not run.
import { prisma } from '../src/config/prisma.js';
import { env } from '../src/config/env.js';
import { checkConsistency, privateDirOf } from '../src/services/consistency.service.js';

try {
  const problems = await checkConsistency(prisma, { privateDir: privateDirOf(env.storageDir) });
  if (problems.length === 0) {
    console.log('Consistent: no violation found.');
    process.exitCode = 0;
  } else {
    console.log(`${problems.length} violation(s):`);
    for (const p of problems) console.log(` - ${p.rule}: ${p.detail}`);
    process.exitCode = 1;
  }
} catch (err) {
  console.error('The consistency check could not run:', err.message);
  process.exitCode = 2;
} finally {
  await prisma.$disconnect();
}
