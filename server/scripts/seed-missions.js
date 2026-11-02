// npm run missions:seed — adds the drafted missions V1 that are missing (P8-34).
import { prisma } from '../src/config/prisma.js';
import { ensureMissionCatalogue } from '../src/services/finMissionCatalogue.service.js';

try {
  const created = await ensureMissionCatalogue(prisma);
  console.log(created.length === 0 ? 'Missions already in place.' : `${created.length} mission(s) added: ${created.join(', ')}`);
} finally {
  await prisma.$disconnect();
}
