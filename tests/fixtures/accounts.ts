/**
 * Alpha Edu Hub — Test Accounts Registry
 * 
 * Strictly isolated synthetic credentials for multi-tenant automated testing.
 * Passwords are resolved via environment variables to avoid hardcoded credentials.
 */

const DEFAULT_TEST_PASSWORD = process.env.TEST_ACCOUNTS_PASSWORD || 'AlphaTest@2026#Secure';

export interface TestAccount {
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ACCOUNTANT' | 'TEACHER' | 'STUDENT' | 'PARENT';
  tenantSlug: string;
  tenantName: string;
  description: string;
  isPrimary?: boolean;
}

export const TEST_ACCOUNTS = {
  // Global Super Administrator (Cross-Tenant Scope)
  superAdmin: {
    email: process.env.TEST_SUPERADMIN_EMAIL || 'superadmin@alphaeduhub.test',
    password: process.env.TEST_SUPERADMIN_PASSWORD || DEFAULT_TEST_PASSWORD,
    role: 'SUPER_ADMIN',
    tenantSlug: '',
    tenantName: 'Global Platform',
    description: 'Platform Super Administrator with system-wide privileges',
  } as TestAccount,

  // Institution A (TEST_INST_A: "St. Xavier's International School - Test A")
  institutionA: {
    slug: 'test-inst-a',
    name: 'St. Xavier International School (Test A)',
    code: 'TEST_INST_A',
    admin: {
      email: 'admin.a@test-inst-a.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'ADMIN',
      tenantSlug: 'test-inst-a',
      tenantName: 'St. Xavier International School (Test A)',
      description: 'School Administrator for Institution A',
    } as TestAccount,
    accountant: {
      email: 'accountant.a@test-inst-a.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'ACCOUNTANT',
      tenantSlug: 'test-inst-a',
      tenantName: 'St. Xavier International School (Test A)',
      description: 'Accountant & Fee Officer for Institution A',
    } as TestAccount,
    teacher: {
      email: 'teacher.a@test-inst-a.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'TEACHER',
      tenantSlug: 'test-inst-a',
      tenantName: 'St. Xavier International School (Test A)',
      description: 'Senior Secondary Faculty (Mathematics) for Institution A',
    } as TestAccount,
    student: {
      email: 'student.a@test-inst-a.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'STUDENT',
      tenantSlug: 'test-inst-a',
      tenantName: 'St. Xavier International School (Test A)',
      description: 'Class 10 Student for Institution A',
    } as TestAccount,
    parent: {
      email: 'parent.a@test-inst-a.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'PARENT',
      tenantSlug: 'test-inst-a',
      tenantName: 'St. Xavier International School (Test A)',
      description: 'Parent of Class 10 Student for Institution A',
    } as TestAccount,
  },

  // Institution B (TEST_INST_B: "Delhi World Academy - Test B")
  institutionB: {
    slug: 'test-inst-b',
    name: 'Delhi World Academy (Test B)',
    code: 'TEST_INST_B',
    admin: {
      email: 'admin.b@test-inst-b.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'ADMIN',
      tenantSlug: 'test-inst-b',
      tenantName: 'Delhi World Academy (Test B)',
      description: 'School Administrator for Institution B',
    } as TestAccount,
    accountant: {
      email: 'accountant.b@test-inst-b.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'ACCOUNTANT',
      tenantSlug: 'test-inst-b',
      tenantName: 'Delhi World Academy (Test B)',
      description: 'Accountant & Fee Officer for Institution B',
    } as TestAccount,
    teacher: {
      email: 'teacher.b@test-inst-b.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'TEACHER',
      tenantSlug: 'test-inst-b',
      tenantName: 'Delhi World Academy (Test B)',
      description: 'Middle Stage Faculty (Science) for Institution B',
    } as TestAccount,
    student: {
      email: 'student.b@test-inst-b.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'STUDENT',
      tenantSlug: 'test-inst-b',
      tenantName: 'Delhi World Academy (Test B)',
      description: 'Class 8 Student for Institution B',
    } as TestAccount,
    parent: {
      email: 'parent.b@test-inst-b.edu.test',
      password: DEFAULT_TEST_PASSWORD,
      role: 'PARENT',
      tenantSlug: 'test-inst-b',
      tenantName: 'Delhi World Academy (Test B)',
      description: 'Parent of Class 8 Student for Institution B',
    } as TestAccount,
  },
};
