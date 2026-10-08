# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/auth-and-routing.spec.ts >> Alpha Edu Hub — Smoke Test Suite (Phase 1) >> TC-SMOKE-07: Authorization Guard — Student cannot access /admin and gets redirected or blocked
- Location: tests/smoke/auth-and-routing.spec.ts:284:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/login"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - generic [ref=f1e2]:
    - link "Go back to Home" [ref=f1e3] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e6]: Go Back
    - main [ref=f1e7]:
      - region "Alpha Edu Hub Overview" [ref=f1e8]:
        - img "Empowering Brighter Tomorrows - Alpha Edu Hub"
        - link "Alpha Edu Hub — Return to Home" [ref=f1e9] [cursor=pointer]:
          - /url: /
        - generic [ref=f1e10]:
          - heading "Alpha Edu Hub" [level=1] [ref=f1e11]
          - paragraph [ref=f1e12]: Next-Gen School ERP · Manage · Grow · Excel
          - heading "Empowering Brighter Tomorrows" [level=2] [ref=f1e13]
          - paragraph [ref=f1e14]: A simple, unified platform to manage students, classes, teachers and school operations.
      - generic [ref=f1e16]:
        - heading "Welcome Back" [level=1] [ref=f1e17]
        - paragraph [ref=f1e18]: Sign in to your Alpha Edu Hub account
        - generic [ref=f1e19]:
          - generic [ref=f1e20]:
            - generic [ref=f1e21]: Roll Number / Admission ID / Email
            - textbox "Roll Number / Admission ID / Email" [ref=f1e22]:
              - /placeholder: e.g. 101 or teacher@school.com
          - generic [ref=f1e23]:
            - generic [ref=f1e24]: Password
            - generic [ref=f1e25]:
              - textbox "Password" [ref=f1e26]:
                - /placeholder: Enter your password
              - button "Show password" [ref=f1e27] [cursor=pointer]
          - link "Forgot Password?" [ref=f1e34] [cursor=pointer]:
            - /url: /login/forgot-password
          - button "Sign In" [ref=f1e35] [cursor=pointer]
          - paragraph [ref=f1e40]:
            - text: New institution?
            - link "Register your institution →" [ref=f1e41] [cursor=pointer]:
              - /url: /register/institution
          - generic [ref=f1e42]:
            - paragraph [ref=f1e43]: "Demo Accounts Quick-Fill (Dev Mode):"
            - generic [ref=f1e44]:
              - button "Admin" [ref=f1e45] [cursor=pointer]
              - button "Teacher" [ref=f1e46] [cursor=pointer]
              - button "Student" [ref=f1e47] [cursor=pointer]
              - button "Super" [ref=f1e48] [cursor=pointer]
  - alert [ref=f1e49]
