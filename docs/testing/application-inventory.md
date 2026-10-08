# Alpha Edu Hub — Comprehensive Application Inventory & Audit

> **Document Version**: 1.0.0-QA  
> **Environment**: Staging / Pre-Production QA Architecture  
> **Classification**: Internal Test Architecture Specification  
> **Auditor**: QA Automation Architect  
> **Target Platform**: Multi-Tenant School ERP & White-Label CMS Platform (Next.js 14 App Router, Prisma ORM, PostgreSQL)

---

## 1. Executive Summary & Architecture Overview

Alpha Edu Hub is a multi-tenant Educational Resource Planning (ERP) platform designed for Indian K-12 school boards (CBSE, ICSE, State Boards).

### Architecture Highlights:
* **Frontend/Backend**: Next.js 14 App Router (`src/app`), Server Components, Client Components, Server Actions (`src/actions`), and API Route Handlers (`src/app/api`).
* **Authentication**: Hybrid architecture supporting authoritative Clerk session verification alongside localized JWT cookie authentication (`session_token`, `refresh_token`), password encryption (`bcryptjs`), and role-based session TTL controls.
* **Database & Multi-Tenancy**: PostgreSQL via Prisma ORM (49 relational models). Tenant isolation is strictly enforced through `tenantId` foreign keys across academic years, users, classes, sections, and fee structures.
* **Asynchronous Processing**: BullMQ with Redis for background notification dispatch and system jobs (`src/workers/notification.worker.ts`).
* **AI Capabilities**: Groq SDK / OpenAI compatible endpoints running RAG knowledge base search, conversational agent tooling, and academic performance insights (`src/ai`).
* **Payment Integration**: Razorpay payment order initiation and webhook verification (`src/actions/payment.ts`, `src/app/api/webhooks/razorpay/route.ts`).

---

## 2. User Roles & Permission Matrix

| Role | Identifiers | Scope / Access Level | Default Landing Page |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `SUPER_ADMIN` | Platform-wide root administrator. Manages institutions, tenants, custom domains, SaaS subscription tiers, and system health. | `/superadmin` |
| **School Admin** | `ADMIN` | Institution administrator. Full control over faculty, students, admissions, fees, timetables, academic years, exams, and attendance within their tenant. | `/admin` |
| **Accountant** | `ACCOUNTANT` | Financial sub-admin. Manages fee structures, fee invoices, payment reconciliations, and financial reporting within tenant. | `/admin/fees` |
| **Teacher** | `TEACHER` | Faculty member. Manages class attendance, subject marks entry, syllabus schedule, leave requests, feedback, and student remarks. | `/teacher` |
| **Student** | `STUDENT` | Enrolled learner. Views attendance, class timetable, examination marks, report cards, fee invoices, announcements, and AI academic tutor. | `/portal` |
| **Parent** | `PARENT` | Guardian of enrolled student(s). Multi-child switcher, fee payments via Razorpay, attendance oversight, teacher notices, and parent consent forms. | `/portal?child=[id]` |

---

## 3. Comprehensive Route & Page Inventory

