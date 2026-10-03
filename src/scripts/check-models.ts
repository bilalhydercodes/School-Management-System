import { prisma } from '../lib/db';

async function checkPrismaModels() {
  const models = [
    'user',
    'tenant',
    'studentProfile',
    'parentProfile',
    'studentAttendance',
    'feeInvoice',
    'examResult',
    'subject',
    'timetableEntry',
    'notice',
    'emergencyContact',
    'event',
    'holiday',
    'notification'
  ];

  for (const m of models) {
    console.log(`prisma.${m}:`, typeof (prisma as any)[m]);
    if ((prisma as any)[m]) {
      console.log(`  prisma.${m}.findMany:`, typeof (prisma as any)[m].findMany);
    }
  }
}
checkPrismaModels();
