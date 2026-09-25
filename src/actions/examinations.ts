'use server';

import { db } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { logAuditEvent } from '@/actions/audit';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const SaveMarksSchema = z.object({
  examTermId: z.string().uuid().optional(),
  examName: z.string().min(1),
  subjectCode: z.string().min(1),
  sectionName: z.string().min(1),
  maxMarks: z.number().min(1),
  marks: z.array(
    z.object({
      studentId: z.string().uuid(),
      marksObtained: z.number().min(0),
      remarks: z.string().optional(),
    })
  ),
});

export type SaveMarksInput = z.infer<typeof SaveMarksSchema>;

function calculateCbseGrade(marks: number, max: number): { grade: string; gradePoint: number } {
  const pct = max > 0 ? (marks / max) * 100 : 0;
  if (pct >= 91) return { grade: 'A1', gradePoint: 10.0 };
  if (pct >= 81) return { grade: 'A2', gradePoint: 9.0 };
  if (pct >= 71) return { grade: 'B1', gradePoint: 8.0 };
  if (pct >= 61) return { grade: 'B2', gradePoint: 7.0 };
  if (pct >= 51) return { grade: 'C1', gradePoint: 6.0 };
  if (pct >= 41) return { grade: 'C2', gradePoint: 5.0 };
  if (pct >= 33) return { grade: 'D', gradePoint: 4.0 };
  return { grade: 'E', gradePoint: 0.0 };
}

export async function saveRapidMarksGrid(input: SaveMarksInput) {
  try {
    const session = await getSessionFromCookies();
    let tenantId = session?.tenantId;
    let userId = session?.sub;

    if (!tenantId && process.env.NODE_ENV === 'development') {
      const defaultTenant = await db.tenant.findFirst();
      tenantId = defaultTenant?.id;
      userId = userId || 'dev-teacher-id';
    }

    if (!tenantId) {
      return { success: false, error: 'Unauthorized' };
    }

    const validation = SaveMarksSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const data = validation.data;

    // Find current active academic year
    const activeYear = await db.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    });

    if (!activeYear) {
      return { success: false, error: 'No active academic session found' };
    }

    // Find or create Exam Term
    let examTerm = await db.examTerm.findFirst({
      where: { tenantId, academicYearId: activeYear.id, name: data.examName },
    });

    if (!examTerm) {
      examTerm = await db.examTerm.create({
        data: {
          tenantId,
          academicYearId: activeYear.id,
          name: data.examName,
          startDate: new Date(),
          endDate: new Date(),
        },
      });
    }

    if (examTerm.isLocked) {
      return { success: false, error: 'This examination term has been locked and published by the administration. Edits are disabled.' };
    }

    // Find Subject
    let subject = await db.subject.findFirst({
      where: { tenantId, code: data.subjectCode },
    });

    if (!subject) {
      subject = await db.subject.create({
        data: {
          tenantId,
          name: data.subjectCode,
          code: data.subjectCode,
        },
      });
    }

    // Find Class Grade
    const classGradeName = data.sectionName.split('-')[0].replace('Class ', '').trim();
    let classGrade = await db.classGrade.findFirst({
      where: { tenantId, academicYearId: activeYear.id, name: classGradeName },
    });

    if (!classGrade) {
      classGrade = await db.classGrade.create({
        data: {
          tenantId,
          academicYearId: activeYear.id,
          name: classGradeName,
          numericOrder: 10,
        },
      });
    }

    // Find or create ExamSchedule
    let schedule = await db.examSchedule.findFirst({
      where: {
        tenantId,
        examTermId: examTerm.id,
        classGradeId: classGrade.id,
        subjectId: subject.id,
      },
    });

    if (!schedule) {
      schedule = await db.examSchedule.create({
        data: {
          tenantId,
          examTermId: examTerm.id,
          classGradeId: classGrade.id,
          subjectId: subject.id,
          examDate: new Date(),
          startTime: '09:00',
          endTime: '12:00',
          maxMarks: new Prisma.Decimal(data.maxMarks),
          passingMarks: new Prisma.Decimal(Math.ceil(data.maxMarks * 0.33)),
        },
      });
    }

    // Upsert Exam Results
    await db.$transaction(async (tx) => {
      for (const item of data.marks) {
        const { grade, gradePoint } = calculateCbseGrade(item.marksObtained, data.maxMarks);
        await tx.examResult.upsert({
          where: {
            examScheduleId_studentId: {
              examScheduleId: schedule.id,
              studentId: item.studentId,
            },
          },
          update: {
            marksObtained: new Prisma.Decimal(item.marksObtained),
            grade,
            gradePoint: new Prisma.Decimal(gradePoint),
            remarks: item.remarks || null,
            enteredById: userId || schedule.id,
          },
          create: {
            tenantId,
            examScheduleId: schedule.id,
            studentId: item.studentId,
            marksObtained: new Prisma.Decimal(item.marksObtained),
            grade,
            gradePoint: new Prisma.Decimal(gradePoint),
            remarks: item.remarks || null,
            enteredById: userId || schedule.id,
          },
        });
      }
    });

    await logAuditEvent({
      action: 'MARKS_RECORDED',
      entityType: 'ExamResult',
      entityId: schedule.id,
      newValues: {
        examName: data.examName,
        subject: data.subjectCode,
        section: data.sectionName,
        studentsGraded: data.marks.length,
      },
      tenantId,
      userId,
    });

    return { success: true, data: { count: data.marks.length } };
  } catch (error: any) {
    console.error('Save Rapid Marks Error:', error);
    return { success: false, error: error.message || 'Failed to save marks' };
  }
}

export async function getExamAuditSummary() {
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

    const schedules = await db.examSchedule.findMany({
      where: { tenantId },
      include: {
        examTerm: true,
        classGrade: true,
        subject: true,
        results: true,
      },
      orderBy: { examDate: 'desc' },
      take: 20,
    });

    const formatted = schedules.map(s => {
      const totalStudents = s.results.length;
      const scores = s.results.map(r => Number(r.marksObtained));
      const avg = totalStudents > 0 ? (scores.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1) : '0';
      const highest = totalStudents > 0 ? Math.max(...scores) : 0;
      const lowest = totalStudents > 0 ? Math.min(...scores) : 0;

      return {
        id: s.id,
        examName: s.examTerm.name,
        className: s.classGrade.name,
        subject: s.subject.name,
        subjectCode: s.subject.code,
        maxMarks: Number(s.maxMarks),
        studentsGraded: totalStudents,
        average: avg,
        highest,
        lowest,
        isPublished: s.examTerm.isLocked,
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Get Exam Audit Summary Error:', error);
    return { success: false, error: error.message || 'Failed to fetch exam audit summary' };
  }
}