### 3.1 Public Marketing & CMS Routes

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/` | Landing page & platform overview | Any | No | Optional (Custom Domain) | CTA Navigation, Lead Capture | None | `Tenant` (if custom domain) | None | Low |
| `/about` | Institutional background & mission | Any | No | No | Content review | None | None | None | Low |
| `/features` | Core modules & capabilities showcase | Any | No | No | Feature discovery | None | None | None | Low |
| `/modules` | Granular breakdown of ERP modules | Any | No | No | Module exploration | None | None | None | Low |
| `/pricing` | Tiered SaaS pricing & plan comparisons | Any | No | No | Plan selection | None | `SubscriptionPlan` | None | Medium |
| `/faq` | Frequently asked questions | Any | No | No | FAQ accordion toggle | None | None | None | Low |
| `/contact` | Sales & customer contact form | Any | No | No | Contact inquiry submission | None | None | Email SMTP | Medium |
| `/testimonials` | School testimonials & case studies | Any | No | No | Review reading | None | None | None | Low |
| `/why-us` | Competitive differentiation | Any | No | No | Content review | None | None | None | Low |
| `/privacy-policy` | Privacy policy & data protection terms | Any | No | No | Compliance review | None | None | None | Low |
| `/terms` | Terms of service | Any | No | No | Legal review | None | None | None | Low |
| `/refund-policy` | SaaS refund policy terms | Any | No | No | Legal review | None | None | None | Low |
| `/guides` | Educational guides index | Any | No | No | Guide discovery | None | None | None | Low |
| `/guides/*` | Dedicated SEO knowledge articles (5 pages) | Any | No | No | Content reading | None | None | None | Low |

---

### 3.2 Authentication & Onboarding Routes

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/login` | Universal credentials login portal | Unauthenticated | No | No (Auto-resolved) | Email/Password entry, Role redirection | `/api/auth/login`, `loginAction` | `User`, `Tenant`, `RefreshToken` | Clerk (Optional) | **Critical** |
| `/login/forgot-password` | Self-service password reset request | Unauthenticated | No | No | Submit email for reset link | `forgotPasswordAction` | `User` | Nodemailer SMTP | High |
| `/change-password` | Mandatory initial password change | Authenticated | Yes | Yes | Update temporary password | `changePasswordAction` | `User` | None | High |
| `/register` | Onboarding gateway & school portal | Any | No | No | Flow selection | None | None | None | Medium |
| `/register/institution` | 5-stage institutional onboarding form | Any | No | No | School registration submission | `registerInstitutionAction` | `InstitutionApplication` | Razorpay (Setup fee) | **High** |
| `/register/institution/status/[applicationId]` | Application verification tracker | Any | No | No | Real-time status lookup | `getInstitutionApplicationStatusAction` | `InstitutionApplication` | None | Medium |
| `/register/activate` | Token-based institution activation | Any | No | No | Admin password creation | `activateInstitutionAction` | `InstitutionApplication`, `Tenant`, `User` | None | **Critical** |
| `/unauthorized` | RBAC access denied fallback screen | Any | Yes | No | Relogin / Back to portal | None | None | None | Low |

---

### 3.3 Super Admin Routes (`/superadmin`)

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/superadmin` | Global platform KPI dashboard | `SUPER_ADMIN` | Yes | No | View global metrics, tenants, licenses | `getSuperAdminDashboardDataAction` | `Tenant`, `User`, `SubscriptionPlan` | None | High |
| `/superadmin/institution-requests` | Review new school onboarding applications | `SUPER_ADMIN` | Yes | No | Approve, reject, review school docs | `getInstitutionApplicationsAction`, `reviewInstitutionApplicationAction` | `InstitutionApplication`, `Tenant`, `User` | Nodemailer SMTP | **Critical** |
| `/superadmin/tenants` | Manage active school tenant organizations | `SUPER_ADMIN` | Yes | No | Suspend, reactivate, manage quotas | `getAllTenantsAction`, `updateTenantStatusAction` | `Tenant`, `User`, `SubscriptionPlan` | None | **Critical** |
| `/superadmin/subscriptions` | SaaS subscription plans & billing | `SUPER_ADMIN` | Yes | No | Modify plans, feature entitlements | `updateTenantSubscriptionAction` | `SubscriptionPlan`, `Tenant` | Razorpay | High |
| `/superadmin/domains` | Custom domain mapping & SSL status | `SUPER_ADMIN` | Yes | No | Verify CNAME, bind school domain | Server Actions | `TenantDomain`, `Tenant` | DNS / Cloudflare | High |

---

### 3.4 School Admin & Accountant Routes (`/admin`)

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/admin` | Institution operational overview | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Quick stats, alert dispatch, audit check | Layout Context & Data Fetchers | `Tenant`, `User`, `StudentProfile`, `TeacherProfile` | None | High |
| `/admin/students` | Student directory & records | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Add student, edit profile, assign section | `src/actions/admin/students.ts` | `StudentProfile`, `User`, `Section`, `ClassGrade` | None | High |
| `/admin/teachers` | Faculty directory & assignments | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Onboard teacher, assign subjects | `src/actions/admin/teachers.ts` | `TeacherProfile`, `User`, `ClassSubjectTeacher` | None | High |
| `/admin/parents` | Parent directory & child linking | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Add parent, link students, verify KYC | `src/actions/admin/parents.ts` | `ParentProfile`, `ParentStudentLink` | None | High |
| `/admin/academics` | Academic structure (Classes & Sections) | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Create classes, sections, subjects | Server Actions | `AcademicYear`, `ClassGrade`, `Section`, `Subject` | None | High |
| `/admin/attendance` | School-wide student & staff attendance | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | View daily attendance, export logs | `src/actions/attendance.ts` | `StudentAttendance`, `StaffAttendance` | None | High |
| `/admin/fees` | Fee categories, structures & invoices | `ADMIN`, `ACCOUNTANT` | Yes | Yes | Generate invoices, record offline payments | `src/actions/admin/fees.ts`, `src/services/fee-engine.service.ts` | `FeeCategory`, `FeeStructure`, `FeeInvoice`, `FeePayment` | Razorpay | **Critical** |
| `/admin/timetable` | Class & teacher timetable matrix | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Schedule periods, check conflicts | `src/actions/admin/timetable.ts`, `timetable-conflict.service.ts` | `PeriodTimeSlot`, `TimetableEntry` | None | High |
| `/admin/substitutions` | Faculty leave substitution engine | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Assign substitute teachers | `src/actions/admin/substitutions.ts` | `TeacherSubstitution`, `TimetableEntry` | None | High |
| `/admin/exams` | Examination terms, schedules & grading | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Create exam terms, publish results | Server Actions | `ExamTerm`, `ExamSchedule`, `ExamResult`, `GradeScale` | None | High |
| `/admin/feedback` | Teacher feedback & student evaluations | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | View anonymized student feedback per faculty, configure cycles | `getAdminFeedbackAnalyticsAction`, `getAdminTeacherFeedbackDetailAction` | `FeedbackCycle`, `FeedbackSubmission`, `FeedbackAnswer` | None | High |
| `/admin/admissions` | Online admission inquiries & pipeline | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Review applications, convert to student | `src/actions/admin/admissions.ts`, `admission.service.ts` | `AdmissionApplication`, `StudentProfile` | None | High |
| `/admin/calendar` | Academic calendar events & dates | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Create academic milestones | `src/actions/admin/calendar.ts` | `CalendarEvent`, `AcademicYear` | None | Medium |
| `/admin/holidays` | Official school holiday schedule | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Add government/school holidays | `src/actions/holidays.ts` | `Holiday` | None | Medium |
| `/admin/events` | School events & extracurricular activities | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Publish sports day, annual day | `src/actions/events.ts` | `Event` | None | Medium |
| `/admin/notices` | Institutional broadcast notices | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Send notices to teachers, parents | `src/actions/admin/notices.ts` | `Notice`, `Notification` | BullMQ Redis | High |
| `/admin/notifications` | Admin alert center | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Mark read, filter notifications | `src/actions/notifications.ts` | `Notification` | None | Low |
| `/admin/emergency` | Emergency contacts directory | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Add police, hospital, transport contacts | `src/actions/emergency.ts` | `EmergencyContact` | None | Medium |
| `/admin/bulk-import` | Bulk Excel upload for students & marks | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Upload `.xlsx` template, parse rows | `src/actions/admin/import.ts` | `StudentProfile`, `User`, `ExamResult` | `exceljs` | **Critical** |
| `/admin/reports` | Exportable analytics & compliance reports | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Attendance & fee summary exports | Server Actions | Multiple models | None | High |
| `/admin/audit` | Tamper-evident system audit log | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Review login events, record changes | Server Actions | `AuditLog` | None | High |
| `/admin/settings` | School branding, board, preferences | `ADMIN`, `SUPER_ADMIN` | Yes | Yes | Upload logo, update CBSE affiliation | Server Actions | `Tenant`, `TenantBranding` | Storage | High |

---

### 3.5 Teacher Portal Routes (`/teacher`)

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/teacher` | Teacher dashboard & daily agenda | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View today's schedule, pending attendance | Dashboard query | `TeacherProfile`, `TimetableEntry`, `StudentAttendance` | None | High |
| `/teacher/attendance` | Faculty self-attendance record | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View check-in records | Server Actions | `StaffAttendance` | None | Medium |
| `/teacher/class-attendance` | Section daily attendance register | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Mark Present/Absent/Late with offline sync | `markStudentAttendanceAction`, Offline sync | `StudentAttendance`, `Section`, `StudentProfile` | Local IndexedDB | **Critical** |
| `/teacher/marks` | Exam marks entry & tabulation | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Enter subject scores per student | Server Actions | `ExamResult`, `ExamSchedule`, `StudentProfile` | None | **Critical** |
| `/teacher/marks/import` | Bulk Excel marks upload | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Upload exam spreadsheet | Server Actions | `ExamResult`, `ExamSchedule` | `exceljs` | High |
| `/teacher/schedule` | Weekly period & teaching schedule | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View assigned periods | Server Actions | `TimetableEntry`, `PeriodTimeSlot` | None | Medium |
| `/teacher/timetable` | Full school timetable matrix | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View room & class schedules | Server Actions | `TimetableEntry` | None | Medium |
| `/teacher/students` | Assigned students roster & profiles | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View student details & guardian info | Server Actions | `StudentProfile`, `Section` | None | High |
| `/teacher/remarks` | Behavioral remarks & observations | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Log praise or disciplinary notice | Server Actions | `StudentProfile`, `Notice` | None | Medium |
| `/teacher/leave/apply` | Faculty leave application | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Apply for casual/medical leave | Server Actions | `StaffAttendance` | None | Medium |
| `/teacher/leave/status` | Leave approval tracker | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Track approval from Academic Head | Server Actions | `StaffAttendance` | None | Low |
| `/teacher/feedback` | Teacher feedback evaluation insights | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View student feedback aggregations | `getTeacherAggregatedFeedbackAction` | `FeedbackSubmission`, `FeedbackAnswer` | None | Medium |
| `/teacher/notices` | Faculty notices & announcements | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | Read staff notices | Server Actions | `Notice` | None | Low |
| `/teacher/events` | School events calendar | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View event schedule | Server Actions | `Event` | None | Low |
| `/teacher/calendar` | Academic calendar dates | `TEACHER`, `SUPER_ADMIN` | Yes | Yes | View term schedule | Server Actions | `CalendarEvent` | None | Low |

---

### 3.6 Student & Parent Portal Routes (`/portal`)

| Route | Purpose | Role | Auth Required | Tenant Required | Important Actions | API / Action Dependencies | Database Dependencies | External Services | Risk Level |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| `/portal` | Unified student & parent dashboard | `STUDENT`, `PARENT` | Yes | Yes | Child switching, attendance, marks, fees, timetable, notices | Multi-module fetchers | `StudentProfile`, `ParentProfile`, `FeeInvoice`, `ExamResult` | Razorpay (Fee payment), Groq AI | **Critical** |
| `/portal?child=[id]` | Parent active child selector | `PARENT` | Yes | Yes | Switch active child context | In-page revalidation | `ParentStudentLink`, `StudentProfile` | None | **Critical** |

---

### 3.7 API Endpoints (`src/app/api`)

| Route Handler | Method(s) | Role Allowed | Auth Required | Tenant Required | Purpose | External Dependencies | Risk Level |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| `/api/auth/login` | `POST` | Any | No | No | Password authentication, JWT issue | None | **Critical** |
| `/api/auth/logout` | `POST` | Authenticated | Yes | Yes | Session token revocation | None | High |
| `/api/health` | `GET` | Any | No | No | Kubernetes liveness probe | None | Low |
| `/api/health/ready` | `GET` | Any | No | No | PostgreSQL readiness probe | PostgreSQL | Medium |
| `/api/webhooks/razorpay` | `POST` | Razorpay IP | Signature | Resolved from event | Payment status verification | Razorpay Webhook Secret | **Critical** |
| `/api/ai/chat` | `POST` | All Auth | Yes | Yes | Context-aware AI tutoring & assistant | Groq SDK / LLM | High |
| `/api/ai/actions/execute` | `POST` | All Auth | Yes | Yes | AI autonomous tool execution | Groq SDK / LLM | **Critical** |
| `/api/ai/conversations` | `GET`, `POST` | All Auth | Yes | Yes | AI conversation thread management | None | Medium |
| `/api/ai/conversations/[id]` | `GET`, `DELETE`| All Auth | Yes | Yes | Fetch or delete conversation thread | None | Medium |
| `/api/ai/insights` | `GET` | All Auth | Yes | Yes | Role-based academic AI insights | None | Medium |

---

## 4. Key User Journeys & Critical Paths

1. **School Registration & Institutional Provisioning**:
   * Journey: Landing Page -> `/register/institution` (5 stages) -> Super Admin Approval (`/superadmin/institution-requests`) -> School Activation (`/register/activate`) -> Admin Password Setup.
2. **Academic Structure & Onboarding**:
   * Journey: Admin Login -> `/admin/academics` (Classes & Sections) -> `/admin/teachers` (Faculty) -> `/admin/students` (Enrollment or `/admin/bulk-import`) -> `/admin/timetable` (Period Slots & Conflicts).
3. **Daily Attendance Workflow (Offline-Capable)**:
   * Journey: Teacher Login -> `/teacher/class-attendance` -> Section selection -> Mark Attendance (Present/Absent/Late) -> Offline IndexedDB Cache -> Online Re-sync -> Admin Summary (`/admin/attendance`).
4. **Student Assessment & Examination Tabulation**:
   * Journey: Admin creates `ExamTerm` (`/admin/exams`) -> Teacher enters marks (`/teacher/marks` or `/teacher/marks/import`) -> Report card generated -> Student/Parent views report card (`/portal`).
5. **Fee Invoicing & Online Payment Settlement**:
   * Journey: Accountant defines `FeeStructure` (`/admin/fees`) -> Invoices generated -> Parent receives invoice in `/portal` -> Razorpay Checkout initiated -> Webhook verified (`/api/webhooks/razorpay`) -> Invoice marked `PAID`.
6. **Teacher Feedback & Evaluation (Privacy Preserved)**:
   * Journey: Admin launches `FeedbackCycle` (`/admin/feedback`) -> Student completes feedback (`/portal`) -> Feedback answers stored -> Admin reviews teacher-wise evaluations with student identity suppressed.
7. **AI Tutor & Administrative Copilot**:
   * Journey: Student/Parent asks question in `/portal` AI widget -> AI validates RBAC -> Queries local student context -> Streams response.

---

## 5. Risk Assessment & High-Priority Targets

1. **Tenant Cross-Contamination**:
   * Risk: User from Institution A viewing or modifying records of Institution B.
   * Priority: **P0 (Critical)**.
2. **Role & Privilege Escalation**:
   * Risk: Student accessing `/admin` or `/teacher` routes; Teacher approving leave or editing fee structures.
   * Priority: **P0 (Critical)**.
3. **Financial Integrity & Payment Tampering**:
   * Risk: Fake Razorpay payment signatures or unauthorized invoice status modification.
   * Priority: **P0 (Critical)**.
4. **Bulk Import Injection**:
   * Risk: Malformed or unvalidated Excel sheets crashing database or importing corrupted profiles.
   * Priority: **P1 (High)**.
5. **Offline Attendance Synchronization Collisions**:
   * Risk: Conflict between locally cached attendance and concurrent server submissions.
   * Priority: **P1 (High)**.
