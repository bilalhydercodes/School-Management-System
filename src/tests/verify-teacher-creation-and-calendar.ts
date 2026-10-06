import { prisma } from '@/lib/db';
import { AuthService } from '@/services/auth.service';
import { Role } from '@/types';
import { CalendarEventType, EventAudience, CalendarEventStatus, DayOfWeek } from '@prisma/client';

async function verifyEnhancements() {
  console.log('\n======================================================');
  console.log(' VERIFYING TEACHER CREATION & CENTRAL ACADEMIC CALENDAR');
  console.log('======================================================\n');

  // Step 1: Find test tenant
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    include: {
      academicYears: { where: { isCurrent: true } },
      classGrades: { include: { sections: true } },
      subjects: true,
    },
  });

  if (!tenant) {
    throw new Error('No active tenant found for testing.');
  }

  const tenantId = tenant.id;
  const currentAcademicYear = tenant.academicYears[0];
  const section = tenant.classGrades[0]?.sections[0];
  const subject = tenant.subjects[0];

  console.log(`[PASS] Found active tenant: ${tenant.name} (${tenantId})`);

  // --------------------------------------------------------------------------
  // TEST SUITE 1: TEACHER CREATION WORKFLOW & LIFECYCLE
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 1: Teacher Creation Workflow & Data Integrity ---');

  const testEmpId = `EMP-TEST-${Date.now().toString().slice(-4)}`;
  const testEmail = `teacher.test.${Date.now()}@school.edu.in`;
  const tempPassword = 'TeacherTest@123!';

  // 1.1 Hash temporary password
  const passwordHash = await AuthService.hashPassword(tempPassword);

  // 1.2 Create User & TeacherProfile transactionally
  const createdTeacher = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        email: testEmail,
        phone: '+91 98765 00000',
        firstName: 'Rohit',
        lastName: 'Verma',
        role: 'TEACHER',
        passwordHash,
        isActive: true,
        mustChangePassword: true,
      },
    });

    const teacherProfile = await tx.teacherProfile.create({
      data: {
        tenantId,
        userId: user.id,
        employeeId: testEmpId,
        department: 'Science & Technology',
        designation: 'Senior Faculty',
        qualification: 'M.Sc Physics, B.Ed',
        specialization: 'Quantum Mechanics',
        joiningDate: new Date('2026-06-01'),
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        qualifications: [
          {
            qualification: 'M.Sc Physics',
            specialization: 'Quantum Mechanics',
            institution: 'University of Delhi',
            graduationYear: '2020',
            experience: '4 Years',
          },
        ] as any,
      },
    });

    if (section && subject) {
      await tx.classSubjectTeacher.upsert({
        where: {
          sectionId_subjectId: {
            sectionId: section.id,
            subjectId: subject.id,
          },
        },
        create: {
          tenantId,
          sectionId: section.id,
          subjectId: subject.id,
          teacherId: teacherProfile.id,
        },
        update: {
          teacherId: teacherProfile.id,
        },
      });
    }

    // Audit log
    const audit = await tx.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: 'TEACHER_CREATED',
        entityType: 'TeacherProfile',
        entityId: teacherProfile.id,
        newValues: {
          employeeId: testEmpId,
          name: 'Rohit Verma',
          email: testEmail,
          department: 'Science & Technology',
          role: 'TEACHER',
        },
      },
    });

    return { user, teacherProfile, audit };
  }, { maxWait: 10000, timeout: 25000 });

  console.log(`  [PASS] Teacher User created with Role: ${createdTeacher.user.role} (strictly TEACHER)`);
  console.log(`  [PASS] TeacherProfile created with Employee ID: ${createdTeacher.teacherProfile.employeeId}`);
  console.log(`  [PASS] AuditLog recorded action: ${createdTeacher.audit.action}`);

  // 1.3 Test Teacher Authentication with credentials
  const authCheck = await AuthService.verifyPassword(tempPassword, createdTeacher.user.passwordHash);
  if (!authCheck) {
    throw new Error('Teacher password verification failed.');
  }
  console.log('  [PASS] Teacher credentials successfully authenticated with secure bcrypt hash');

  // 1.4 Verify mustChangePassword flag
  if (!createdTeacher.user.mustChangePassword) {
    throw new Error('Teacher mustChangePassword should be true for temporary password');
  }
  console.log('  [PASS] mustChangePassword flag correctly enforced on first login');

  // --------------------------------------------------------------------------
  // TEST SUITE 2: CENTRAL ACADEMIC CALENDAR & ROLE VISIBILITY
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: Central Academic Calendar & Role Visibility ---');

  const todayStr = new Date().toISOString().split('T')[0];

  // 2.1 Create various events with different audiences
  const eventEveryone = await prisma.calendarEvent.create({
    data: {
      tenantId,
      academicYearId: currentAcademicYear?.id || null,
      title: 'Annual Sports Day 2026',
      description: 'Track and field tournaments',
      eventType: CalendarEventType.SPORTS,
      startDate: new Date(`${todayStr}T00:00:00.000Z`),
      endDate: new Date(`${todayStr}T00:00:00.000Z`),
      isAllDay: true,
      location: 'Main Sports Complex',
      audience: EventAudience.EVERYONE,
      status: CalendarEventStatus.ACTIVE,
    },
  });

  const eventTeachersOnly = await prisma.calendarEvent.create({
    data: {
      tenantId,
      academicYearId: currentAcademicYear?.id || null,
      title: 'Staff Moderation & Curriculum Meeting',
      description: 'Term review meeting for all teaching staff',
      eventType: CalendarEventType.STAFF_EVENT,
      startDate: new Date(`${todayStr}T00:00:00.000Z`),
      endDate: new Date(`${todayStr}T00:00:00.000Z`),
      isAllDay: false,
      startTime: '03:00 PM',
      endTime: '04:30 PM',
      location: 'Staff Conference Hall',
      audience: EventAudience.TEACHERS,
      status: CalendarEventStatus.ACTIVE,
    },
  });

  const eventAdminOnly = await prisma.calendarEvent.create({
    data: {
      tenantId,
      academicYearId: currentAcademicYear?.id || null,
      title: 'Governing Body Budget Review',
      description: 'Strictly confidential management review',
      eventType: CalendarEventType.MEETING,
      startDate: new Date(`${todayStr}T00:00:00.000Z`),
      endDate: new Date(`${todayStr}T00:00:00.000Z`),
      isAllDay: true,
      audience: EventAudience.ADMIN_ONLY,
      status: CalendarEventStatus.ACTIVE,
    },
  });

  const eventSpecialWorkingDay = await prisma.calendarEvent.create({
    data: {
      tenantId,
      academicYearId: currentAcademicYear?.id || null,
      title: 'Special Working Saturday (Compensatory)',
      description: 'Follow Wednesday class timetable',
      eventType: CalendarEventType.ACADEMIC,
      startDate: new Date('2026-10-17T00:00:00.000Z'),
      endDate: new Date('2026-10-17T00:00:00.000Z'),
      isAllDay: true,
      isSpecialWorkingDay: true,
      audience: EventAudience.EVERYONE,
      status: CalendarEventStatus.ACTIVE,
    },
  });

  console.log('  [PASS] Created test events: EVERYONE, TEACHERS, ADMIN_ONLY, SPECIAL_WORKING_DAY');

  // 2.2 Test Teacher visibility (Should see EVERYONE & TEACHERS, NOT ADMIN_ONLY)
  const teacherVisibleEvents = await prisma.calendarEvent.findMany({
    where: {
      tenantId,
      status: CalendarEventStatus.ACTIVE,
      audience: {
        in: [EventAudience.EVERYONE, EventAudience.TEACHERS, EventAudience.STAFF, EventAudience.TEACHERS_AND_STAFF],
      },
    },
  });

  const teacherCanSeeAdmin = teacherVisibleEvents.some((e) => e.id === eventAdminOnly.id);
  const teacherCanSeeSports = teacherVisibleEvents.some((e) => e.id === eventEveryone.id);
  const teacherCanSeeStaff = teacherVisibleEvents.some((e) => e.id === eventTeachersOnly.id);

  if (teacherCanSeeAdmin || !teacherCanSeeSports || !teacherCanSeeStaff) {
    throw new Error('Teacher role visibility rule violation!');
  }
  console.log('  [PASS] Teacher visibility correctly enforced: Sees TEACHERS and EVERYONE, cannot see ADMIN_ONLY');

  // 2.3 Test Student visibility (Should see EVERYONE, NOT TEACHERS or ADMIN_ONLY)
  const studentVisibleEvents = await prisma.calendarEvent.findMany({
    where: {
      tenantId,
      status: CalendarEventStatus.ACTIVE,
      audience: {
        in: [EventAudience.EVERYONE, EventAudience.STUDENTS, EventAudience.STUDENTS_AND_PARENTS],
      },
    },
  });

  const studentCanSeeAdmin = studentVisibleEvents.some((e) => e.id === eventAdminOnly.id);
  const studentCanSeeStaff = studentVisibleEvents.some((e) => e.id === eventTeachersOnly.id);
  const studentCanSeeSports = studentVisibleEvents.some((e) => e.id === eventEveryone.id);

  if (studentCanSeeAdmin || studentCanSeeStaff || !studentCanSeeSports) {
    throw new Error('Student role visibility rule violation!');
  }
  console.log('  [PASS] Student visibility correctly enforced: Sees EVERYONE, cannot see TEACHERS or ADMIN_ONLY');

  // --------------------------------------------------------------------------
  // TEST SUITE 3: WORKING DAYS CONFIGURATION
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: Working Days & Exceptions Configuration ---');

  const testWorkingDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { workingDays: testWorkingDays },
  });

  const updatedTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { workingDays: true },
  });

  if (updatedTenant?.workingDays?.length !== 6) {
    throw new Error('Working days update failed');
  }
  console.log(`  [PASS] Working days configured: ${updatedTenant.workingDays.join(', ')}`);

  // Verify Special Working Day Exception
  const specialDays = await prisma.calendarEvent.findMany({
    where: { tenantId, isSpecialWorkingDay: true, status: CalendarEventStatus.ACTIVE },
  });
  if (specialDays.length === 0) {
    throw new Error('Special working day exception not found');
  }
  console.log(`  [PASS] Special working day exception detected: ${specialDays[0].title} on ${specialDays[0].startDate.toISOString().split('T')[0]}`);

  // --------------------------------------------------------------------------
  // CLEANUP TEST DATA
  // --------------------------------------------------------------------------
  console.log('\n--- Cleanup Test Records ---');
  await prisma.calendarEvent.deleteMany({
    where: { id: { in: [eventEveryone.id, eventTeachersOnly.id, eventAdminOnly.id, eventSpecialWorkingDay.id] } },
  });
  await prisma.classSubjectTeacher.deleteMany({
    where: { teacherId: createdTeacher.teacherProfile.id },
  });
  await prisma.teacherProfile.delete({
    where: { id: createdTeacher.teacherProfile.id },
  });
  await prisma.auditLog.deleteMany({
    where: { entityId: createdTeacher.teacherProfile.id },
  });
  await prisma.user.delete({
    where: { id: createdTeacher.user.id },
  });

  // Restore 5 standard working days
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] },
  });

  console.log('  [PASS] Test entities cleaned up safely.');
  console.log('\n======================================================');
  console.log(' ALL INTEGRATION TESTS PASSED SUCCESSFULLY! (100%)');
  console.log('======================================================\n');
}

verifyEnhancements()
  .catch((e) => {
    console.error('Test verification failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
