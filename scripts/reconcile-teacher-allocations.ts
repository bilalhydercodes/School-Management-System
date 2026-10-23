import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function reconcileTeacherAllocations(dryRun: boolean = false) {
  console.log(`=== Reconciling Subject Allocations (DryRun: ${dryRun}) ===\n`);

  // 1. Locate DPS Tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });

  if (!tenant) {
    throw new Error('Tenant "dps" not found.');
  }

  console.log(`Tenant: ${tenant.name} (${tenant.id})`);

  // 2. Locate Anandita Sen (Mathematics Teacher)
  const teacherUser = await prisma.user.findFirst({
    where: {
      tenantId: tenant.id,
      email: 'teacher@dps.edu.in',
    },
    include: {
      teacherProfile: true,
    },
  });

  if (!teacherUser || !teacherUser.teacherProfile) {
    throw new Error('Teacher profile for "teacher@dps.edu.in" not found.');
  }

  const ananditaProfileId = teacherUser.teacherProfile.id;
  console.log(`Verified Teacher: Anandita Sen (Profile ID: ${ananditaProfileId})`);

  // 3. Locate Class 10 Section A
  const section = await prisma.section.findFirst({
    where: {
      tenantId: tenant.id,
      name: 'A',
      classGrade: { name: 'Class 10' },
    },
  });

  if (!section) {
    throw new Error('Class 10-A section not found.');
  }

  // 4. Locate Mathematics subject
  const mathSubject = await prisma.subject.findFirst({
    where: {
      tenantId: tenant.id,
      OR: [{ code: 'MATH-041' }, { code: 'MATH-10' }, { name: 'Mathematics' }],
    },
  });

  if (!mathSubject) {
    throw new Error('Mathematics subject not found.');
  }

  console.log(`Target: Section ${section.name} (Class 10), Subject: ${mathSubject.name} (${mathSubject.code})`);

  // 5. Inspect current ClassSubjectTeacher mapping
  const currentAllocation = await prisma.classSubjectTeacher.findFirst({
    where: {
      tenantId: tenant.id,
      sectionId: section.id,
      subjectId: mathSubject.id,
    },
    include: {
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  if (currentAllocation) {
    console.log(
      `Current DB Allocation: Teacher ID ${currentAllocation.teacherId} (${currentAllocation.teacher?.user?.email || 'Unknown'})`
    );

    if (currentAllocation.teacherId === ananditaProfileId) {
      console.log('Allocation is already correct! Anandita Sen is assigned.');
      return { status: 'ALREADY_CONSISTENT', teacherId: ananditaProfileId };
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would update allocation from ${currentAllocation.teacher?.user?.email} to teacher@dps.edu.in`);
      return { status: 'DRY_RUN_PENDING', from: currentAllocation.teacherId, to: ananditaProfileId };
    }

    const updated = await prisma.classSubjectTeacher.update({
      where: { id: currentAllocation.id },
      data: {
        teacherId: ananditaProfileId,
      },
    });

    console.log(`Successfully updated ClassSubjectTeacher record ${updated.id} to Anandita Sen.`);
    return { status: 'RECONCILED', id: updated.id, teacherId: ananditaProfileId };
  } else {
    console.log('No allocation record exists. Creating new ClassSubjectTeacher assignment...');
    if (dryRun) {
      console.log(`[DRY RUN] Would create allocation for Anandita Sen.`);
      return { status: 'DRY_RUN_PENDING', to: ananditaProfileId };
    }

    const created = await prisma.classSubjectTeacher.create({
      data: {
        tenantId: tenant.id,
        sectionId: section.id,
        subjectId: mathSubject.id,
        teacherId: ananditaProfileId,
      },
    });

    console.log(`Successfully created ClassSubjectTeacher record ${created.id}.`);
    return { status: 'CREATED', id: created.id, teacherId: ananditaProfileId };
  }
}

if (require.main === module) {
  reconcileTeacherAllocations(false)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
