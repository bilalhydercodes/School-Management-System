import { prisma } from '@/lib/db';
import { ClerkMigrationService } from '@/services/clerk-migration.service';

/**
 * Alpha Edu Hub — Repeatable Clerk User Account Migration & Audit Script.
 *
 * Usage:
 *   npx tsx src/scripts/migrate-to-clerk.ts
 *
 * Rollback:
 *   npx tsx src/scripts/migrate-to-clerk.ts --rollback <userId>
 */
async function main() {
  console.log('================================================================');
  console.log('ALPHA EDU HUB — CLERK USER MIGRATION & AUDIT');
  console.log('================================================================\n');

  const args = process.argv.slice(2);

  if (args[0] === '--rollback' && args[1]) {
    const targetUserId = args[1];
    console.log(`Executing rollback for User ID: ${targetUserId}...`);
    const rollbackResult = await ClerkMigrationService.rollbackAccountLink(targetUserId);
    console.log('Rollback Result:', rollbackResult);
    process.exit(0);
  }

  // 1. Audit Unlinked Accounts
  const audit = await ClerkMigrationService.getUnlinkedAccountsAudit();
  console.log(`Total Active Unlinked Accounts Found: ${audit.totalUnlinked}`);
  console.log('Breakdown by Role:');
  console.table(audit.byRole);

  console.log('\nSample Unlinked Users (First 5):');
  console.table(
    audit.users.slice(0, 5).map((u) => ({
      ID: u.id,
      Email: u.email,
      Role: u.role,
      School: u.tenant?.name || 'Platform (Super Admin)',
    }))
  );

  console.log('\n================================================================');
  console.log('MIGRATION INSTRUCTIONS & DASHBOARD INTEGRATION:');
  console.log('1. Set up Clerk Dashboard with configured MFA and email/password.');
  console.log('2. As users sign in, safe auto-linking connects their Clerk identity.');
  console.log('3. Use ClerkMigrationService.linkUserAccount() for batch bulk provisioning.');
  console.log('================================================================');
}

main()
  .catch((e) => {
    console.error('Migration Script Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
