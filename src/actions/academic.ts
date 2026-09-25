'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { logAuditEvent } from '@/actions/audit';
import {
  AcademicYearSchema,
  ClassGradeSchema,
  SectionSchema,
  SubjectSchema,
  ClassSubjectTeacherSchema,
  type AcademicYearInput,
  type ClassGradeInput,
  type SectionInput,
  type SubjectInput,
  type ClassSubjectTeacherInput,
} from '@/lib/validations/academic';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get authenticated tenant context
async function getAuthContext() {
  const session = await getSessionFromCookies();
  if (!session?.sub || !session?.tenantId) {
    // Development fallback if tenantId is mock
    if (process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      if (defaultTenant) {
        return {
          userId: session?.sub || 'dev-admin-id',
          tenantId: defaultTenant.id,
          role: session?.role || 'ADMIN',
        };
      }
    }
    throw new Error('Unauthorized: No valid session');
  }
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return {
    ...session,
    userId: session.sub,
    tenantId: session.tenantId as string,
  };
}

// ==================== ACADEMIC YEAR & SESSION ACTIONS ====================

export async function createAcademicYear(input: AcademicYearInput): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthContext();
    const validation = AcademicYearSchema.safeParse(input);

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    // Use transaction if setting as current to maintain single-source-of-truth
    const result = await db.$transaction(async (tx) => {
      if (data.isCurrent) {
        await tx.academicYear.updateMany({
          where: { tenantId: session.tenantId, isCurrent: true },
          data: { isCurrent: false },
        });
      }

      const year = await tx.academicYear.create({
        data: {
          tenantId: session.tenantId,
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          isCurrent: data.isCurrent ?? false,
        },
      });

      return year;
    });

    await logAuditEvent({
      action: 'ACADEMIC_SESSION_CREATED',
      entityType: 'AcademicYear',
      entityId: result.id,
      newValues: { name: result.name, isCurrent: result.isCurrent },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: { id: result.id } };
  } catch (error: any) {
    console.error('Create Academic Year Error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'An academic session with this name already exists' };
    }
    return { success: false, error: error.message || 'Failed to create academic year' };
  }
}

