'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { logAuditEvent } from '@/actions/audit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const TeacherCreationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid institutional email is required'),
  phone: z.string().min(8, 'Phone number is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.string().optional(),
  joiningDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid joining date'),
  classTeacherSectionId: z.string().uuid().optional().nullable(),
});

export type TeacherCreationInput = z.infer<typeof TeacherCreationSchema>;

export async function createTeacherProfile(input: TeacherCreationInput) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;
    let userId = session?.sub;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
      userId = userId || 'dev-admin-id';
    }

    if (!tenantId || (session?.role && !['ADMIN', 'SUPER_ADMIN'].includes(session.role))) {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const validation = TeacherCreationSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    // Check duplicate employee ID or email
    const existingEmp = await db.teacherProfile.findFirst({
      where: { tenantId, employeeId: data.employeeId },
    });

    if (existingEmp) {
      return { success: false, error: 'A teacher with this Employee ID already exists' };
    }

    const existingUser = await db.user.findFirst({
      where: { tenantId, email: data.email },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' };
    }

    // Default password for teacher: DPS@<EmpId>
    const defaultPassword = `DPS@${data.employeeId.replace(/[^a-zA-Z0-9]/g, '')}`;
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const result = await db.$transaction(async (tx) => {
      // 1. Create User account with TEACHER role
      const user = await tx.user.create({
        data: {
          tenantId,
          email: data.email,
          phone: data.phone,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'TEACHER',
          isActive: true,
        },
      });

      // 2. Create Teacher Profile
      const teacher = await tx.teacherProfile.create({
        data: {
          tenantId,
          userId: user.id,
          employeeId: data.employeeId,
          department: data.department,
          qualification: data.qualification,
          specialization: data.specialization || null,
          joiningDate: new Date(data.joiningDate),
        },
      });

      // 3. If assigned as Class Teacher for a section, update Section
      if (data.classTeacherSectionId) {
        await tx.section.update({
          where: { id: data.classTeacherSectionId },
          data: { classTeacherId: teacher.id },
        });
      }

      return teacher;
    });

    await logAuditEvent({
      action: 'TEACHER_CREATED',
      entityType: 'TeacherProfile',
      entityId: result.id,
      newValues: {
        employeeId: result.employeeId,
        name: `${data.firstName} ${data.lastName}`,
        department: result.department,
      },
      tenantId,
      userId,
    });

    return { success: true, data: { id: result.id, employeeId: result.employeeId } };
  } catch (error: any) {
    console.error('Create Teacher Profile Error:', error);
    return { success: false, error: error.message || 'Failed to create teacher profile' };
  }
}

export async function toggleTeacherActiveStatus(teacherId: string, isActive: boolean) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;
    let userId = session?.sub;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
      userId = userId || 'dev-admin-id';
    }

    if (!tenantId || (session?.role && !['ADMIN', 'SUPER_ADMIN'].includes(session.role))) {
      return { success: false, error: 'Forbidden: Admin access required' };
    }

    const teacher = await db.teacherProfile.findFirst({
      where: { id: teacherId, tenantId },
      include: { user: true },
    });

    if (!teacher) {
      return { success: false, error: 'Teacher not found' };
    }

    // Toggle active flag on User model (preserves all historical relations without deletion)
    await db.user.update({
      where: { id: teacher.userId },
      data: { isActive },
    });

    await logAuditEvent({
      action: isActive ? 'TEACHER_ACTIVATED' : 'TEACHER_DEACTIVATED',
      entityType: 'TeacherProfile',
      entityId: teacherId,
      oldValues: { isActive: teacher.user.isActive },
      newValues: { isActive },
      tenantId,
      userId,
    });

    return { success: true, data: { isActive } };
  } catch (error: any) {
    console.error('Toggle Teacher Status Error:', error);
    return { success: false, error: error.message || 'Failed to update teacher status' };
  }
}

export async function getFacultyDirectory(search?: string) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
    }

    if (!tenantId) {
      return { success: false, error: 'Unauthorized' };
    }

    const teachers = await db.teacherProfile.findMany({
      where: {
        tenantId,
        ...(search
          ? {
              OR: [
                { employeeId: { contains: search, mode: 'insensitive' } },
                { department: { contains: search, mode: 'insensitive' } },
                { user: { firstName: { contains: search, mode: 'insensitive' } } },
                { user: { lastName: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        classSubjects: {
          include: {
            subject: true,
            section: {
              include: { classGrade: true },
            },
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    // Also find sections where teacher is classTeacherId
    const mentoredSections = await db.section.findMany({
      where: { tenantId, classTeacherId: { not: null } },
      include: { classGrade: true },
    });

    const mentorMap = new Map<string, string[]>();
    for (const sec of mentoredSections) {
      if (sec.classTeacherId) {
        const list = mentorMap.get(sec.classTeacherId) || [];
        list.push(`${sec.classGrade.name}-${sec.name}`);
        mentorMap.set(sec.classTeacherId, list);
      }
    }

    const formatted = teachers.map((t) => {
      const isClassTeacher = mentorMap.has(t.id);
      const classTeacherOf = isClassTeacher ? mentorMap.get(t.id)?.join(', ') : undefined;
      const subjectsList = Array.from(new Set(t.classSubjects.map(cs => cs.subject.code || cs.subject.name))).join(', ');
      const assignedClassesList = Array.from(
        new Set(t.classSubjects.map(cs => `Class ${cs.section.classGrade.name}-${cs.section.name}`))
      ).join(', ');

      return {
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        empId: t.employeeId,
        dept: t.department,
        qualification: t.qualification,
        subjects: subjectsList || 'General',
        assignedClasses: classTeacherOf ? `Class ${classTeacherOf} (CT)${assignedClassesList ? `, ${assignedClassesList}` : ''}` : (assignedClassesList || 'General Pool'),
        isClassTeacher,
        classTeacherOf: classTeacherOf ? `Class ${classTeacherOf}` : undefined,
        isActive: t.user.isActive,
        phone: t.user.phone || '+91 98112 00000',
        email: t.user.email,
        joiningDate: t.joiningDate.toISOString().split('T')[0],
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Get Faculty Directory Error:', error);
    return { success: false, error: error.message || 'Failed to fetch faculty directory' };
  }
}
