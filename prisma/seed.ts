import { PrismaClient, Role, SubjectType, AttendanceStatus, InvoiceStatus, PaymentMethod, PaymentStatus, NoticePriority, NoticeAudience, DayOfWeek, FeeFrequency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding canonical database for School Management System...');

  // 1. Create / Upsert Subscription Plans
  const primePlan = await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Alpha Edu Hub Prime',
      maxStudents: 5000,
      maxStaff: 300,
      features: {
        admission: true,
        attendance: true,
        fees: true,
        exams: true,
        reports: true,
        portals: true,
        notifications: true,
        timetable: true,
        pwa: true,
        analytics: true,
      },
      priceMonthly: 11.0,
      priceAnnual: 120.0,
      isActive: true,
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Alpha Edu Hub Prime',
      maxStudents: 5000,
      maxStaff: 300,
      features: {
        admission: true,
        attendance: true,
        fees: true,
        exams: true,
        reports: true,
        portals: true,
        notifications: true,
        timetable: true,
        pwa: true,
        analytics: true,
      },
      priceMonthly: 11.0,
      priceAnnual: 120.0,
      isActive: true,
    },
  });

  // 2. Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 10);
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'superadmin@schoolerp.in', tenantId: null },
  });
  if (!existingSuperAdmin) {
    await prisma.user.create({
      data: {
        id: '49979826-a3b0-4264-832f-f4a3f38609c0',
        email: 'superadmin@schoolerp.in',
        passwordHash: superAdminPassword,
        firstName: 'Platform',
        lastName: 'SuperAdmin',
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });
  }

  // 3. Canonical Tenant: Delhi Public School
  const DPS_TENANT_ID = '3c9a7747-cffd-40e1-be07-374b47817e5f';
  const dpsTenant = await prisma.tenant.upsert({
    where: { id: DPS_TENANT_ID },
    update: {
      name: 'Delhi Public School',
      slug: 'dps',
      email: 'principal@dps.edu.in',
      phone: '+91 11 23456789',
      address: 'Sector 4, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110022',
      board: 'CBSE',
      subscriptionPlanId: primePlan.id,
      isActive: true,
    },
    create: {
      id: DPS_TENANT_ID,
      name: 'Delhi Public School',
      slug: 'dps',
      email: 'principal@dps.edu.in',
      phone: '+91 11 23456789',
      address: 'Sector 4, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110022',
      board: 'CBSE',
      subscriptionPlanId: primePlan.id,
      isActive: true,
      branding: {
        create: {
          primaryColor: '#111C2D',
          secondaryColor: '#F4F6F9',
          accentColor: '#FA896B',
          tagline: 'Service Before Self',
        },
      },
    },
  });
  console.log(`✅ Tenant verified: ${dpsTenant.name} (${dpsTenant.id})`);

  // Ensure Tenant Branding exists
  await prisma.tenantBranding.upsert({
    where: { tenantId: DPS_TENANT_ID },
    update: {},
    create: {
      tenantId: DPS_TENANT_ID,
      primaryColor: '#111C2D',
      secondaryColor: '#F4F6F9',
      accentColor: '#FA896B',
      tagline: 'Service Before Self',
    },
  });

  // 4. Academic Year 2026-27
  const AY_ID = '48f9d69f-65a8-4b68-b250-a233bf0bc001';
  const academicYear = await prisma.academicYear.upsert({
    where: {
      tenantId_name: {
        tenantId: DPS_TENANT_ID,
        name: '2026-27',
      },
    },
    update: { isCurrent: true },
    create: {
      id: AY_ID,
      tenantId: DPS_TENANT_ID,
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });
  console.log(`✅ Academic Year verified: ${academicYear.name}`);

  // 5. School Admin User: Virendra Kapoor (admin@dps.edu.in / Admin@123)
  const ADMIN_USER_ID = 'a0000000-0000-0000-0000-000000000001';
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const dpsAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: DPS_TENANT_ID,
        email: 'admin@dps.edu.in',
      },
    },
    update: {
      passwordHash: adminPasswordHash,
      firstName: 'Virendra',
      lastName: 'Kapoor',
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      id: ADMIN_USER_ID,
      tenantId: DPS_TENANT_ID,
      email: 'admin@dps.edu.in',
      phone: '+91 9876543210',
      passwordHash: adminPasswordHash,
      firstName: 'Virendra',
      lastName: 'Kapoor',
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin verified: ${dpsAdmin.firstName} ${dpsAdmin.lastName} (${dpsAdmin.email})`);

  // 6. Teacher User & Profile: Anandita Sen (teacher@dps.edu.in / Teacher@123)
  const TEACHER_USER_ID = 'a0000000-0000-0000-0000-000000000002';
  const TEACHER_PROFILE_ID = '1f70a23c-a34e-4117-9c60-1acf7f018504';
  const teacherPasswordHash = await bcrypt.hash('Teacher@123', 10);
  const dpsTeacherUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: DPS_TENANT_ID,
        email: 'teacher@dps.edu.in',
      },
    },
    update: {
      passwordHash: teacherPasswordHash,
      firstName: 'Anandita',
      lastName: 'Sen',
      role: Role.TEACHER,
      isActive: true,
    },
    create: {
      id: TEACHER_USER_ID,
      tenantId: DPS_TENANT_ID,
      email: 'teacher@dps.edu.in',
      phone: '+91 9811122233',
      passwordHash: teacherPasswordHash,
      firstName: 'Anandita',
      lastName: 'Sen',
      role: Role.TEACHER,
      isActive: true,
    },
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: dpsTeacherUser.id },
    update: {
      employeeId: 'EMP-DPS-101',
      department: 'Mathematics & Computing',
      designation: 'Senior Secondary Faculty',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      specialization: 'Pure Mathematics',
      joiningDate: new Date('2018-06-01'),
      address: 'Flat 101, Faculty Enclave, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pinCode: '110022',
    },
    create: {
      id: TEACHER_PROFILE_ID,
      tenantId: DPS_TENANT_ID,
      userId: dpsTeacherUser.id,
      employeeId: 'EMP-DPS-101',
      department: 'Mathematics & Computing',
      designation: 'Senior Secondary Faculty',
      qualification: 'M.Sc. Mathematics, B.Ed.',
      specialization: 'Pure Mathematics',
      joiningDate: new Date('2018-06-01'),
      address: 'Flat 101, Faculty Enclave, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pinCode: '110022',
    },
  });
  console.log(`✅ Teacher Profile verified: ${dpsTeacherUser.firstName} ${dpsTeacherUser.lastName} (Emp ID: ${teacherProfile.employeeId})`);

  // 7. Class 10 & Section A
  const CLASS10_ID = 'c1000000-0000-0000-0000-000000000010';
  const SECTION_A_ID = '3b403a49-4be6-440c-bb00-a6b884e1fcbd';
  const class10 = await prisma.classGrade.upsert({
    where: {
      tenantId_academicYearId_name: {
        tenantId: DPS_TENANT_ID,
        academicYearId: academicYear.id,
        name: 'Class 10',
      },
    },
    update: { numericOrder: 10 },
    create: {
      id: CLASS10_ID,
      tenantId: DPS_TENANT_ID,
      academicYearId: academicYear.id,
      name: 'Class 10',
      numericOrder: 10,
    },
  });

  const sectionA = await prisma.section.upsert({
    where: {
      classGradeId_name: {
        classGradeId: class10.id,
        name: 'A',
      },
    },
    update: {
      classTeacherId: teacherProfile.id,
    },
    create: {
      id: SECTION_A_ID,
      tenantId: DPS_TENANT_ID,
      classGradeId: class10.id,
      name: 'A',
      classTeacherId: teacherProfile.id,
    },
  });
  console.log(`✅ Class & Section verified: ${class10.name} - ${sectionA.name} (Class Teacher: Anandita Sen)`);

  // 8. Student User & Profile: Rohan Sharma (student@dps.edu.in / Student@123)
  const STUDENT_USER_ID = 'a0000000-0000-0000-0000-000000000003';
  const STUDENT_PROFILE_ID = 'b0000000-0000-0000-0000-000000000001';
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);
  const dpsStudentUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: DPS_TENANT_ID,
        email: 'student@dps.edu.in',
      },
    },
    update: {
      passwordHash: studentPasswordHash,
      firstName: 'Rohan',
      lastName: 'Sharma',
      role: Role.STUDENT,
      isActive: true,
    },
    create: {
      id: STUDENT_USER_ID,
      tenantId: DPS_TENANT_ID,
      email: 'student@dps.edu.in',
      phone: '+91 98765 43210',
      passwordHash: studentPasswordHash,
      firstName: 'Rohan',
      lastName: 'Sharma',
      role: Role.STUDENT,
      isActive: true,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      tenantId_admissionNumber: {
        tenantId: DPS_TENANT_ID,
        admissionNumber: 'DPS-2022-4891',
      },
    },
    update: {
      sectionId: sectionA.id,
      rollNumber: 14,
    },
    create: {
      id: STUDENT_PROFILE_ID,
      tenantId: DPS_TENANT_ID,
      userId: dpsStudentUser.id,
      admissionNumber: 'DPS-2022-4891',
      rollNumber: 14,
      sectionId: sectionA.id,
      dateOfBirth: new Date('2010-05-15'),
      gender: 'MALE',
      bloodGroup: 'B+',
      address: 'Flat 402, Green Valley Apartments, R.K. Puram, New Delhi',
      emergencyContact: '+91 98765 43210',
      admissionDate: new Date('2022-04-01'),
    },
  });
  console.log(`✅ Student Profile verified: ${dpsStudentUser.firstName} ${dpsStudentUser.lastName} (Adm: ${studentProfile.admissionNumber})`);

  // 9. Subjects
  const mathSubject = await prisma.subject.upsert({
    where: {
      tenantId_code: {
        tenantId: DPS_TENANT_ID,
        code: 'MATH-041',
      },
    },
    update: { name: 'Mathematics (Standard)' },
    create: {
      id: 'e0000000-0000-0000-0000-000000000001',
      tenantId: DPS_TENANT_ID,
      name: 'Mathematics (Standard)',
      code: 'MATH-041',
      subjectType: SubjectType.THEORY,
    },
  });

  const englishSubject = await prisma.subject.upsert({
    where: {
      tenantId_code: {
        tenantId: DPS_TENANT_ID,
        code: 'ENG-184',
      },
    },
    update: { name: 'English Language & Lit.' },
    create: {
      id: 'e0000000-0000-0000-0000-000000000002',
      tenantId: DPS_TENANT_ID,
      name: 'English Language & Lit.',
      code: 'ENG-184',
      subjectType: SubjectType.THEORY,
    },
  });

  const scienceSubject = await prisma.subject.upsert({
    where: {
      tenantId_code: {
        tenantId: DPS_TENANT_ID,
        code: 'SCI-086',
      },
    },
    update: { name: 'General Science' },
    create: {
      id: 'e0000000-0000-0000-0000-000000000003',
      tenantId: DPS_TENANT_ID,
      name: 'General Science',
      code: 'SCI-086',
      subjectType: SubjectType.THEORY,
    },
  });

  // 10. ClassSubjectTeacher: Anandita Sen teaches Mathematics in Class 10-A
  await prisma.classSubjectTeacher.upsert({
    where: {
      sectionId_subjectId: {
        sectionId: sectionA.id,
        subjectId: mathSubject.id,
      },
    },
    update: {
      teacherId: teacherProfile.id,
    },
    create: {
      tenantId: DPS_TENANT_ID,
      sectionId: sectionA.id,
      subjectId: mathSubject.id,
      teacherId: teacherProfile.id,
    },
  });
  console.log('✅ Subject allocation verified: Anandita Sen -> Mathematics (Class 10-A)');

  // 11. Period Time Slots
  const period1 = await prisma.periodTimeSlot.upsert({
    where: { tenantId_order: { tenantId: DPS_TENANT_ID, order: 1 } },
    update: {},
    create: {
      tenantId: DPS_TENANT_ID,
      name: 'Period 1',
      startTime: '08:30',
      endTime: '09:15',
      order: 1,
    },
  });

  const period2 = await prisma.periodTimeSlot.upsert({
    where: { tenantId_order: { tenantId: DPS_TENANT_ID, order: 2 } },
    update: {},
    create: {
      tenantId: DPS_TENANT_ID,
      name: 'Period 2',
      startTime: '09:15',
      endTime: '10:00',
      order: 2,
    },
  });

  // Timetable Entries for Section A (Monday)
  await prisma.timetableEntry.upsert({
    where: {
      sectionId_periodTimeSlotId_dayOfWeek: {
        sectionId: sectionA.id,
        periodTimeSlotId: period1.id,
        dayOfWeek: DayOfWeek.MONDAY,
      },
    },
    update: {
      subjectId: mathSubject.id,
      teacherId: teacherProfile.id,
      roomNumber: 'Room 204',
    },
    create: {
      tenantId: DPS_TENANT_ID,
      sectionId: sectionA.id,
      periodTimeSlotId: period1.id,
      subjectId: mathSubject.id,
      teacherId: teacherProfile.id,
      dayOfWeek: DayOfWeek.MONDAY,
      roomNumber: 'Room 204',
    },
  });

  // 12. Student Attendance: Baseline for Rohan Sharma (93.3% attendance)
  const today = new Date();
  for (let i = 1; i <= 15; i++) {
    const attendanceDate = new Date(today);
    attendanceDate.setDate(today.getDate() - i);
    // Skip weekends
    if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;
    const status = i === 7 ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT;

    await prisma.studentAttendance.upsert({
      where: {
        tenantId_studentId_date_period: {
          tenantId: DPS_TENANT_ID,
          studentId: studentProfile.id,
          date: attendanceDate,
          period: 1,
        },
      },
      update: { status },
      create: {
        tenantId: DPS_TENANT_ID,
        studentId: studentProfile.id,
        sectionId: sectionA.id,
        date: attendanceDate,
        period: 1,
        status,
        markedBy: dpsAdmin.id,
      },
    });
  }
  console.log('✅ Student Attendance records verified');

  // 13. Fee Category & Sample Invoice for Rohan Sharma
  const tuitionFeeCategory = await prisma.feeCategory.upsert({
    where: { tenantId_name: { tenantId: DPS_TENANT_ID, name: 'Tuition Fee' } },
    update: {},
    create: {
      tenantId: DPS_TENANT_ID,
      name: 'Tuition Fee',
      description: 'Term 1 Tuition and Academic Facility Fee',
    },
  });

  const invoiceNumber = 'INV-DPS-2026-001';
  await prisma.feeInvoice.upsert({
    where: {
      tenantId_invoiceNumber: {
        tenantId: DPS_TENANT_ID,
        invoiceNumber,
      },
    },
    update: {
      netAmount: 45000,
      paidAmount: 35000,
      balanceAmount: 10000,
      status: InvoiceStatus.PARTIAL,
    },
    create: {
      tenantId: DPS_TENANT_ID,
      studentId: studentProfile.id,
      academicYearId: academicYear.id,
      invoiceNumber,
      totalAmount: 45000,
      netAmount: 45000,
      paidAmount: 35000,
      balanceAmount: 10000,
      dueDate: new Date('2026-11-15'),
      status: InvoiceStatus.PARTIAL,
      items: {
        create: [
          {
            tenantId: DPS_TENANT_ID,
            feeCategoryId: tuitionFeeCategory.id,
            amount: 45000,
            description: 'Term 1 Comprehensive Academic & Lab Tuition',
          },
        ],
      },
    },
  });
  console.log('✅ Fee Invoice verified: INV-DPS-2026-001 (Balance: ₹10,000)');

  // 14. Notices
  const notices = [
    {
      title: 'Annual Sports Day 2026 Announcement',
      content: 'The Annual Athletic Meet will be held on December 5, 2026. All students in Class 10 can register for track and field events through their class teacher.',
      priority: NoticePriority.HIGH,
      targetAudience: NoticeAudience.ALL,
    },
    {
      title: 'Mid-Term Parent-Teacher Conference',
      content: 'PTM for Class 10 Sections A to D will take place this Saturday from 9:00 AM to 1:00 PM. Parents are requested to adhere to their time slots.',
      priority: NoticePriority.NORMAL,
      targetAudience: NoticeAudience.ALL,
    },
  ];

  for (const n of notices) {
    const existingNotice = await prisma.notice.findFirst({
      where: { tenantId: DPS_TENANT_ID, title: n.title },
    });
    if (!existingNotice) {
      await prisma.notice.create({
        data: {
          tenantId: DPS_TENANT_ID,
          title: n.title,
          content: n.content,
          priority: n.priority,
          targetAudience: n.targetAudience,
          authorId: dpsAdmin.id,
        },
      });
    }
  }
  console.log('✅ School Notices verified');

  console.log('\n🎉 ALL CANONICAL DEMO DATA SUCCESSFULLY SEEDED INTO POSTGRESQL (SUPABASE)!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
