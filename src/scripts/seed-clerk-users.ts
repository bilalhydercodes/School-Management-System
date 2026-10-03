import fs from 'fs';
import path from 'path';
import { createClerkClient } from '@clerk/nextjs/server';
import { prisma } from '../lib/db';

// Load .env variables if not already present in environment
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = val.trim();
        }
      }
    }
  }
} catch {}

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
});

/**
 * Script to automatically seed and sync all demo users from PostgreSQL database into Clerk Dashboard
 */
async function syncDemoUsersToClerk() {
  console.log('🔄 Syncing demo accounts into Clerk Dashboard...');

  const demoAccounts = [
    {
      email: 'admin@dps.edu.in',
      password: 'Admin@12345678',
      firstName: 'Rajesh',
      lastName: 'Sharma',
    },
    {
      email: 'teacher@dps.edu.in',
      password: 'Teacher@12345678',
      firstName: 'Anandita',
      lastName: 'Sen',
    },
    {
      email: 'student@dps.edu.in',
      password: 'Student@12345678',
      firstName: 'Rohan',
      lastName: 'Sharma',
    },
    {
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@12345678',
      firstName: 'Platform',
      lastName: 'SuperAdmin',
    },
  ];

  for (const account of demoAccounts) {
    try {
      console.log(`\nCreating / Verifying in Clerk: ${account.email}...`);

      // Check if user already exists in Clerk
      const existingClerkUsers = await clerk.users.getUserList({
        emailAddress: [account.email],
      });

      let clerkUser;
      if (existingClerkUsers.data && existingClerkUsers.data.length > 0) {
        clerkUser = existingClerkUsers.data[0];
        console.log(`  ℹ️ User already exists in Clerk with ID: ${clerkUser.id}`);
      } else {
        // Create user in Clerk
        clerkUser = await clerk.users.createUser({
          emailAddress: [account.email],
          password: account.password,
          firstName: account.firstName,
          lastName: account.lastName,
          skipPasswordChecks: true,
        });
        console.log(`  ✅ Created user in Clerk: ${clerkUser.id}`);
      }

      // Link clerkUserId in database
      const dbUser = await prisma.user.findFirst({
        where: { email: { equals: account.email, mode: 'insensitive' } },
      });

      if (dbUser) {
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { clerkUserId: clerkUser.id },
        });
        console.log(`  🔗 Successfully linked in Supabase PostgreSQL: DB User (${dbUser.id}) <-> Clerk (${clerkUser.id})`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
      console.warn(`  ⚠️ Notice for ${account.email}:`, errorMsg);
    }
  }

  console.log('\n==================================================');
  console.log('✅ DEMO USERS SYNCED TO CLERK & SUPABASE');
  console.log('==================================================');
}

syncDemoUsersToClerk()
  .catch((e) => {
    console.error('Clerk Sync Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
