# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/auth-and-routing.spec.ts >> Alpha Edu Hub — Smoke Test Suite (Phase 1) >> TC-SMOKE-06: Student authentication and portal routing (/portal/student)
- Location: tests/smoke/auth-and-routing.spec.ts:242:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - link "Go back to Home" [ref=e3] [cursor=pointer]:
      - /url: /
      - generic [ref=e6]: Go Back
    - main [ref=e7]:
      - region "Alpha Edu Hub Overview" [ref=e8]:
        - img "Empowering Brighter Tomorrows - Alpha Edu Hub"
        - link "Alpha Edu Hub — Return to Home" [ref=e9] [cursor=pointer]:
          - /url: /
        - generic [ref=e10]:
          - heading "Alpha Edu Hub" [level=1] [ref=e11]
          - paragraph [ref=e12]: Next-Gen School ERP · Manage · Grow · Excel
          - heading "Empowering Brighter Tomorrows" [level=2] [ref=e13]
          - paragraph [ref=e14]: A simple, unified platform to manage students, classes, teachers and school operations.
      - generic [ref=e16]:
        - heading "Welcome Back" [level=1] [ref=e17]
        - paragraph [ref=e18]: Sign in to your Alpha Edu Hub account
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]: Roll Number / Admission ID / Email
            - textbox "Roll Number / Admission ID / Email" [active] [ref=e22]:
              - /placeholder: e.g. 101 or teacher@school.com
          - generic [ref=e23]:
            - generic [ref=e24]: Password
            - generic [ref=e25]:
              - textbox "Password" [ref=e26]:
                - /placeholder: Enter your password
                - text: AlphaTest@2026#Secure
              - button "Show password" [ref=e27] [cursor=pointer]
          - link "Forgot Password?" [ref=e34] [cursor=pointer]:
            - /url: /login/forgot-password
          - button "Sign In" [ref=e35] [cursor=pointer]
          - paragraph [ref=e40]:
            - text: New institution?
            - link "Register your institution →" [ref=e41] [cursor=pointer]:
              - /url: /register/institution
          - generic [ref=e42]:
            - paragraph [ref=e43]: "Demo Accounts Quick-Fill (Dev Mode):"
            - generic [ref=e44]:
              - button "Admin" [ref=e45] [cursor=pointer]
              - button "Teacher" [ref=e46] [cursor=pointer]
              - button "Student" [ref=e47] [cursor=pointer]
              - button "Super" [ref=e48] [cursor=pointer]
  - alert [ref=e49]
```

# Test source

```ts
  153 | 
  154 |   test('TC-SMOKE-04: Tenant Admin authentication and dashboard routing (/admin)', async ({ page }) => {
  155 |     const startTime = Date.now();
  156 |     const consoleErrors: string[] = [];
  157 |     const apiFailures: string[] = [];
  158 | 
  159 |     page.on('console', (msg) => {
  160 |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  161 |     });
  162 | 
  163 |     try {
  164 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  165 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.institutionA.admin.email);
  166 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.institutionA.admin.password);
  167 |       await page.locator('button[type="submit"]').click();
  168 | 
  169 |       await page.waitForURL((url) => url.pathname.startsWith('/admin'), { timeout: 30000 });
  170 |       expect(page.url()).toContain('/admin');
  171 | 
  172 |       logger.record({
  173 |         testName: 'TC-SMOKE-04: Tenant Admin login and routing',
  174 |         role: 'ADMIN',
  175 |         institution: 'TEST_INST_A',
  176 |         page: '/login -> /admin',
  177 |         action: 'Submit credentials and verify tenant dashboard route',
  178 |         status: 'PASSED',
  179 |         duration: Date.now() - startTime,
  180 |         apiFailures,
  181 |         consoleErrors,
  182 |       });
  183 |     } catch (err: any) {
  184 |       logger.record({
  185 |         testName: 'TC-SMOKE-04: Tenant Admin login and routing',
  186 |         role: 'ADMIN',
  187 |         institution: 'TEST_INST_A',
  188 |         page: '/login -> /admin',
  189 |         action: 'Submit credentials and verify tenant dashboard route',
  190 |         status: 'FAILED',
  191 |         duration: Date.now() - startTime,
  192 |         apiFailures,
  193 |         consoleErrors,
  194 |         error: err.message,
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
> 253 |       await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });
      |                  ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
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
  295 |       await page.waitForURL((url) => url.pathname.startsWith('/portal'), { timeout: 30000 });
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
```