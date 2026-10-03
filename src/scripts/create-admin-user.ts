import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'bilalhyder889@gmail.com';
  console.log(`Setting up Admin user for: ${email}...`);

  try {
    // 1. Ensure at least one active tenant (school) exists
    let tenant = await prisma.tenant.findFirst({
      where: { isActive: true },
    });

    if (!tenant) {
      console.log('Creating default Alpha School tenant...');
      tenant = await prisma.tenant.create({
        data: {
          name: 'Alpha Edu Hub Demo School',
          slug: 'alpha-school',
          email: 'admin@alphaschool.edu',
          board: 'CBSE',
          isActive: true,
          subscriptionStatus: 'ACTIVE',
        },
      });
    }

    // 2. Hash default fallback password
    const passwordHash = await bcrypt.hash('Admin@123456', 12);

    // 3. Upsert user as ADMIN / SUPER_ADMIN
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    let user;
    if (existingUser) {
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'ADMIN',
          tenantId: tenant.id,
          isActive: true,
          firstName: 'Bilal',
          lastName: 'Hyder',
        },
      });
      console.log(`✅ Existing user updated to ADMIN role: ${user.id} (${user.email})`);
    } else {
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName: 'Bilal',
          lastName: 'Hyder',
          role: 'ADMIN',
          tenantId: tenant.id,
          isActive: true,
        },
      });
      console.log(`✅ Created new ADMIN user: ${user.id} (${user.email})`);
    }

    console.log(`
==================================================
ADMIN ACCOUNT READY:
Email:    ${user.email}
Role:     ${user.role}
Tenant:   ${tenant.name} (${tenant.slug})
Status:   ACTIVE

You can now:
1. Sign in via Clerk at http://localhost:3000/sign-in with ${user.email}
2. The server will automatically link your Clerk session and grant full Admin access!
==================================================
    `);
  } catch (err) {
    console.error('Error creating admin user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
