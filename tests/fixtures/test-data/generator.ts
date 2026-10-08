/**
 * Alpha Edu Hub — Deterministic Synthetic Test Data Generator
 * 
 * Strict compliance with privacy policies:
 * - NEVER uses real student, parent, or faculty personal information.
 * - Uses standardized prefixes (TEST_INST_A, TEST_INST_B, Synthetic User, etc.)
 * - Generates two completely isolated institutions for multi-tenant isolation testing.
 */

import { TEST_ACCOUNTS } from '../accounts';

export interface SyntheticInstitutionData {
  tenantCode: string;
  tenantSlug: string;
  tenantName: string;
  board: string;
  domain: string;
  users: {
    admin: { email: string; firstName: string; lastName: string; role: 'ADMIN' };
    accountant: { email: string; firstName: string; lastName: string; role: 'ACCOUNTANT' };
    teacher: {
      email: string;
      firstName: string;
      lastName: string;
      role: 'TEACHER';
      department: string;
      employeeId: string;
    };
    student: {
      email: string;
      firstName: string;
      lastName: string;
      role: 'STUDENT';
      admissionNumber: string;
      rollNumber: string;
    };
    parent: {
      email: string;
      firstName: string;
      lastName: string;
      role: 'PARENT';
      phone: string;
    };
  };
  academics: {
    academicYearName: string;
    className: string;
    classNumericOrder: number;
    sectionName: string;
    subjects: Array<{ name: string; code: string; type: 'THEORY' | 'PRACTICAL' }>;
  };
  fees: {
    categoryName: string;
    amount: number;
    invoiceNumber: string;
  };
  exams: {
    termName: string;
    examDate: string;
    maxMarks: number;
    passingMarks: number;
    score: number;
  };
  announcements: {
    title: string;
    content: string;
  };
}

export const SYNTHETIC_DATA_INSTITUTION_A: SyntheticInstitutionData = {
  tenantCode: 'TEST_INST_A',
  tenantSlug: TEST_ACCOUNTS.institutionA.slug,
  tenantName: TEST_ACCOUNTS.institutionA.name,
  board: 'CBSE',
  domain: 'test-inst-a.alphaeduhub.test',
  users: {
    admin: {
      email: TEST_ACCOUNTS.institutionA.admin.email,
      firstName: 'Admin',
      lastName: 'Alpha (Inst A)',
      role: 'ADMIN',
    },
    accountant: {
      email: TEST_ACCOUNTS.institutionA.accountant.email,
      firstName: 'Accountant',
      lastName: 'Fin (Inst A)',
      role: 'ACCOUNTANT',
    },
    teacher: {
      email: TEST_ACCOUNTS.institutionA.teacher.email,
      firstName: 'Ramanujan',
      lastName: 'Sharma (Inst A)',
      role: 'TEACHER',
      department: 'Mathematics & Computing',
      employeeId: 'EMP-TEST-A-101',
    },
    student: {
      email: TEST_ACCOUNTS.institutionA.student.email,
      firstName: 'Aarav',
      lastName: 'Synthetic-Student-A',
      role: 'STUDENT',
      admissionNumber: 'ADM-TEST-A-2026-001',
      rollNumber: '10-A-01',
    },
    parent: {
      email: TEST_ACCOUNTS.institutionA.parent.email,
      firstName: 'Vikram',
      lastName: 'Synthetic-Parent-A',
      role: 'PARENT',
      phone: '+919999900001',
    },
  },
  academics: {
    academicYearName: '2026-27 (Test)',
    className: 'Class 10 (Secondary)',
    classNumericOrder: 10,
    sectionName: 'A',
    subjects: [
      { name: 'Mathematics (Standard)', code: 'MATH-10', type: 'THEORY' },
      { name: 'Science & Experiments', code: 'SCI-10', type: 'THEORY' },
      { name: 'English Language & Lit', code: 'ENG-10', type: 'THEORY' },
    ],
  },
  fees: {
    categoryName: 'Term 1 Tuition Fee',
    amount: 15000,
    invoiceNumber: 'INV-TEST-A-2026-001',
  },
  exams: {
    termName: 'Mid-Term Summative Assessment 2026',
    examDate: '2026-10-15',
    maxMarks: 100,
    passingMarks: 33,
    score: 88.5,
  },
  announcements: {
    title: 'Institutional Test Announcement - St. Xavier Test A',
    content: 'This is an automated test notice for verifying notification and feed dispatch.',
  },
};

export const SYNTHETIC_DATA_INSTITUTION_B: SyntheticInstitutionData = {
  tenantCode: 'TEST_INST_B',
  tenantSlug: TEST_ACCOUNTS.institutionB.slug,
  tenantName: TEST_ACCOUNTS.institutionB.name,
  board: 'ICSE',
  domain: 'test-inst-b.alphaeduhub.test',
  users: {
    admin: {
      email: TEST_ACCOUNTS.institutionB.admin.email,
      firstName: 'Admin',
      lastName: 'Beta (Inst B)',
      role: 'ADMIN',
    },
    accountant: {
      email: TEST_ACCOUNTS.institutionB.accountant.email,
      firstName: 'Accountant',
      lastName: 'Fin (Inst B)',
      role: 'ACCOUNTANT',
    },
    teacher: {
      email: TEST_ACCOUNTS.institutionB.teacher.email,
      firstName: 'Ananya',
      lastName: 'Sen (Inst B)',
      role: 'TEACHER',
      department: 'Sciences',
      employeeId: 'EMP-TEST-B-201',
    },
    student: {
      email: TEST_ACCOUNTS.institutionB.student.email,
      firstName: 'Rohan',
      lastName: 'Synthetic-Student-B',
      role: 'STUDENT',
      admissionNumber: 'ADM-TEST-B-2026-002',
      rollNumber: '08-A-01',
    },
    parent: {
      email: TEST_ACCOUNTS.institutionB.parent.email,
      firstName: 'Pooja',
      lastName: 'Synthetic-Parent-B',
      role: 'PARENT',
      phone: '+919999900002',
    },
  },
  academics: {
    academicYearName: '2026-27 (Test)',
    className: 'Class 8 (Middle)',
    classNumericOrder: 8,
    sectionName: 'A',
    subjects: [
      { name: 'General Science', code: 'SCI-08', type: 'THEORY' },
      { name: 'Mathematics Foundation', code: 'MATH-08', type: 'THEORY' },
      { name: 'Computer Applications', code: 'COMP-08', type: 'PRACTICAL' },
    ],
  },
  fees: {
    categoryName: 'Term 1 Composite Fee',
    amount: 12500,
    invoiceNumber: 'INV-TEST-B-2026-001',
  },
  exams: {
    termName: 'Quarterly Evaluation 2026',
    examDate: '2026-10-18',
    maxMarks: 100,
    passingMarks: 35,
    score: 92.0,
  },
  announcements: {
    title: 'Institutional Test Announcement - Delhi World Test B',
    content: 'Notice published for Institution B tenant isolation verification.',
  },
};