export async function activateAcademicYear(id: string): Promise<ActionResult> {
  try {
    const session = await getAuthContext();

    const existing = await db.academicYear.findFirst({
      where: { id, tenantId: session.tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Academic session not found' };
    }

    await db.$transaction([
      db.academicYear.updateMany({
        where: { tenantId: session.tenantId, isCurrent: true },
        data: { isCurrent: false },
      }),
      db.academicYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
    ]);

    await logAuditEvent({
      action: 'ACADEMIC_SESSION_ACTIVATED',
      entityType: 'AcademicYear',
      entityId: id,
      newValues: { name: existing.name, isCurrent: true },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('Activate Academic Year Error:', error);
    return { success: false, error: error.message || 'Failed to activate academic session' };
  }
}

export async function updateAcademicYear(id: string, input: AcademicYearInput): Promise<ActionResult> {
  try {
    const session = await getAuthContext();
    const validation = AcademicYearSchema.safeParse(input);

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    const existing = await db.academicYear.findFirst({
      where: { id, tenantId: session.tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Academic session not found' };
    }

    await db.$transaction(async (tx) => {
      if (data.isCurrent && !existing.isCurrent) {
        await tx.academicYear.updateMany({
          where: { tenantId: session.tenantId, isCurrent: true, id: { not: id } },
          data: { isCurrent: false },
        });
      }

      await tx.academicYear.update({
        where: { id },
        data: {
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          isCurrent: data.isCurrent,
        },
      });
    });

    await logAuditEvent({
      action: 'ACADEMIC_SESSION_UPDATED',
      entityType: 'AcademicYear',
      entityId: id,
      oldValues: existing,
      newValues: data,
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('Update Academic Year Error:', error);
    return { success: false, error: error.message || 'Failed to update academic year' };
  }
}

export async function deleteAcademicYear(id: string): Promise<ActionResult> {
  try {
    const session = await getAuthContext();

    const existing = await db.academicYear.findFirst({
      where: { id, tenantId: session.tenantId },
      include: { classGrades: true },
    });

    if (!existing) {
      return { success: false, error: 'Academic year not found' };
    }

    if (existing.isCurrent) {
      return { success: false, error: 'Cannot delete the currently active academic session. Switch active session first.' };
    }

    if (existing.classGrades.length > 0) {
      return { success: false, error: 'Cannot delete academic year with existing classes/sections' };
    }

    await db.academicYear.delete({ where: { id } });

    await logAuditEvent({
      action: 'ACADEMIC_SESSION_DELETED',
      entityType: 'AcademicYear',
      entityId: id,
      oldValues: { name: existing.name },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('Delete Academic Year Error:', error);
    return { success: false, error: error.message || 'Failed to delete academic year' };
  }
}

export async function getAcademicYears() {
  try {
    const session = await getAuthContext();

    const years = await db.academicYear.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: { classGrades: true, feeStructures: true },
        },
      },
    });

    return { success: true, data: years };
  } catch (error: any) {
    console.error('Get Academic Years Error:', error);
    return { success: false, error: error.message || 'Failed to fetch academic years' };
  }
}

export async function getCurrentAcademicYear() {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
    }

    if (!tenantId) {
      return { success: false, error: 'Tenant context required' };
    }

    const current = await db.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    });

    return { success: true, data: current };
  } catch (error: any) {
    console.error('Get Current Academic Year Error:', error);
    return { success: false, error: error.message || 'Failed to fetch current academic year' };
  }
}

// ==================== CLASS GRADE ACTIONS ====================

export async function createClassGrade(input: ClassGradeInput): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthContext();
    const validation = ClassGradeSchema.safeParse(input);

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    const academicYear = await db.academicYear.findFirst({
      where: { id: data.academicYearId, tenantId: session.tenantId },
    });

    if (!academicYear) {
      return { success: false, error: 'Academic year not found' };
    }

    const classGrade = await db.classGrade.create({
      data: {
        tenantId: session.tenantId,
        academicYearId: data.academicYearId,
        name: data.name,
        numericOrder: data.numericOrder,
      },
    });

    await logAuditEvent({
      action: 'CLASS_GRADE_CREATED',
      entityType: 'ClassGrade',
      entityId: classGrade.id,
      newValues: { name: classGrade.name, numericOrder: classGrade.numericOrder },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: { id: classGrade.id } };
  } catch (error: any) {
    console.error('Create Class Grade Error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'A class with this name already exists for this academic year' };
    }
    return { success: false, error: error.message || 'Failed to create class' };
  }
}

export async function getClassGradesByYear(academicYearId?: string) {
  try {
    const session = await getAuthContext();

    let targetYearId = academicYearId;
    if (!targetYearId) {
      const currentYear = await db.academicYear.findFirst({
        where: { tenantId: session.tenantId, isCurrent: true },
      });
      targetYearId = currentYear?.id;
    }

    if (!targetYearId) {
      return { success: true, data: [] };
    }

    const classes = await db.classGrade.findMany({
      where: {
        tenantId: session.tenantId,
        academicYearId: targetYearId,
      },
      orderBy: { numericOrder: 'asc' },
      include: {
        sections: {
          include: {
            _count: {
              select: { students: true },
            },
          },
        },
      },
    });

    return { success: true, data: classes };
  } catch (error: any) {
    console.error('Get Class Grades Error:', error);
    return { success: false, error: error.message || 'Failed to fetch classes' };
  }
}

// ==================== SECTION ACTIONS & CLASS TEACHER ALLOCATION ====================

export async function createSection(input: SectionInput): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthContext();
    const validation = SectionSchema.safeParse(input);

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    const classGrade = await db.classGrade.findFirst({
      where: { id: data.classGradeId, tenantId: session.tenantId },
    });

    if (!classGrade) {
      return { success: false, error: 'Class not found' };
    }

    const section = await db.section.create({
      data: {
        tenantId: session.tenantId,
        classGradeId: data.classGradeId,
        name: data.name,
        classTeacherId: data.classTeacherId || null,
      },
    });

    await logAuditEvent({
      action: 'SECTION_CREATED',
      entityType: 'Section',
      entityId: section.id,
      newValues: { name: section.name, classGradeId: section.classGradeId, classTeacherId: section.classTeacherId },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: { id: section.id } };
  } catch (error: any) {
    console.error('Create Section Error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'A section with this name already exists for this class' };
    }
    return { success: false, error: error.message || 'Failed to create section' };
  }
}

