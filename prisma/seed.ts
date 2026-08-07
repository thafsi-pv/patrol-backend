import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CHECKPOINTS = [
  { name: 'Main Gate', description: 'Main entrance security post & visitor gate', lat: 10.945061, lon: 75.941153 },
  { name: 'OP Block', description: 'Outpatient department building ground floor', lat: 10.945120, lon: 75.941200 },
  { name: 'PMSSY Block', description: 'Pradhan Mantri Swasthya Suraksha Yojana block', lat: 10.945180, lon: 75.941250 },
  { name: 'Super Speciality Block', description: 'Super speciality tertiary care unit', lat: 10.945240, lon: 75.941300 },
  { name: 'Ward 1', description: 'General Inpatient Ward 1 (Male)', lat: 10.945300, lon: 75.941350 },
  { name: 'Ward 2', description: 'General Inpatient Ward 2 (Female)', lat: 10.945360, lon: 75.941400 },
  { name: 'MCH', description: 'Maternal and Child Health wing', lat: 10.945420, lon: 75.941450 },
  { name: 'Mortuary', description: 'Mortuary rear complex & autopsy bay', lat: 10.945480, lon: 75.941500 },
  { name: 'Parking Areas', description: 'Visitor & staff multi-tier vehicle parking area', lat: 10.945540, lon: 75.941550 },
];

async function main() {
  let admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });

  if (!admin) {
    const email = 'admin@patrol.local';
    const password = 'Admin@123456';
    const passwordHash = await bcrypt.hash(password, 12);

    admin = await prisma.user.create({
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
    console.log('=========================================\n');
  }

  // Seed Checkpoints
  const createdCheckpoints: any[] = [];
  for (const item of DEFAULT_CHECKPOINTS) {
    let cp = await prisma.checkpoint.findFirst({ where: { name: item.name } });
    if (!cp) {
      cp = await prisma.checkpoint.create({
        data: {
          name: item.name,
          description: item.description,
          latitude: item.lat,
          longitude: item.lon,
          radiusMeters: 20,
          qrCode: `CP-${item.name.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.random().toString(36).slice(2, 7)}`,
          createdById: admin.id,
        },
      });
      console.log(`✅ Created Checkpoint: ${item.name}`);
    }
    createdCheckpoints.push(cp);
  }

  // Seed Main Hospital Patrol Route containing all 9 checkpoints
  let route = await prisma.route.findFirst({ where: { name: 'Hospital Master Route' } });
  if (!route) {
    route = await prisma.route.create({
      data: {
        name: 'Hospital Master Route',
        description: 'Complete security patrol covering all hospital blocks, wards, and perimeter areas.',
        checkpoints: {
          create: createdCheckpoints.map((cp, idx) => ({
            checkpointId: cp.id,
            orderIndex: idx + 1,
          })),
        },
      },
    });
    console.log(`🏆 Created Default Route: ${route.name} (${createdCheckpoints.length} checkpoints)`);
  }

  console.log('\n🌱 Seed execution completed successfully!\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
