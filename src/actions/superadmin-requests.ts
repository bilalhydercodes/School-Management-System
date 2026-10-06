'use server';

import crypto from 'crypto';
import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { AuthService } from '@/services/auth.service';
import { sendApplicationApprovedEmail, sendApplicationRejectedEmail } from '@/lib/email';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 45) || 'school'
  );
}

/**
 * Super Admin: Fetch institution applications with filtering and search
 */
export async function getInstitutionApplicationsAction({
  status,
  search,
  page = 1,
  limit = 20,
}: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const guard = await requireAuthGuard([Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  try {
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { institutionName: { contains: q, mode: 'insensitive' } },
        { applicationNumber: { contains: q, mode: 'insensitive' } },
        { administratorEmail: { contains: q, mode: 'insensitive' } },
        { officialEmail: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.institutionApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewedBy: {
            select: { firstName: true, lastName: true, email: true },
          },
          tenant: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.institutionApplication.count({ where }),
    ]);

    return {
      success: true,
      applications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err: unknown) {
    console.error('[GET-APPLICATIONS-ERROR]', err);
    return { success: false, error: 'Failed to retrieve institution applications' };
  }
}

/**
 * Super Admin: Fetch single institution application with full details
 */
export async function getInstitutionApplicationByIdAction(applicationId: string) {
  const guard = await requireAuthGuard([Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: applicationId },
      include: {
        reviewedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        tenant: {
          select: { id: true, name: true, slug: true, createdAt: true },
        },
        adminUser: {
          select: { id: true, firstName: true, lastName: true, email: true, isActive: true },
        },
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    return { success: true, application };
  } catch (err: unknown) {
    console.error('[GET-APPLICATION-BY-ID-ERROR]', err);
    return { success: false, error: 'Failed to load application details' };
  }
}

/**
 * Super Admin: Mark application as UNDER_REVIEW
 */
export async function markApplicationUnderReviewAction(applicationId: string) {
  const guard = await requireAuthGuard([Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  try {
    const app = await prisma.institutionApplication.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true },
    });

    if (!app) return { success: false, error: 'Application not found' };
    if (app.status !== 'PENDING') {
      return { success: true, message: `Application is already ${app.status}` };
    }

    await prisma.institutionApplication.update({
      where: { id: applicationId },
      data: {
        status: 'UNDER_REVIEW',
        reviewedById: guard.context.userId,
      },
    });

    revalidatePath('/superadmin/institution-requests');
    return { success: true };
  } catch (err: unknown) {
    console.error('[MARK-UNDER-REVIEW-ERROR]', err);
    return { success: false, error: 'Failed to update application review state' };
  }
}

/**
 * Super Admin: Approve institution application transactionally.
 * Provisions Tenant, Branding, Subdomain, Academic Year, starter Class/Section, and Inactive Admin User.
 * Dispatches expiring activation link via email.
 */
export async function approveInstitutionApplicationAction(applicationId: string) {
  const guard = await requireAuthGuard([Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const reviewerUserId = guard.context.userId;

  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    // Idempotency: If already approved, do not re-provision
    if (application.status === 'APPROVED' && application.tenantId && application.activationToken) {
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'alphaeduhub.in';
      const protocol = appDomain.includes('localhost') ? 'http' : 'https';
      const activationLink = `${protocol}://${appDomain}/register/activate?token=${application.activationToken}`;

      return {
        success: true,
        message: 'Institution was already approved.',
        tenantId: application.tenantId,
        activationLink,
      };
    }

    if (application.status === 'REJECTED') {
      return {
        success: false,
        error: 'Cannot approve an application that was marked as REJECTED. Create a new request if needed.',
      };
    }

    // 1. Determine unique slug
    let baseSlug = slugify(application.institutionName);
    let candidateSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.tenant.findUnique({
        where: { slug: candidateSlug },
        select: { id: true },
      });
      if (!existing) break;
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Select default subscription plan
    const defaultPlan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultPlan) {
      return {
        success: false,
        error: 'No active Subscription Plan found in database to assign to this institution.',
      };
    }

    // 3. Generate activation token & temporary cryptographic hash for user
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const tempPasswordHash = await AuthService.hashPassword(crypto.randomUUID());

    // Split admin name
    const nameParts = application.administratorName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Administrator';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 4. Atomic Execution across all tenant components
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 4a. Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: application.institutionName.trim(),
          slug: candidateSlug,
          email: application.officialEmail.toLowerCase().trim(),
          phone: application.officialPhone.trim(),
          address: application.address.trim(),
          city: application.city.trim(),
          state: application.state.trim(),
          pincode: application.postalCode.trim(),
          board: application.institutionType === 'College' ? 'STATE_BOARD' : 'CBSE',
          subscriptionPlanId: defaultPlan.id,
          subscriptionStatus: 'ACTIVE',
          isActive: true,
        },
      });

      // 4b. Create Tenant Branding
      await tx.tenantBranding.create({
        data: {
          tenantId: newTenant.id,
          primaryColor: '#008CFF',
          secondaryColor: '#F4F6F9',
          accentColor: '#10B981',
          tagline: 'Empowering Brighter Tomorrows',
        },
      });

      // 4c. Create Subdomain
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'alphaeduhub.in';
      const defaultSubdomain = `${candidateSlug}.${appDomain}`;

      await tx.tenantDomain.create({
        data: {
          tenantId: newTenant.id,
          domain: defaultSubdomain,
          isPrimary: true,
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      // 4d. Create Initial Academic Year
      const currentYear = new Date().getFullYear();
      const academicYear = await tx.academicYear.create({
        data: {
          tenantId: newTenant.id,
          name: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
          startDate: new Date(`${currentYear}-04-01T00:00:00Z`),
          endDate: new Date(`${currentYear + 1}-03-31T23:59:59Z`),
          isCurrent: true,
        },
      });

      // 4e. Create Starter Class & Section
      const starterClass = await tx.classGrade.create({
        data: {
          tenantId: newTenant.id,
          academicYearId: academicYear.id,
          name: application.institutionType === 'College' ? 'Year 1' : 'Class 1',
          numericOrder: 1,
        },
      });

      await tx.section.create({
        data: {
          tenantId: newTenant.id,
          classGradeId: starterClass.id,
          name: 'A',
        },
      });

      // 4f. Create Administrator User (inactive until activation)
      const adminUser = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          email: application.administratorEmail.toLowerCase().trim(),
          phone: application.administratorPhone.trim(),
          passwordHash: tempPasswordHash,
          firstName,
          lastName,
          role: 'ADMIN',
          isActive: false, // Activated via secure activation link
          mustChangePassword: true,
        },
      });

      // 4g. Update InstitutionApplication
      const updatedApp = await tx.institutionApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          tenantId: newTenant.id,
          adminUserId: adminUser.id,
          activationToken,
          activationExpiresAt,
          reviewedById: reviewerUserId,
          reviewedAt: new Date(),
        },
      });

      // 4h. Audit Trail Record
      await tx.auditLog.create({
        data: {
          tenantId: newTenant.id,
          userId: reviewerUserId,
          action: 'INSTITUTION_APPLICATION_APPROVED',
          entityType: 'InstitutionApplication',
          entityId: applicationId,
          newValues: {
            applicationNumber: application.applicationNumber,
            institutionName: newTenant.name,
            slug: newTenant.slug,
            adminEmail: adminUser.email,
          },
        },
      });

      return {
        tenantId: newTenant.id,
        tenantName: newTenant.name,
        adminEmail: adminUser.email,
        activationToken,
      };
    });

    // 5. Construct secure activation link and dispatch notification
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
    const protocol = appDomain.includes('localhost') || appDomain.includes('127.0.0.1') ? 'http' : 'https';
    const activationLink = `${protocol}://${appDomain}/register/activate?token=${transactionResult.activationToken}`;

    try {
      await sendApplicationApprovedEmail({
        to: transactionResult.adminEmail,
        recipientName: application.administratorName,
        institutionName: transactionResult.tenantName,
        activationLink,
      });
    } catch (emailErr) {
      console.error('[ACTIVATION-EMAIL-DISPATCH-ERROR]', emailErr);
    }

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');
    revalidatePath('/superadmin/institution-requests');

    return {
      success: true,
      tenantId: transactionResult.tenantId,
      adminEmail: transactionResult.adminEmail,
      activationLink,
    };
  } catch (err: unknown) {
    console.error('[APPROVE-APPLICATION-ERROR]', err);
    return {
      success: false,
      error: 'An unexpected database error occurred during approval. The transaction was safely rolled back.',
    };
  }
}

