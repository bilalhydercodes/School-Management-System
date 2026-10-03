import { AuthService } from '../services/auth.service';
import { prisma } from '../lib/db';

async function testSuperAdminLogin() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'superadmin', mode: 'insensitive' } },
  });
  console.log('Superadmin users in DB:', users);

  const res = await AuthService.login(
    { email: 'superadmin@schoolerp.in', password: 'SuperAdmin@123' },
    null
  );
  console.log('\nAuthService.login result:', res);
}

testSuperAdminLogin().finally(() => prisma.$disconnect());
