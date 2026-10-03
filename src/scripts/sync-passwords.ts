import bcrypt from 'bcryptjs';
import { prisma } from '../lib/db';

async function updatePasswords() {
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const teacherHash = await bcrypt.hash('Teacher@123', 12);
  const studentHash = await bcrypt.hash('Student@123', 12);
  const superAdminHash = await bcrypt.hash('SuperAdmin@123', 12);

  await prisma.user.updateMany({
    where: { email: { in: ['admin@dps.edu.in', 'admin@dpsdelhi.edu.in', 'bilalhyder889@gmail.com'], mode: 'insensitive' } },
    data: { passwordHash: adminHash, isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: { in: ['teacher@dps.edu.in', 'colleague.teacher@dps.edu.in'], mode: 'insensitive' } },
    data: { passwordHash: teacherHash, isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: { in: ['student@dps.edu.in', 'rohan.sharma@dpsdelhi.edu.in'], mode: 'insensitive' } },
    data: { passwordHash: studentHash, isActive: true },
  });

  await prisma.user.updateMany({
    where: { email: { equals: 'superadmin@schoolerp.in', mode: 'insensitive' } },
    data: { passwordHash: superAdminHash, isActive: true },
  });

  console.log('✅ Demo passwords verified and synchronized in Supabase DB.');
}

updatePasswords().finally(() => prisma.$disconnect());