```

# Test source

```ts
  195 |       });
  196 |       throw err;
  197 |     }
  198 |   });
  199 | 
  200 |   test('TC-SMOKE-05: Teacher authentication and dashboard routing (/teacher)', async ({ page }) => {
  201 |     const startTime = Date.now();
  202 |     const consoleErrors: string[] = [];
  203 |     const apiFailures: string[] = [];
  204 | 
  205 |     try {
  206 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  207 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.teacher.email);
  208 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.teacher.password);
  209 |       await page.locator('button[type="submit"]').click();
  210 | 
  211 |       await page.waitForURL((url) => url.pathname.startsWith('/teacher'), { timeout: 30000 });
  212 |       expect(page.url()).toContain('/teacher');
  213 | 
  214 |       logger.record({
  215 |         testName: 'TC-SMOKE-05: Teacher login and routing',
  216 |         role: 'TEACHER',
  217 |         institution: 'TEST_INST_A',
  218 |         page: '/login -> /teacher',
  219 |         action: 'Submit credentials and verify teacher portal route',
  220 |         status: 'PASSED',
  221 |         duration: Date.now() - startTime,
  222 |         apiFailures,
  223 |         consoleErrors,
  224 |       });
  225 |     } catch (err: any) {
  226 |       logger.record({
  227 |         testName: 'TC-SMOKE-05: Teacher login and routing',
  228 |         role: 'TEACHER',
  229 |         institution: 'TEST_INST_A',
  230 |         page: '/login -> /teacher',
  231 |         action: 'Submit credentials and verify teacher portal route',
  232 |         status: 'FAILED',
  233 |         duration: Date.now() - startTime,
  234 |         apiFailures,
  235 |         consoleErrors,
  236 |         error: err.message,
  237 |       });
  238 |       throw err;
  239 |     }
  240 |   });
  241 | 
  242 |   test('TC-SMOKE-06: Student authentication and portal routing (/portal/student)', async ({ page }) => {
  243 |     const startTime = Date.now();
  244 |     const consoleErrors: string[] = [];
  245 |     const apiFailures: string[] = [];
  246 | 
  247 |     try {
  248 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  249 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.student.email);
  250 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.student.password);
  251 |       await page.locator('button[type="submit"]').click();
  252 | 
  253 |       await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });
  254 |       expect(page.url()).toContain('/portal');
  255 | 
  256 |       logger.record({
  257 |         testName: 'TC-SMOKE-06: Student login and routing',
  258 |         role: 'STUDENT',
  259 |         institution: 'TEST_INST_A',
  260 |         page: '/login -> /portal',
  261 |         action: 'Submit credentials and verify student portal route',
  262 |         status: 'PASSED',
  263 |         duration: Date.now() - startTime,
  264 |         apiFailures,
  265 |         consoleErrors,
  266 |       });
  267 |     } catch (err: any) {
  268 |       logger.record({
  269 |         testName: 'TC-SMOKE-06: Student login and routing',
  270 |         role: 'STUDENT',
  271 |         institution: 'TEST_INST_A',
  272 |         page: '/login -> /portal',
  273 |         action: 'Submit credentials and verify student portal route',
  274 |         status: 'FAILED',
  275 |         duration: Date.now() - startTime,
  276 |         apiFailures,
  277 |         consoleErrors,
  278 |         error: err.message,
  279 |       });
  280 |       throw err;
  281 |     }
  282 |   });
  283 | 
  284 |   test('TC-SMOKE-07: Authorization Guard — Student cannot access /admin and gets redirected or blocked', async ({ page }) => {
  285 |     const startTime = Date.now();
  286 |     const consoleErrors: string[] = [];
  287 |     const apiFailures: string[] = [];
  288 | 
  289 |     try {
  290 |       // Sign in as student first
  291 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  292 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.student.email);
  293 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.student.password);
  294 |       await page.locator('button[type="submit"]').click();
> 295 |       await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });
      |                  ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  296 | 
  297 |       // Attempt forbidden navigation
  298 |       await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
  299 | 
  300 |       // Student should NOT remain on /admin
  301 |       const currentUrl = page.url();
  302 |       const isBlockedOrRedirected =
  303 |         !currentUrl.includes('/admin') ||
  304 |         currentUrl.includes('/unauthorized') ||
  305 |         currentUrl.includes('/login') ||
  306 |         currentUrl.includes('/portal');
  307 | 
  308 |       expect(isBlockedOrRedirected).toBe(true);
  309 | 
  310 |       logger.record({
  311 |         testName: 'TC-SMOKE-07: Authorization Guard on /admin for Student',
  312 |         role: 'STUDENT',
  313 |         institution: 'TEST_INST_A',
  314 |         page: '/admin',
  315 |         action: 'Navigate to protected admin route as student',
  316 |         status: 'PASSED',
  317 |         duration: Date.now() - startTime,
  318 |         apiFailures,
  319 |         consoleErrors,
  320 |       });
  321 |     } catch (err: any) {
  322 |       logger.record({
  323 |         testName: 'TC-SMOKE-07: Authorization Guard on /admin for Student',
  324 |         role: 'STUDENT',
  325 |         institution: 'TEST_INST_A',
  326 |         page: '/admin',
  327 |         action: 'Navigate to protected admin route as student',
  328 |         status: 'FAILED',
  329 |         duration: Date.now() - startTime,
  330 |         apiFailures,
  331 |         consoleErrors,
  332 |         error: err.message,
  333 |       });
  334 |       throw err;
  335 |     }
  336 |   });
  337 | 
  338 |   test('TC-SMOKE-08: Logout terminates session and redirects to /login', async ({ page }) => {
  339 |     const startTime = Date.now();
  340 |     const consoleErrors: string[] = [];
  341 |     const apiFailures: string[] = [];
  342 | 
  343 |     try {
  344 |       // Login as Admin
  345 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  346 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.admin.email);
  347 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.admin.password);
  348 |       await page.locator('button[type="submit"]').click();
  349 |       await page.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 30000 });
  350 | 
  351 |       // Trigger logout via /api/auth/logout GET endpoint
  352 |       await page.goto('/api/auth/logout', { timeout: 30000 });
  353 | 
  354 |       // Wait for redirect to /login
  355 |       await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 30000 });
  356 |       expect(page.url()).toContain('/login');
  357 | 
  358 |       // Now verify accessing /admin again redirects to /login
  359 |       await page.goto('/admin', { timeout: 30000 });
  360 |       await page.waitForURL((url) => url.pathname.includes('/login') || url.pathname.includes('/unauthorized'), {
  361 |         timeout: 15000,
  362 |       });
  363 |       expect(page.url()).toContain('/login');
  364 | 
  365 |       logger.record({
  366 |         testName: 'TC-SMOKE-08: Logout terminates session',
  367 |         role: 'ADMIN',
  368 |         institution: 'TEST_INST_A',
  369 |         page: '/api/auth/logout -> /login',
  370 |         action: 'Logout and verify protected route denial',
  371 |         status: 'PASSED',
  372 |         duration: Date.now() - startTime,
  373 |         apiFailures,
  374 |         consoleErrors,
  375 |       });
  376 |     } catch (err: any) {
  377 |       logger.record({
  378 |         testName: 'TC-SMOKE-08: Logout terminates session',
  379 |         role: 'ADMIN',
  380 |         institution: 'TEST_INST_A',
  381 |         page: '/api/auth/logout -> /login',
  382 |         action: 'Logout and verify protected route denial',
  383 |         status: 'FAILED',
  384 |         duration: Date.now() - startTime,
  385 |         apiFailures,
  386 |         consoleErrors,
  387 |         error: err.message,
  388 |       });
  389 |       throw err;
  390 |     }
  391 |   });
  392 | });
  393 | 
```