/**
 * Super Admin: Reject institution application with required reason
 */
export async function rejectInstitutionApplicationAction({
  applicationId,
  reason,
}: {
  applicationId: string;
  reason: string;
}) {
  const guard = await requireAuthGuard([Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: 'A clear rejection reason (minimum 5 characters) is required.' };
  }

  const reviewerUserId = guard.context.userId;

  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) return { success: false, error: 'Application not found' };

    if (application.status === 'APPROVED') {
      return {
        success: false,
        error: 'Cannot reject an application that has already been approved and provisioned.',
      };
    }

    if (application.status === 'REJECTED') {
      return { success: true, message: 'Application was already rejected' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.institutionApplication.update({
        where: { id: applicationId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason.trim(),
          reviewedById: reviewerUserId,
          reviewedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerUserId,
          action: 'INSTITUTION_APPLICATION_REJECTED',
          entityType: 'InstitutionApplication',
          entityId: applicationId,
          newValues: {
            applicationNumber: application.applicationNumber,
            institutionName: application.institutionName,
            reason: reason.trim(),
          },
        },
      });
    });

    try {
      await sendApplicationRejectedEmail({
        to: application.administratorEmail,
        recipientName: application.administratorName,
        institutionName: application.institutionName,
        reason: reason.trim(),
      });
    } catch (emailErr) {
      console.error('[REJECTION-EMAIL-DISPATCH-ERROR]', emailErr);
    }

    revalidatePath('/superadmin/institution-requests');
    return { success: true };
  } catch (err: unknown) {
    console.error('[REJECT-APPLICATION-ERROR]', err);
    return { success: false, error: 'Failed to reject application' };
  }
}

