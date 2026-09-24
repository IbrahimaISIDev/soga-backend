import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Updates the (single) admin user's email/password, or creates one if none
 * exists yet. Reads from env rather than args so the real credentials never
 * appear in shell history or process listings.
 *
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... npx tsx scripts/set-admin-credentials.ts
 */
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment first.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, password: hashedPassword }
    });
    console.log(`✅ Updated admin credentials (was ${existing.email}) → ${email}`);
  } else {
    await prisma.user.create({
      data: { email, password: hashedPassword, nom: 'Admin SOGA', role: 'admin' }
    });
    console.log(`✅ Created admin user: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
