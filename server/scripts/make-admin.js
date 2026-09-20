// Gives (or removes) the administrator role of an existing account.
//   npm run make-admin -- someone@example.com
//   npm run make-admin -- someone@example.com --remove
// The role can never be set from the public site (by design): this is the only
// supported way, and it needs access to the server and its database.
import { prisma } from '../src/config/prisma.js';

const [email, flag] = process.argv.slice(2);
if (!email || email.startsWith('--')) {
  console.error('Usage: npm run make-admin -- <email> [--remove]');
  process.exit(2);
}

try {
  const role = flag === '--remove' ? 'user' : 'admin';
  const user = await prisma.user.update({ where: { email: email.trim().toLowerCase() }, data: { role } });
  console.log(`${user.email} is now "${user.role}". Log out and back in is not required: the role is read on every request.`);
} catch (err) {
  console.error(err?.code === 'P2025' ? `No account with the email ${email}. Register it on the site first.` : err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
