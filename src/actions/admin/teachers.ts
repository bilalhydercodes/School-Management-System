'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { CreateTeacherSchema, type CreateTeacherInput } from '@/lib/validations/teacher';
import { AuthService } from '@/services/auth.service';

export async function createTeacherAction(rawInput: CreateTeacherInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;
  const tenantId = context.tenantId;

  const validation = CreateTeacherSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    // 1. Validate employeeId uniqueness within tenant
    const existingEmp = await prisma.teacherProfile.findFirst({
      where: { tenantId, employeeId: input.employeeId.trim() },
    });
    if (existingEmp) {
      return { success: false, error: `Employee ID "${input.employeeId}" is already assigned to another teacher.` };
    }

    // 2. Validate login email uniqueness within tenant
    const existingUser = await prisma.user.findFirst({
      where: { tenantId, email: input.loginEmail.trim().toLowerCase() },
    });
    if (existingUser) {
      return { success: false, error: `Login email "${input.loginEmail}" is already registered in this school.` };
    }

    // 3. Hash temporary password
    const passwordHash = await AuthService.hashPassword(input.temporaryPassword);

    // 4. Execute atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Create Teacher User account with TEACHER role
      const user = await tx.user.create({
        data: {
          tenantId,
          email: input.loginEmail.trim().toLowerCase(),
          phone: input.phone.trim(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          role: 'TEACHER',
          passwordHash,
          avatarUrl: input.avatarUrl?.trim() || null,
          isActive: true,
          mustChangePassword: true,
        },
      });

      // Primary qualification summary
      const primaryQual = input.qualifications.length > 0 ? input.qualifications[0].qualification : 'Graduate';
      const primarySpec = input.qualifications.length > 0 ? input.qualifications[0].specialization : null;

      // 4b. Create TeacherProfile
      const teacherProfile = await tx.teacherProfile.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId: input.employeeId.trim(),
          department: input.department.trim(),
          designation: input.designation.trim(),
          qualification: primaryQual,
          specialization: primarySpec,
          joiningDate: new Date(input.joiningDate),
          employmentType: input.employmentType,
          status: 'ACTIVE',
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
          gender: input.gender || null,
          alternatePhone: input.alternatePhone?.trim() || null,
          address: input.address?.trim() || null,
          city: input.city?.trim() || null,
          state: input.state?.trim() || null,
          pinCode: input.pinCode?.trim() || null,
          qualifications: input.qualifications as any,
        },
      });

      // 4c. Create Teaching Assignments (ClassSubjectTeacher)
      if (input.assignments && input.assignments.length > 0) {
        for (const assignment of input.assignments) {
          if (!assignment.sectionId || !assignment.subjectId) continue;
          await tx.classSubjectTeacher.upsert({
            where: {
              sectionId_subjectId: {
                sectionId: assignment.sectionId,
                subjectId: assignment.subjectId,
              },
            },
            create: {
              tenantId,
              sectionId: assignment.sectionId,
              subjectId: assignment.subjectId,
              teacherId: teacherProfile.id,
            },
            update: {
              teacherId: teacherProfile.id,
            },
          });
        }
      }

      // 4d. Create AuditLog entry
      await tx.auditLog.create({
        data: {
          tenantId,
          userId: context.userId,
          action: 'TEACHER_CREATED',
          entityType: 'TeacherProfile',
          entityId: teacherProfile.id,
          newValues: {
            employeeId: teacherProfile.employeeId,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            department: teacherProfile.department,
            designation: teacherProfile.designation,
            employmentType: teacherProfile.employmentType,
            assignmentsCount: input.assignments?.length || 0,
            sendInvitation: input.sendInvitation,
          },
        },
      });

      return { teacherProfile, user };
    }, { maxWait: 10000, timeout: 25000 });

    revalidatePath('/admin/teachers');

    return {
      success: true,
      teacherId: result.teacherProfile.id,
      message: `Teacher ${result.user.firstName} ${result.user.lastName} successfully registered with Employee ID ${result.teacherProfile.employeeId}.`,
    };
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return {
      success: false,
      error: error?.message || 'Failed to create teacher profile due to an internal server error.',
    };
  }
}

export async function getTeacherFormDataAction() {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error, sections: [], subjects: [], departments: [] };
  }

  const tenantId = guard.context.tenantId;

  try {
    const [sectionsRaw, subjectsRaw, existingTeachers] = await Promise.all([
      prisma.section.findMany({
        where: { tenantId },
        include: { classGrade: true },
        orderBy: [{ classGrade: { numericOrder: 'asc' } }, { name: 'asc' }],
      }),
      prisma.subject.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      }),
      prisma.teacherProfile.findMany({
        where: { tenantId },
        select: { department: true },
      }),
    ]);

    const sections = sectionsRaw.map((s) => ({
      id: s.id,
      name: `${s.classGrade.name} - Section ${s.name}`,
      grade: s.classGrade.name,
      section: s.name,
    }));

    const subjects = subjectsRaw.map((sub) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
    }));

    const defaultDepts = [
      'Science & Technology',
      'Mathematics',
      'Languages & Literature',
      'Social Studies & Humanities',
      'Arts & Performing Arts',
      'Physical Education',
      'Computer Science & IT',
    ];

    const foundDepts = existingTeachers.map((t) => t.department).filter(Boolean);
    const departments = Array.from(new Set([...defaultDepts, ...foundDepts]));

    return {
      success: true,
      sections,
      subjects,
      departments,
    };
  } catch (err: any) {
    console.error('Error getting teacher form data:', err);
    return { success: false, error: 'Failed to load options', sections: [], subjects: [], departments: [] };
  }
}
