/**
 * Alpha Edu Hub — Synthetic Test Data Database Seeder
 * 
 * Safely provisions deterministic synthetic test records for TEST_INST_A and TEST_INST_B.
 * Idempotent: checks for existence before creation and never mutates production data.
 */

import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { TEST_ACCOUNTS } from '../accounts';
import {
  SYNTHETIC_DATA_INSTITUTION_A,
  SYNTHETIC_DATA_INSTITUTION_B,
  type SyntheticInstitutionData,
} from './generator';
import {
  Role,
  SubjectType,
  AttendanceStatus,
  InvoiceStatus,
  PaymentStatus,
  SubscriptionStatus,
  FeedbackCycleFrequency,
  FeedbackCycleStatus,
  FeedbackQuestionType,
  GradeGroup,
  DayOfWeek,
} from '@prisma/client';

export async function seedSyntheticInstitution(data: SyntheticInstitutionData) {
  console.log(`[Seeder] Provisioning synthetic institution: ${data.tenantCode} (${data.tenantName})...`);

  const passwordHash = await bcrypt.hash(TEST_ACCOUNTS.institutionA.admin.password, 10);

  // 1. Subscription Plan & Tenant & Branding
  let defaultPlan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
  });
  if (!defaultPlan) {
    defaultPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Enterprise Test Plan',
        priceMonthly: 0,
        priceYearly: 0,
        maxStudents: 5000,
        maxStaff: 500,
        features: ['all'],
        isActive: true,
      },
    });
  }

  let tenant = await prisma.tenant.findUnique({
    where: { slug: data.tenantSlug },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: data.tenantName,
        slug: data.tenantSlug,
        email: `contact@${data.tenantSlug}.test`,
        phone: '+91 98765 00000',
        address: '123 Synthetic Tech Campus',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        board: data.board,
        subscriptionPlanId: defaultPlan.id,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        isActive: true,
        branding: {
          create: {
            primaryColor: '#0B72E7',
            secondaryColor: '#F4F6F9',
            accentColor: '#FA896B',
            tagline: 'Excellence in Synthetic Education',
          },
        },
      },
    });
  }

  // 2. Academic Year
  let academicYear = await prisma.academicYear.findFirst({
    where: { tenantId: tenant.id, name: data.academics.academicYearName },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        tenantId: tenant.id,
        name: data.academics.academicYearName,
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
      },
    });
  }

  // 3. Class Grade & Section
  let classGrade = await prisma.classGrade.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, name: data.academics.className },
  });

  if (!classGrade) {
    classGrade = await prisma.classGrade.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: data.academics.className,
        numericOrder: data.academics.classNumericOrder,
      },
    });
  }

  let section = await prisma.section.findFirst({
    where: { tenantId: tenant.id, classGradeId: classGrade.id, name: data.academics.sectionName },
  });

  if (!section) {
    section = await prisma.section.create({
      data: {
        tenantId: tenant.id,
        classGradeId: classGrade.id,
        name: data.academics.sectionName,
      },
    });
  }

  // 4. Subjects
  const subjectRecords: any[] = [];
  for (const s of data.academics.subjects) {
    let sub = await prisma.subject.findFirst({
      where: { tenantId: tenant.id, code: s.code },
    });
    if (!sub) {
      sub = await prisma.subject.create({
        data: {
          tenantId: tenant.id,
          name: s.name,
          code: s.code,
          subjectType: SubjectType.THEORY,
        },
      });
    }
    subjectRecords.push(sub);
  }

  // 5. Admin User
  let adminUser = await prisma.user.findFirst({
    where: { email: data.users.admin.email },
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: data.users.admin.email,
        passwordHash,
        firstName: data.users.admin.firstName,
        lastName: data.users.admin.lastName,
        role: Role.ADMIN,
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }

  // 6. Accountant User
  let accountantUser = await prisma.user.findFirst({
    where: { email: data.users.accountant.email },
  });
  if (!accountantUser) {
    accountantUser = await prisma.user.create({
      data: {
        email: data.users.accountant.email,
        passwordHash,
        firstName: data.users.accountant.firstName,
        lastName: data.users.accountant.lastName,
        role: Role.ACCOUNTANT,
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }

  // 7. Teacher User & Profile
  let teacherUser = await prisma.user.findFirst({
    where: { email: data.users.teacher.email },
  });
  if (!teacherUser) {
    teacherUser = await prisma.user.create({
      data: {
        email: data.users.teacher.email,
        passwordHash,
        firstName: data.users.teacher.firstName,
        lastName: data.users.teacher.lastName,
        role: Role.TEACHER,
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }

  let teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: teacherUser.id },
  });
  if (!teacherProfile) {
    teacherProfile = await prisma.teacherProfile.create({
      data: {
        userId: teacherUser.id,
        tenantId: tenant.id,
        employeeId: data.users.teacher.employeeId,
        department: data.users.teacher.department,
        designation: 'Senior Faculty',
        qualification: 'M.Sc., B.Ed.',
        joiningDate: new Date('2022-06-01'),
      },
    });
  }

  // Assign teacher to first subject in section
  const assignment = await prisma.classSubjectTeacher.findFirst({
    where: {
      tenantId: tenant.id,
      sectionId: section.id,
      subjectId: subjectRecords[0].id,
      teacherId: teacherProfile.id,
    },
  });
  if (!assignment) {
    await prisma.classSubjectTeacher.create({
      data: {
        tenantId: tenant.id,
        sectionId: section.id,
        subjectId: subjectRecords[0].id,
        teacherId: teacherProfile.id,
      },
    });
  }

  // 8. Student User & Profile
  let studentUser = await prisma.user.findFirst({
    where: { email: data.users.student.email },
  });
  if (!studentUser) {
    studentUser = await prisma.user.create({
      data: {
        email: data.users.student.email,
        passwordHash,
        firstName: data.users.student.firstName,
        lastName: data.users.student.lastName,
        role: Role.STUDENT,
        tenantId: tenant.id,
        isActive: true,
      },
    });
  }

  let studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: studentUser.id },
  });
  if (!studentProfile) {
    studentProfile = await prisma.studentProfile.create({
      data: {
        userId: studentUser.id,
        tenantId: tenant.id,
        sectionId: section.id,
        admissionNumber: data.users.student.admissionNumber,
        rollNumber: parseInt(data.users.student.rollNumber.replace(/\D/g, ''), 10) || 1,
        dateOfBirth: new Date('2011-05-15'),
        gender: 'Male',
        address: '123 Test Street, Synthetic City',
        emergencyContact: '+91 98765 43210',
        admissionDate: new Date('2023-04-01'),
      },
    });
  }

  // 9. Parent User & Profile & Link
  let parentUser = await prisma.user.findFirst({
    where: { email: data.users.parent.email },
  });
  if (!parentUser) {
    parentUser = await prisma.user.create({
      data: {
        email: data.users.parent.email,
        passwordHash,
        firstName: data.users.parent.firstName,
        lastName: data.users.parent.lastName,
        role: Role.PARENT,
        tenantId: tenant.id,
        phone: data.users.parent.phone,
        isActive: true,
      },
    });
  }

  let parentProfile = await prisma.parentProfile.findUnique({
    where: { userId: parentUser.id },
  });
  if (!parentProfile) {
    parentProfile = await prisma.parentProfile.create({
      data: {
        userId: parentUser.id,
        tenantId: tenant.id,
      },
    });
  }

  const link = await prisma.parentStudentLink.findFirst({
    where: { parentId: parentProfile.id, studentId: studentProfile.id },
  });
  if (!link) {
    await prisma.parentStudentLink.create({
      data: {
        tenantId: tenant.id,
        parentId: parentProfile.id,
        studentId: studentProfile.id,
        isPrimary: true,
      },
    });
  }

  // 10. Daily Attendance Sample
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceRecord = await prisma.studentAttendance.findFirst({
    where: {
      tenantId: tenant.id,
      studentId: studentProfile.id,
      date: today,
    },
  });
  if (!attendanceRecord) {
    await prisma.studentAttendance.create({
      data: {
        tenantId: tenant.id,
        studentId: studentProfile.id,
        sectionId: section.id,
        date: today,
        status: AttendanceStatus.PRESENT,
      },
    });
  }

  // 11. Fee Category & Invoice
  let feeCategory = await prisma.feeCategory.findFirst({
    where: { tenantId: tenant.id, name: data.fees.categoryName },
  });
  if (!feeCategory) {
    feeCategory = await prisma.feeCategory.create({
      data: {
        tenantId: tenant.id,
        name: data.fees.categoryName,
        description: 'Synthetic recurring academic tuition',
      },
    });
  }

  let feeInvoice = await prisma.feeInvoice.findFirst({
    where: { tenantId: tenant.id, invoiceNumber: data.fees.invoiceNumber },
  });
  if (!feeInvoice) {
    feeInvoice = await prisma.feeInvoice.create({
      data: {
        tenantId: tenant.id,
        studentId: studentProfile.id,
        academicYearId: academicYear.id,
        invoiceNumber: data.fees.invoiceNumber,
        totalAmount: data.fees.amount,
        paidAmount: 0,
        netAmount: data.fees.amount,
        balanceAmount: data.fees.amount,
        dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: InvoiceStatus.PENDING,
        items: {
          create: [
            {
              tenantId: tenant.id,
              feeCategoryId: feeCategory.id,
              amount: data.fees.amount,
              description: data.fees.categoryName,
            },
          ],
        },
      },
    });
  }

  // 12. Exam Term & Result
  let examTerm = await prisma.examTerm.findFirst({
    where: { tenantId: tenant.id, name: data.exams.termName },
  });
  if (!examTerm) {
    examTerm = await prisma.examTerm.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: data.exams.termName,
        startDate: new Date(data.exams.examDate),
        endDate: new Date(data.exams.examDate),
      },
    });
  }

  let examSchedule = await prisma.examSchedule.findFirst({
    where: {
      tenantId: tenant.id,
      examTermId: examTerm.id,
      subjectId: subjectRecords[0].id,
      classGradeId: classGrade.id,
    },
  });
  if (!examSchedule) {
    examSchedule = await prisma.examSchedule.create({
      data: {
        tenantId: tenant.id,
        examTermId: examTerm.id,
        subjectId: subjectRecords[0].id,
        classGradeId: classGrade.id,
        examDate: new Date(data.exams.examDate),
        startTime: '09:00',
        endTime: '12:00',
        maxMarks: data.exams.maxMarks,
        passingMarks: data.exams.passingMarks,
      },
    });
  }

  const examResult = await prisma.examResult.findFirst({
    where: { examScheduleId: examSchedule.id, studentId: studentProfile.id },
  });
  if (!examResult) {
    await prisma.examResult.create({
      data: {
        tenantId: tenant.id,
        examScheduleId: examSchedule.id,
        studentId: studentProfile.id,
        marksObtained: data.exams.score,
        grade: 'A1',
        enteredById: adminUser.id,
      },
    });
  }

  // 13. Notice / Announcement
  const notice = await prisma.notice.findFirst({
    where: { tenantId: tenant.id, title: data.announcements.title },
  });
  if (!notice) {
    await prisma.notice.create({
      data: {
        tenantId: tenant.id,
        title: data.announcements.title,
        content: data.announcements.content,
        targetAudience: 'ALL',
        priority: 'NORMAL',
        authorId: adminUser.id,
      },
    });
  }

  console.log(`[Seeder] Finished synthetic provisioning for ${data.tenantCode}.`);
  return { tenant, academicYear, classGrade, section, adminUser, teacherUser, studentUser, parentUser };
}

