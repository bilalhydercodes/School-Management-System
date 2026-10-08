# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke/auth-and-routing.spec.ts >> Alpha Edu Hub — Smoke Test Suite (Phase 1) >> TC-SMOKE-03: Super Admin authentication and dashboard routing (/superadmin)
- Location: tests/smoke/auth-and-routing.spec.ts:101:7

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
  22  |       }
  23  |     });
  24  | 
  25  |     try {
  26  |       const response = await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  27  |       expect(response?.status()).toBeLessThan(400);
  28  | 
  29  |       // Verify essential brand text / hero elements
  30  |       await expect(page).toHaveTitle(/Alpha Edu Hub/i);
  31  |       const getStartedOrLogin = page.locator('a[href*="/login"], button:has-text("Login"), a:has-text("Get Started")');
  32  |       await expect(getStartedOrLogin.first()).toBeVisible({ timeout: 10000 });
  33  | 
  34  |       logger.record({
  35  |         testName: 'TC-SMOKE-01: Public Landing Page loads',
  36  |         role: 'ANONYMOUS',
  37  |         page: '/',
  38  |         action: 'Page load and visual verification',
  39  |         status: 'PASSED',
  40  |         duration: Date.now() - startTime,
  41  |         apiFailures,
  42  |         consoleErrors,
  43  |       });
  44  |     } catch (err: any) {
  45  |       logger.record({
  46  |         testName: 'TC-SMOKE-01: Public Landing Page loads',
  47  |         role: 'ANONYMOUS',
  48  |         page: '/',
  49  |         action: 'Page load and visual verification',
  50  |         status: 'FAILED',
  51  |         duration: Date.now() - startTime,
  52  |         apiFailures,
  53  |         consoleErrors,
  54  |         error: err.message,
  55  |       });
  56  |       throw err;
  57  |     }
  58  |   });
  59  | 
  60  |   test('TC-SMOKE-02: Login Page displays input fields and credentials form', async ({ page }) => {
  61  |     const startTime = Date.now();
  62  |     const consoleErrors: string[] = [];
  63  |     const apiFailures: string[] = [];
  64  | 
  65  |     page.on('console', (msg) => {
  66  |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  67  |     });
  68  | 
  69  |     try {
  70  |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  71  |       await expect(page.locator('#roll-number-input')).toBeVisible({ timeout: 10000 });
  72  |       await expect(page.locator('#password-input')).toBeVisible({ timeout: 10000 });
  73  |       await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 });
  74  | 
  75  |       logger.record({
  76  |         testName: 'TC-SMOKE-02: Login Page displays inputs',
  77  |         role: 'ANONYMOUS',
  78  |         page: '/login',
  79  |         action: 'Form inputs inspection',
  80  |         status: 'PASSED',
  81  |         duration: Date.now() - startTime,
  82  |         apiFailures,
  83  |         consoleErrors,
  84  |       });
  85  |     } catch (err: any) {
  86  |       logger.record({
  87  |         testName: 'TC-SMOKE-02: Login Page displays inputs',
  88  |         role: 'ANONYMOUS',
  89  |         page: '/login',
  90  |         action: 'Form inputs inspection',
  91  |         status: 'FAILED',
  92  |         duration: Date.now() - startTime,
  93  |         apiFailures,
  94  |         consoleErrors,
  95  |         error: err.message,
  96  |       });
  97  |       throw err;
  98  |     }
  99  |   });
  100 | 
  101 |   test('TC-SMOKE-03: Super Admin authentication and dashboard routing (/superadmin)', async ({ page }) => {
  102 |     const startTime = Date.now();
  103 |     const consoleErrors: string[] = [];
  104 |     const apiFailures: string[] = [];
  105 | 
  106 |     page.on('console', (msg) => {
  107 |       if (msg.type() === 'error') consoleErrors.push(msg.text());
  108 |     });
  109 | 
  110 |     page.on('response', (res) => {
  111 |       if (res.status() >= 400 && res.url().includes('/api/auth')) {
  112 |         apiFailures.push(`${res.status()} ${res.url()}`);
  113 |       }
  114 |     });
  115 | 
  116 |     try {
  117 |       await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
  118 |       await page.locator('#roll-number-input').fill(TEST_ACCOUNTS.superAdmin.email);
  119 |       await page.locator('#password-input').fill(TEST_ACCOUNTS.superAdmin.password);
  120 |       await page.locator('button[type="submit"]').click();
  121 | 
> 122 |       await page.waitForURL((url) => url.pathname.startsWith('/superadmin') || url.pathname.startsWith('/admin'), {
      |                  ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  123 |         timeout: 30000,
  124 |       });
  125 | 
  126 |       expect(page.url()).toContain('/superadmin');
  127 | 
  128 |       logger.record({
  129 |         testName: 'TC-SMOKE-03: Super Admin login and routing',
  130 |         role: 'SUPER_ADMIN',
  131 |         page: '/login -> /superadmin',
  132 |         action: 'Submit credentials and verify redirect',
  133 |         status: 'PASSED',
  134 |         duration: Date.now() - startTime,
  135 |         apiFailures,
  136 |         consoleErrors,
  137 |       });
  138 |     } catch (err: any) {
  139 |       logger.record({
  140 |         testName: 'TC-SMOKE-03: Super Admin login and routing',
  141 |         role: 'SUPER_ADMIN',
  142 |         page: '/login -> /superadmin',
  143 |         action: 'Submit credentials and verify redirect',
  144 |         status: 'FAILED',
  145 |         duration: Date.now() - startTime,
  146 |         apiFailures,
  147 |         consoleErrors,
  148 |         error: err.message,
  149 |       });
  150 |       throw err;
  151 |     }
  152 |   });
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
```