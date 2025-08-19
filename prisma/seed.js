/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function utcDate(y, m, d, hr, min) {
  return new Date(Date.UTC(y, m, d, hr, min, 0, 0));
}

function* generateSlotsForRange(fromDate, toDate) {
  // 30-min blocks from 09:00 to 17:00 UTC inclusive end at 17:00
  const startHour = 9;
  const endHour = 17;
  for (let d = new Date(fromDate); d <= toDate; d.setUTCDate(d.getUTCDate() + 1)) {
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const startAt = utcDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), h, m);
        const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);
        yield { startAt, endAt };
      }
    }
  }
}

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, PATIENT_EMAIL, PATIENT_PASSWORD, PATIENT_NAME } = process.env;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  // Seed admin user
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin seed.');
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: { name: ADMIN_NAME || 'Admin', passwordHash, role: 'admin' },
      create: { name: ADMIN_NAME || 'Admin', email: ADMIN_EMAIL, passwordHash, role: 'admin' },
    });
    console.log('Admin user ensured.');
  }

  // Optional demo patient
  if (PATIENT_EMAIL && PATIENT_PASSWORD) {
    const passwordHash = await bcrypt.hash(PATIENT_PASSWORD, 10);
    await prisma.user.upsert({
      where: { email: PATIENT_EMAIL },
      update: { name: PATIENT_NAME || 'Patient', passwordHash, role: 'patient' },
      create: { name: PATIENT_NAME || 'Patient', email: PATIENT_EMAIL, passwordHash, role: 'patient' },
    });
    console.log('Patient user ensured.');
  }

  // Seed slots for next 7 days (UTC)
  const now = new Date();
  const from = utcDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0);
  const to = utcDate(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 6, 23, 59);
  const slots = [];
  for (const { startAt, endAt } of generateSlotsForRange(new Date(from), new Date(to))) {
    slots.push({ startAt, endAt });
  }

  // Use createMany with skipDuplicates
  if (slots.length > 0) {
    await prisma.slot.createMany({
      data: slots.map((s) => ({ startAt: s.startAt, endAt: s.endAt })),
      skipDuplicates: true,
    });
    console.log(`Ensured ${slots.length} slots for next 7 days.`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


