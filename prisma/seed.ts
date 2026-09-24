import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sogasenegal.com' },
    update: {},
    create: {
      email: 'admin@sogasenegal.com',
      password: hashedPassword,
      nom: 'Admin SOGA',
      role: 'admin'
    }
  });

  console.log('✅ Created admin user:', admin.email);
  console.log('🔑 Default password: admin123');
  console.log('⚠️  Please change the password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
