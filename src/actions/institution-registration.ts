'use server';

import { prisma } from '@/lib/db';
import { sendRegistrationReceivedEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import {
  InstitutionRegistrationSchema,
  type InstitutionRegistrationInput,
  type RegistrationActionResult,
} from '@/lib/schemas/institution-registration.schema';

// Schema, types and interfaces live in @/lib/schemas/institution-registration.schema
// Re-export types so existing import sites don't break
export type { InstitutionRegistrationInput, RegistrationActionResult } from '@/lib/schemas/institution-registration.schema';

/**
 * Server action to submit an institution registration application.
 * Stored with PENDING status for Super Admin review.
 */
export async function submitInstitutionRegistrationAction(
  rawInput: InstitutionRegistrationInput,
  clientIp?: string
): Promise<RegistrationActionResult> {
  // 1. Optional Rate Limiting: 10 registrations per IP per hour
  if (clientIp) {
    const rateCheck = await rateLimit({
      prefix: 'rl:institution-registration',
      key: clientIp,
      maxRequests: 10,
      windowSeconds: 3600,
      failClosed: false,
    });
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Too many registration requests from this network. Please wait a while before trying again.',
      };
    }
  }

  // 2. Validate input
  const validation = InstitutionRegistrationSchema.safeParse(rawInput);
  if (!validation.success) {
    const fieldErrors: Record<string, string> = {};
    validation.error.errors.forEach((err) => {
      const field = err.path.join('.');
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = err.message;
      }
    });

    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Please fill in all required fields accurately.',
      fieldErrors,
    };
  }

  const data = validation.data;
  const normalizedOfficialEmail = data.officialEmail.toLowerCase().trim();
  const normalizedAdminEmail = data.administratorEmail.toLowerCase().trim();

  try {
    // 3. Check for existing active Tenant with this official email
    const existingTenant = await prisma.tenant.findFirst({
      where: { email: { equals: normalizedOfficialEmail, mode: 'insensitive' } },
      select: { id: true, name: true },
    });

    if (existingTenant) {
      return {
        success: false,
        error: `An institution (${existingTenant.name}) is already registered with email ${normalizedOfficialEmail}. Please sign in or contact support.`,
      };
    }

    // 4. Check for existing pending/under-review application
    const existingApplication = await prisma.institutionApplication.findFirst({
      where: {
        OR: [
          { officialEmail: { equals: normalizedOfficialEmail, mode: 'insensitive' } },
          { administratorEmail: { equals: normalizedAdminEmail, mode: 'insensitive' } },
        ],
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      select: { id: true, applicationNumber: true, status: true },
    });

    if (existingApplication) {
      return {
        success: false,
        error: `An application with this email is already ${existingApplication.status.toLowerCase().replace('_', ' ')} (Reference: ${existingApplication.applicationNumber}). Our team will contact you shortly.`,
      };
    }

    // 5. Generate secure, collision-resistant reference number: APP-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const applicationNumber = `APP-${yearMonth}-${randomHex}`;

    // 6. Create the application record
    const application = await prisma.institutionApplication.create({
      data: {
        applicationNumber,
        institutionName: data.institutionName.trim(),
        institutionType: data.institutionType,
        officialEmail: normalizedOfficialEmail,
        officialPhone: data.officialPhone.trim(),
        website: data.website?.trim() || null,
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        country: data.country.trim() || 'India',
        postalCode: data.postalCode.trim(),
        studentCount: data.studentCount || null,
        teacherCount: data.teacherCount || null,
        staffCount: data.staffCount || null,
        campusCount: data.campusCount || 1,
        academicLevels: data.academicLevels,
        administratorName: data.administratorName.trim(),
        administratorDesignation: data.administratorDesignation,
        administratorEmail: normalizedAdminEmail,
        administratorPhone: data.administratorPhone.trim(),
        status: 'PENDING',
      },
    });

    // 7. Dispatch confirmation email (non-blocking failure)
    try {
      await sendRegistrationReceivedEmail({
        to: normalizedAdminEmail,
        recipientName: data.administratorName.trim(),
        institutionName: data.institutionName.trim(),
        applicationNumber: application.applicationNumber,
      });

      if (normalizedOfficialEmail !== normalizedAdminEmail) {
        await sendRegistrationReceivedEmail({
          to: normalizedOfficialEmail,
          recipientName: 'Administrator',
          institutionName: data.institutionName.trim(),
          applicationNumber: application.applicationNumber,
        });
      }
    } catch (emailErr) {
      console.error('[REGISTRATION-EMAIL-ERROR]', emailErr);
    }

    return {
      success: true,
      applicationId: application.id,
      applicationNumber: application.applicationNumber,
    };
  } catch (err: unknown) {
    console.error('[INSTITUTION-REGISTRATION-ERROR]', err);
    return {
      success: false,
      error: 'A server error occurred while processing your application. Please check your connection and try again.',
    };
  }
}

/**
 * Fetch application details by ID for the public status page
 */
export async function getApplicationStatusAction(applicationId: string) {
  try {
    const application = await prisma.institutionApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicationNumber: true,
        institutionName: true,
        institutionType: true,
        administratorName: true,
        administratorEmail: true,
        status: true,
        createdAt: true,
        rejectionReason: true,
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    return { success: true, application };
  } catch (err: unknown) {
    console.error('[GET-APPLICATION-STATUS-ERROR]', err);
    return { success: false, error: 'Failed to retrieve application status' };
  }
}
