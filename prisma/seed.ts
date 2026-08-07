import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();

  if (existingUsers === 0) {
    const email = 'admin@patrol.local';
    const password = 'Admin@123456';
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'System Admin',
        role: Role.ADMIN,
      },
    });

    console.log('\n=========================================');
    console.log('  PATROL SYSTEM — DEFAULT ADMIN CREATED');
    console.log('=========================================');
    console.log(`  Email   : ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  ID      : ${admin.id}`);
    console.log('=========================================');
    console.log('  ⚠️  Change this password immediately!');
    console.log('=========================================\n');
  } else {
    console.log(`Seed skipped: ${existingUsers} user(s) already exist.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
