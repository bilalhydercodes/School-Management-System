import { test, expect } from '@playwright/test';
import { TEST_ACCOUNTS } from '../fixtures/accounts';
import { TestExecutionLogger } from '../utils/test-context';

test.describe('Alpha Edu Hub — Smoke Test Suite (Phase 1)', () => {
  const logger = new TestExecutionLogger();

  test('TC-SMOKE-01: Public Landing Page loads without fatal errors', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', (res) => {
      if (res.status() >= 400 && !res.url().includes('favicon')) {
        apiFailures.push(`${res.status()} ${res.url()}`);
      }
    });

    try {
      const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      expect(response?.status()).toBeLessThan(400);

      // Verify essential brand text / hero elements
      await expect(page).toHaveTitle(/Alpha Edu Hub/i);
      const getStartedOrLogin = page.locator('a[href*="/login"], button:has-text("Login"), a:has-text("Get Started")');
      await expect(getStartedOrLogin.first()).toBeVisible({ timeout: 10000 });

      logger.record({
        testName: 'TC-SMOKE-01: Public Landing Page loads',
        role: 'ANONYMOUS',
        page: '/',
        action: 'Page load and visual verification',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-01: Public Landing Page loads',
        role: 'ANONYMOUS',
        page: '/',
        action: 'Page load and visual verification',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-02: Login Page displays input fields and credentials form', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await expect(page.locator('#roll-number-input')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#password-input')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });

      logger.record({
        testName: 'TC-SMOKE-02: Login Page displays inputs',
        role: 'ANONYMOUS',
        page: '/login',
        action: 'Form inputs inspection',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-02: Login Page displays inputs',
        role: 'ANONYMOUS',
        page: '/login',
        action: 'Form inputs inspection',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-03: Super Admin authentication and dashboard routing (/superadmin)', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('response', (res) => {
      if (res.status() >= 400 && res.url().includes('/api/auth')) {
        apiFailures.push(`${res.status()} ${res.url()}`);
      }
    });

    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.superAdmin.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.superAdmin.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL((url) => url.pathname.startsWith('/superadmin') || url.pathname.startsWith('/admin'), {
        timeout: 30000,
      });

      expect(page.url()).toContain('/superadmin');

      logger.record({
        testName: 'TC-SMOKE-03: Super Admin login and routing',
        role: 'SUPER_ADMIN',
        page: '/login -> /superadmin',
        action: 'Submit credentials and verify redirect',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-03: Super Admin login and routing',
        role: 'SUPER_ADMIN',
        page: '/login -> /superadmin',
        action: 'Submit credentials and verify redirect',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-04: Tenant Admin authentication and dashboard routing (/admin)', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.admin.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.admin.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 30000 });
      expect(page.url()).toContain('/admin');

      logger.record({
        testName: 'TC-SMOKE-04: Tenant Admin login and routing',
        role: 'ADMIN',
        institution: 'TEST_INST_A',
        page: '/login -> /admin',
        action: 'Submit credentials and verify tenant dashboard route',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-04: Tenant Admin login and routing',
        role: 'ADMIN',
        institution: 'TEST_INST_A',
        page: '/login -> /admin',
        action: 'Submit credentials and verify tenant dashboard route',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-05: Teacher authentication and dashboard routing (/teacher)', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.teacher.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.teacher.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL((url) => url.pathname.startsWith('/teacher'), { timeout: 30000 });
      expect(page.url()).toContain('/teacher');

      logger.record({
        testName: 'TC-SMOKE-05: Teacher login and routing',
        role: 'TEACHER',
        institution: 'TEST_INST_A',
        page: '/login -> /teacher',
        action: 'Submit credentials and verify teacher portal route',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-05: Teacher login and routing',
        role: 'TEACHER',
        institution: 'TEST_INST_A',
        page: '/login -> /teacher',
        action: 'Submit credentials and verify teacher portal route',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-06: Student authentication and portal routing (/portal/student)', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    try {
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.student.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.student.password);
      await page.locator('button[type="submit"]').click();

      await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });
      expect(page.url()).toContain('/portal');

      logger.record({
        testName: 'TC-SMOKE-06: Student login and routing',
        role: 'STUDENT',
        institution: 'TEST_INST_A',
        page: '/login -> /portal',
        action: 'Submit credentials and verify student portal route',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-06: Student login and routing',
        role: 'STUDENT',
        institution: 'TEST_INST_A',
        page: '/login -> /portal',
        action: 'Submit credentials and verify student portal route',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-07: Authorization Guard — Student cannot access /admin and gets redirected or blocked', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    try {
      // Sign in as student first
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.student.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.student.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });

      // Attempt forbidden navigation
      await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Student should NOT remain on /admin
      const currentUrl = page.url();
      const isBlockedOrRedirected =
        !currentUrl.includes('/admin') ||
        currentUrl.includes('/unauthorized') ||
        currentUrl.includes('/login') ||
        currentUrl.includes('/portal');

      expect(isBlockedOrRedirected).toBe(true);

      logger.record({
        testName: 'TC-SMOKE-07: Authorization Guard on /admin for Student',
        role: 'STUDENT',
        institution: 'TEST_INST_A',
        page: '/admin',
        action: 'Navigate to protected admin route as student',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-07: Authorization Guard on /admin for Student',
        role: 'STUDENT',
        institution: 'TEST_INST_A',
        page: '/admin',
        action: 'Navigate to protected admin route as student',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });

  test('TC-SMOKE-08: Logout terminates session and redirects to /login', async ({ page }) => {
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    const apiFailures: string[] = [];

    try {
      // Login as Admin
      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.admin.email);
      await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.admin.password);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 30000 });

      // Trigger logout via /api/auth/logout GET endpoint
      await page.goto('/api/auth/logout', { timeout: 30000 });

      // Wait for redirect to /login
      await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 30000 });
      expect(page.url()).toContain('/login');

      // Now verify accessing /admin again redirects to /login
      await page.goto('/admin', { timeout: 30000 });
      await page.waitForURL((url) => url.pathname.includes('/login') || url.pathname.includes('/unauthorized'), {
        timeout: 15000,
      });
      expect(page.url()).toContain('/login');

      logger.record({
        testName: 'TC-SMOKE-08: Logout terminates session',
        role: 'ADMIN',
        institution: 'TEST_INST_A',
        page: '/api/auth/logout -> /login',
        action: 'Logout and verify protected route denial',
        status: 'PASSED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
      });
    } catch (err: any) {
      logger.record({
        testName: 'TC-SMOKE-08: Logout terminates session',
        role: 'ADMIN',
        institution: 'TEST_INST_A',
        page: '/api/auth/logout -> /login',
        action: 'Logout and verify protected route denial',
        status: 'FAILED',
        duration: Date.now() - startTime,
        apiFailures,
        consoleErrors,
        error: err.message,
      });
      throw err;
    }
  });
});