export async function assignSectionClassTeacher(sectionId: string, teacherId: string | null): Promise<ActionResult> {
  try {
    const session = await getAuthContext();

    const existingSection = await db.section.findFirst({
      where: { id: sectionId, tenantId: session.tenantId },
      include: { classGrade: true },
    });

    if (!existingSection) {
      return { success: false, error: 'Section not found' };
    }

    if (teacherId) {
      const teacher = await db.teacherProfile.findFirst({
        where: { id: teacherId, tenantId: session.tenantId },
      });
      if (!teacher) {
        return { success: false, error: 'Teacher profile not found' };
      }
    }

    await db.section.update({
      where: { id: sectionId },
      data: { classTeacherId: teacherId },
    });

    await logAuditEvent({
      action: 'CLASS_TEACHER_ALLOCATED',
      entityType: 'Section',
      entityId: sectionId,
      oldValues: { classTeacherId: existingSection.classTeacherId },
      newValues: { classTeacherId: teacherId },
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: undefined };
  } catch (error: any) {
    console.error('Assign Class Teacher Error:', error);
    return { success: false, error: error.message || 'Failed to allocate class teacher' };
  }
}

export async function getAllClassSections() {
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

    const sections = await db.section.findMany({
      where: { tenantId },
      include: {
        classGrade: {
          include: {
            academicYear: true,
          },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: [
        { classGrade: { numericOrder: 'asc' } },
        { name: 'asc' },
      ],
    });

    // Also get teacher details for sections with classTeacherId
    const teacherIds = sections.map(s => s.classTeacherId).filter(Boolean) as string[];
    const teachers = teacherIds.length > 0 ? await db.teacherProfile.findMany({
      where: { id: { in: teacherIds } },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    }) : [];

    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    const formatted = sections.map(sec => ({
      id: sec.id,
      name: sec.name,
      fullName: `${sec.classGrade.name}-${sec.name}`,
      gradeName: sec.classGrade.name,
      academicYear: sec.classGrade.academicYear.name,
      isCurrentYear: sec.classGrade.academicYear.isCurrent,
      studentCount: sec._count.students,
      classTeacherId: sec.classTeacherId,
      classTeacherName: sec.classTeacherId && teacherMap.has(sec.classTeacherId)
        ? `${teacherMap.get(sec.classTeacherId)?.user.firstName} ${teacherMap.get(sec.classTeacherId)?.user.lastName}`
        : null,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Get All Class Sections Error:', error);
    return { success: false, error: error.message || 'Failed to fetch class sections' };
  }
}

// ==================== SUBJECT ACTIONS ====================

export async function createSubject(input: SubjectInput): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await getAuthContext();
    const validation = SubjectSchema.safeParse(input);

    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    const subject = await db.subject.create({
      data: {
        tenantId: session.tenantId,
        name: data.name,
        code: data.code,
        subjectType: data.subjectType,
        isElective: data.isElective,
      },
    });

    await logAuditEvent({
      action: 'SUBJECT_CREATED',
      entityType: 'Subject',
      entityId: subject.id,
      newValues: subject,
      tenantId: session.tenantId,
      userId: session.userId,
    });

    return { success: true, data: { id: subject.id } };
  } catch (error: any) {
    console.error('Create Subject Error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'A subject with this code already exists' };
    }
    return { success: false, error: error.message || 'Failed to create subject' };
  }
}

export async function getSubjects() {
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

    const subjects = await db.subject.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return { success: true, data: subjects };
  } catch (error: any) {
    console.error('Get Subjects Error:', error);
    return { success: false, error: error.message || 'Failed to fetch subjects' };
  }
}