export async function seedGlobalSuperAdmin() {
  const passwordHash = await bcrypt.hash(TEST_ACCOUNTS.superAdmin.password, 10);
  let superAdmin = await prisma.user.findFirst({
    where: { email: TEST_ACCOUNTS.superAdmin.email },
  });

  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        email: TEST_ACCOUNTS.superAdmin.email,
        passwordHash,
        firstName: 'Global',
        lastName: 'Super-Administrator',
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });
    console.log('[Seeder] Created Global Super Admin account.');
  }
  return superAdmin;
}

export async function runFullSyntheticSeed() {
  console.log('\n======================================================');
  console.log(' SEEDING DETERMINISTIC MULTI-TENANT SYNTHETIC DATA');
  console.log('======================================================\n');

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await seedGlobalSuperAdmin();
      await seedSyntheticInstitution(SYNTHETIC_DATA_INSTITUTION_A);
      await seedSyntheticInstitution(SYNTHETIC_DATA_INSTITUTION_B);
      console.log('\n[Seeder] Multi-tenant synthetic seeding complete.\n');
      return;
    } catch (err: any) {
      console.warn(`[Seeder] Attempt ${attempt} failed with error: ${err.message}`);
      if (attempt === 3) throw err;
      console.log('[Seeder] Retrying in 2 seconds...');
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Allow direct CLI execution: npx tsx tests/fixtures/test-data/seeder.ts
if (require.main === module) {
  runFullSyntheticSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seeder] Fatal error:', err);
      process.exit(1);
    });
}