/**
 * Public: Validate activation token for administrator setup
 */
export async function verifyActivationTokenAction(token: string) {
  if (!token || token.trim().length < 16) {
    return { success: false, error: 'Invalid or missing activation token.' };
  }

  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { activationToken: token.trim() },
      include: {
        tenant: { select: { name: true, slug: true } },
        adminUser: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true } },
      },
    });

    if (!application) {
      return { success: false, error: 'Activation token is invalid or does not exist.' };
    }

    if (application.activatedAt) {
      return {
        success: false,
        error: 'This administrator account has already been activated. You can sign in using your credentials.',
        alreadyActivated: true,
      };
    }

    if (application.activationExpiresAt && application.activationExpiresAt < new Date()) {
      return {
        success: false,
        error: 'This activation invitation has expired (validity: 7 days). Please contact platform support for a new invitation link.',
        expired: true,
      };
    }

    if (!application.adminUser) {
      return { success: false, error: 'No administrator profile associated with this activation request.' };
    }

    return {
      success: true,
      institutionName: application.tenant?.name || application.institutionName,
      adminEmail: application.adminUser.email,
      adminName: `${application.adminUser.firstName} ${application.adminUser.lastName}`.trim(),
    };
  } catch (err: unknown) {
    console.error('[VERIFY-ACTIVATION-TOKEN-ERROR]', err);
    return { success: false, error: 'Failed to verify activation token.' };
  }
}

/**
 * Public: Activate administrator account by setting secure password
 */
export async function activateAdminAccountAction({
  token,
  password,
}: {
  token: string;
  password: string;
}) {
  if (!token || token.trim().length < 16) {
    return { success: false, error: 'Invalid activation token.' };
  }

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { activationToken: token.trim() },
      include: {
        adminUser: true,
        tenant: true,
      },
    });

    if (!application || !application.adminUser) {
      return { success: false, error: 'Invalid or unrecognized activation token.' };
    }

    if (application.activatedAt) {
      return { success: false, error: 'This administrator account has already been activated.' };
    }

    if (application.activationExpiresAt && application.activationExpiresAt < new Date()) {
      return { success: false, error: 'Activation token has expired.' };
    }

    // 1. Hash new password securely
    const newPasswordHash = await AuthService.hashPassword(password);

    // 2. Transactionally activate user and update application
    await prisma.$transaction(async (tx) => {
      // Activate user account
      await tx.user.update({
        where: { id: application.adminUserId! },
        data: {
          passwordHash: newPasswordHash,
          isActive: true,
          mustChangePassword: false,
        },
      });

      // Clear token and mark activated
      await tx.institutionApplication.update({
        where: { id: application.id },
        data: {
          activatedAt: new Date(),
          activationToken: null, // Single-use consumption
        },
      });

      // Log activation in audit trail
      await tx.auditLog.create({
        data: {
          tenantId: application.tenantId,
          userId: application.adminUserId,
          action: 'ADMIN_ACCOUNT_ACTIVATED',
          entityType: 'User',
          entityId: application.adminUserId,
          newValues: {
            email: application.adminUser?.email,
            institutionName: application.institutionName,
          },
        },
      });
    });

    return {
      success: true,
      message: 'Account successfully activated!',
      email: application.adminUser.email,
    };
  } catch (err: unknown) {
    console.error('[ACTIVATE-ADMIN-ACCOUNT-ERROR]', err);
    return { success: false, error: 'Failed to activate administrator account.' };
  }
}
