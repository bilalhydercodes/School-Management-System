'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { safeRevalidatePath } from '@/lib/revalidate';
import { invalidateTenantCache } from '@/lib/tenant-cache';

const CreateClassSchema = z.object({
  name: z.string().trim().min(1, 'Class name is required').max(50, 'Class name too long'),
  numericOrder: z.number().int().min(0).max(100).optional(),
  initialSections: z.array(z.string().trim().min(1).max(20)).optional(),
});

const CreateSectionSchema = z.object({
  classGradeId: z.string().uuid('Valid Class ID required'),
  name: z.string().trim().min(1, 'Section name is required').max(20, 'Section name too long'),
  classTeacherId: z.string().uuid().optional().nullable(),
});

const DeleteEntitySchema = z.object({
  id: z.string().uuid('Valid ID required'),
});

/**
 * Helper to ensure a valid academic year exists for the tenant.
 */
async function resolveCurrentAcademicYear(tenantId: string) {
  let academicYear = await prisma.academicYear.findFirst({
    where: { tenantId, isCurrent: true },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.findFirst({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  if (!academicYear) {
    const currentYear = new Date().getFullYear();
    academicYear = await prisma.academicYear.create({
      data: {
        tenantId,
        name: `${currentYear}-${currentYear + 1}`,
        startDate: new Date(`${currentYear}-04-01`),
        endDate: new Date(`${currentYear + 1}-03-31`),
        isCurrent: true,
      },
    });
  }

  return academicYear;
}

/**
 * 1. Create a new Class / Grade with optional initial sections.
 */
export async function createClassGradeAction(rawInput: z.infer<typeof CreateClassSchema>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const parseRes = CreateClassSchema.safeParse(rawInput);
  if (!parseRes.success) {
    return { success: false as const, error: parseRes.error.errors[0]?.message || 'Invalid input' };
  }

  const { name, numericOrder: providedOrder, initialSections } = parseRes.data;
  const tenantId = guard.context.tenantId;

  try {
    const academicYear = await resolveCurrentAcademicYear(tenantId);

    // Check if class with this name already exists in this academic year
    const existing = await prisma.classGrade.findFirst({
      where: {
        tenantId,
        academicYearId: academicYear.id,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (existing) {
      return { success: false as const, error: `A class named "${name}" already exists for this academic session.` };
    }

    // Determine numericOrder if not supplied
    let numericOrder = providedOrder;
    if (numericOrder === undefined) {
      const match = name.match(/\d+/);
      if (match) {
        numericOrder = parseInt(match[0], 10);
      } else {
        const highest = await prisma.classGrade.findFirst({
          where: { tenantId, academicYearId: academicYear.id },
          orderBy: { numericOrder: 'desc' },
          select: { numericOrder: true },
        });
        numericOrder = (highest?.numericOrder ?? 0) + 1;
      }
    }

    // Sanitized section names (defaults to ['A'] if none specified)
    const sectionNames = initialSections && initialSections.length > 0
      ? Array.from(new Set(initialSections.map((s) => s.trim().toUpperCase()).filter(Boolean)))
      : ['A'];

    const result = await prisma.$transaction(async (tx) => {
      const newClass = await tx.classGrade.create({
        data: {
          tenantId,
          academicYearId: academicYear.id,
          name: name.trim(),
          numericOrder,
        },
      });

      const createdSections = [];
      for (const secName of sectionNames) {
        const sec = await tx.section.create({
          data: {
            tenantId,
            classGradeId: newClass.id,
            name: secName,
          },
        });
        createdSections.push(sec);
      }

      return { ...newClass, sections: createdSections };
    });

    invalidateTenantCache(tenantId, 'academics');
    invalidateTenantCache(tenantId, 'dashboard');
    invalidateTenantCache(tenantId, 'students');
    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/students');
    safeRevalidatePath('/admin/timetable');

    return { success: true as const, classGrade: result };
  } catch (err: unknown) {
    console.error('[CREATE_CLASS_GRADE_ERROR]', err);
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed to create class grade.' };
  }
}

/**
 * 2. Create a new Section under an existing Class Grade.
 */
export async function createSectionAction(rawInput: z.infer<typeof CreateSectionSchema>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const parseRes = CreateSectionSchema.safeParse(rawInput);
  if (!parseRes.success) {
    return { success: false as const, error: parseRes.error.errors[0]?.message || 'Invalid input' };
  }

  const { classGradeId, name, classTeacherId } = parseRes.data;
  const tenantId = guard.context.tenantId;

  try {
    const classGrade = await prisma.classGrade.findFirst({
      where: { id: classGradeId, tenantId },
    });

    if (!classGrade) {
      return { success: false as const, error: 'Target class not found.' };
    }

    const cleanSectionName = name.trim().toUpperCase();

    // Check for duplicate section name in this class
    const existingSection = await prisma.section.findFirst({
      where: {
        classGradeId,
        name: { equals: cleanSectionName, mode: 'insensitive' },
      },
    });

    if (existingSection) {
      return {
        success: false as const,
        error: `Section "${cleanSectionName}" already exists in ${classGrade.name}.`,
      };
    }

    // If teacher provided, verify they belong to tenant
    if (classTeacherId) {
      const teacher = await prisma.teacherProfile.findFirst({
        where: { id: classTeacherId, tenantId },
      });
      if (!teacher) {
        return { success: false as const, error: 'Selected class teacher not found.' };
      }
    }

    const section = await prisma.section.create({
      data: {
        tenantId,
        classGradeId,
        name: cleanSectionName,
        classTeacherId: classTeacherId || null,
      },
      include: {
        classGrade: true,
        classTeacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    invalidateTenantCache(tenantId, 'academics');
    invalidateTenantCache(tenantId, 'dashboard');
    invalidateTenantCache(tenantId, 'students');
    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/students');
    safeRevalidatePath('/admin/timetable');

    return { success: true as const, section };
  } catch (err: unknown) {
    console.error('[CREATE_SECTION_ERROR]', err);
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed to create section.' };
  }
}

/**
 * 3. Delete / Remove a Section safely (prevents deleting sections with active students).
 */
export async function deleteSectionAction(rawInput: z.infer<typeof DeleteEntitySchema>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const tenantId = guard.context.tenantId;
  const { id } = rawInput;

  try {
    const section = await prisma.section.findFirst({
      where: { id, tenantId },
      include: {
        _count: {
          select: { students: true, timetableEntries: true },
        },
        classGrade: { select: { name: true } },
      },
    });

    if (!section) {
      return { success: false as const, error: 'Section not found.' };
    }

    if (section._count.students > 0) {
      return {
        success: false as const,
        error: `Cannot delete Section ${section.name} (${section.classGrade.name}): ${section._count.students} active student(s) are enrolled. Please transfer students first.`,
      };
    }

    await prisma.section.delete({
      where: { id },
    });

    invalidateTenantCache(tenantId, 'academics');
    invalidateTenantCache(tenantId, 'dashboard');
    invalidateTenantCache(tenantId, 'students');
    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/students');

    return { success: true as const };
  } catch (err: unknown) {
    console.error('[DELETE_SECTION_ERROR]', err);
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed to delete section.' };
  }
}

/**
 * 4. Delete / Remove a Class Grade safely (prevents deleting if students enrolled).
 */
export async function deleteClassGradeAction(rawInput: z.infer<typeof DeleteEntitySchema>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const tenantId = guard.context.tenantId;
  const { id } = rawInput;

  try {
    const classGrade = await prisma.classGrade.findFirst({
      where: { id, tenantId },
      include: {
        sections: {
          include: {
            _count: { select: { students: true } },
          },
        },
      },
    });

    if (!classGrade) {
      return { success: false as const, error: 'Class not found.' };
    }

    const totalStudents = classGrade.sections.reduce((acc, s) => acc + s._count.students, 0);
    if (totalStudents > 0) {
      return {
        success: false as const,
        error: `Cannot delete ${classGrade.name}: ${totalStudents} active student(s) enrolled across its sections. Please reassign students first.`,
      };
    }

    await prisma.classGrade.delete({
      where: { id },
    });

    invalidateTenantCache(tenantId, 'academics');
    invalidateTenantCache(tenantId, 'dashboard');
    invalidateTenantCache(tenantId, 'students');
    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/students');

    return { success: true as const };
  } catch (err: unknown) {
    console.error('[DELETE_CLASS_GRADE_ERROR]', err);
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed to delete class grade.' };
  }
}

/**
 * 5. Update or Assign Class Teacher for a Section.
 */
export async function assignClassTeacherAction(sectionId: string, classTeacherId: string | null) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const tenantId = guard.context.tenantId;

  try {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, tenantId },
    });

    if (!section) {
      return { success: false as const, error: 'Section not found.' };
    }

    if (classTeacherId) {
      const teacher = await prisma.teacherProfile.findFirst({
        where: { id: classTeacherId, tenantId },
      });
      if (!teacher) {
        return { success: false as const, error: 'Teacher not found.' };
      }
    }

    const updated = await prisma.section.update({
      where: { id: sectionId },
      data: { classTeacherId },
      include: {
        classGrade: true,
        classTeacher: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    invalidateTenantCache(tenantId, 'academics');
    safeRevalidatePath('/admin/academics');

    return { success: true as const, section: updated };
  } catch (err: unknown) {
    console.error('[ASSIGN_CLASS_TEACHER_ERROR]', err);
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed to assign class teacher.' };
  }
}
