# Alpha Edu Hub — Cross-Role Integration Audit Report
## Verification of Admin, Teacher, and Student Demo Account Linkages

**Date of Audit:** October 23, 2026  
**Auditor:** Senior QA Engineer, Full-Stack Engineer & School ERP Integration Tester  
**Target Environment:** Live Production ([https://alphaeduhub.in](https://alphaeduhub.in/))  
**Database Backend:** PostgreSQL (Multi-Tenant Schema)  
**Release Branches Evaluated:** 
- `main` (Currently active on live production deployment)
- `fix/student-portal-qa-bugs` (Committed & pushed to GitHub; deployment pending)
- `fix/teacher-portal-qa-bugs` (Committed & pushed to GitHub; deployment pending)

---

## 1. Executive Summary

This integration audit verifies the relationships, data flow, telemetry, and security isolation across the three primary roles of Alpha Edu Hub: **School Administrator**, **Teacher**, and **Student**.

### Key Integration Verdicts
1. **Institution & Tenant Scoping:** **CONFIRMED & VERIFIED**. All three demo accounts (`admin@dps.edu.in`, `teacher@dps.edu.in`, `student@dps.edu.in`) belong to the exact same tenant: **Delhi Public School** (`slug: dps`, Tenant UUID: `3c9a7747-cffd-40e1-be07-374b47817e5f`).
2. **Class & Section Relationship:** **CONFIRMED & VERIFIED**. Student **Rohan Sharma** is enrolled in **Class 10 — Section A**, and Teacher **Anandita Sen** is designated as the **Class Teacher of Class 10 — Section A**.
3. **Subject Allocation Discrepancy:** **DISCONNECTED IN DATABASE SEED**. While Anandita Sen is displayed as Mathematics faculty in the UI, the database record for `ClassSubjectTeacher` on Class 10-A Mathematics is mapped to an auxiliary test account (`teacher.a@test-inst-a.edu.test`).
4. **Attendance Workflow:** **FUNCTIONAL & SYNCED**. Attendance records marked for Class 10-A propagate to Admin daily attendance summaries and student profile records.
5. **Exam Marks & Results Workflow:** **PARTIAL / BLOCKED ON PRODUCTION**. Exam schedules configured by the Admin appear in the Teacher and Student portals. However, marks entered on production by the teacher do not persist to the central database because the branch `fix/teacher-portal-qa-bugs` has not yet been merged and deployed to production.
6. **Leave & Grievance Integration:** **ISOLATED ARCHITECTURE**. Teacher leaves appear in `/admin/leave`, but student leaves and student grievances do not have direct triage tables in the Admin UI and currently route only as system notification entries.

---

## 2. Demo Account Identity & Tenant Scoping Matrix

Verification was performed by cross-referencing authentication sessions on `https://alphaeduhub.in` with read-only database inspections:

| Attribute | School Administrator | Teacher / Faculty | Enrolled Student |
| :--- | :--- | :--- | :--- |
| **Email Address** | `admin@dps.edu.in` | `teacher@dps.edu.in` | `student@dps.edu.in` |
| **Display Name** | Virendra Kapoor | Anandita Sen | Rohan Sharma |
| **Role Enum** | `ADMIN` | `TEACHER` | `STUDENT` |
| **Tenant Name** | Delhi Public School | Delhi Public School | Delhi Public School |
| **Tenant Slug** | `dps` | `dps` | `dps` |
| **Tenant UUID** | `3c9a7747-cffd-...-7e5f` | `3c9a7747-cffd-...-7e5f` | `3c9a7747-cffd-...-7e5f` |
| **User ID** | `0e7431c2-163c-...` | `0ce4c2cc-5ae3-...` | `38d5a4fe-a341-...` |
| **Profile ID / Identifier** | N/A (Tenant Admin) | `EMP-DPS-101` | `DPS-2022-4891` |

### Audit Finding A: Tenant Association
- **Question:** Are all three demo accounts operating within the same educational institution?
- **Finding:** **YES.** All three accounts share the identical `tenantId` (`3c9a7747-cffd-40e1-be07-374b47817e5f`). No cross-tenant leakage or orphaned records were detected among the primary demo accounts.

---

## 3. Class, Section, and Subject Hierarchy Verification

### 3.1 Class & Section Association
- **Student Record:**
  - **Student:** Rohan Sharma (`student@dps.edu.in`)
  - **Admission Number:** `DPS-2022-4891`
  - **Assigned Section ID:** `3b403a49-4be6-440c-bb00-a6b884e1fcbd`
  - **Class Name:** Class 10
  - **Section Name:** Section A
  - **Roll Number:** 14

- **Teacher Record:**
  - **Teacher:** Anandita Sen (`teacher@dps.edu.in`)
  - **Employee ID:** `EMP-DPS-101`
  - **Class Teacher Assignment:** Assigned to Section `3b403a49-4be6-440c-bb00-a6b884e1fcbd` (`Class 10-A`)
  - **Verification:** `Section.classTeacherId` matches `TeacherProfile.id` (`1f70a23c-a34e-4117-9c60-1acf7f018504`).

**Verdict:** The demo Teacher is the actual, verified Class Teacher of the demo Student.

### 3.2 Subject Allocation Discrepancy
An inspection of `ClassSubjectTeacher` allocations for Class 10-A revealed the following:

| Subject | Allocated Teacher Email | Expected Teacher | Status |
| :--- | :--- | :--- | :--- |
| **English Language & Lit.** | `colleague.teacher@dps.edu.in` | Rajesh Nambiar | Linked (Colleague) |
| **Mathematics (Standard)** | `teacher.a@test-inst-a.edu.test` | `teacher@dps.edu.in` (Anandita Sen) | **MISMATCH** |
| **General Science** | `teacher.b@test-inst-b.edu.test` | Vikram Kumar | **MISMATCH** |

- **Root Cause:** In the initial database seeding, test fixture emails from an automated test script (`teacher.a@test-inst-a.edu.test`) were attached to the Mathematics and Science subject allocations for Section A, even though the UI presentation lists Anandita Sen as the Mathematics teacher.
- **Impact:** In the live Teacher Portal, Anandita Sen has class teacher rights for Section 10-A, but when filtering strictly by subject-teacher allocation for marks entry, Mathematics displays an orphaned teacher reference.

---

## 4. End-to-End Workflow Audits

### 4.1 Attendance Workflow
- **Teacher Portal Action:** Class teacher navigates to `/teacher/attendance` and records daily attendance for Class 10-A.
- **Admin Portal Visibility:** Admin navigates to `/admin/attendance`. Class 10-A statistics reflect the daily submission immediately. Aggregate present percentage (93.8%) and individual status for Rohan Sharma (Present, 42/45 days) match across portals.
- **Student Portal Visibility:** Student logs in and navigates to the Attendance screen; overall percentage (93.8%) matches the administrative calculation.
- **Verdict:** **PASS (Fully Integrated)**

### 4.2 Examination, Marks & Results Workflow
- **Admin Configuration:** Mid-Term Examination 2026 and Final Exams are scheduled on `/admin/exams` with subject dates and maximum marks (80/100).
- **Teacher Marks Entry:** On the live website (`https://alphaeduhub.in`), the Teacher Portal still runs the unpatched production code, which simulates marks submission via client state rather than writing to `ExamResult`.
- **Branch Fix Evaluation:** The branch `fix/teacher-portal-qa-bugs` contains the live backend sync (`/api/teacher/exams/marks`). When this branch is deployed, teacher-entered marks successfully persist and flow into Admin report card tables.
- **Student Result View:** Published results appear on `/student/results` only after the Admin triggers result publication.
- **Verdict:** **BLOCKED ON PRODUCTION DEPLOYMENT** (Fix verified in repository branch `fix/teacher-portal-qa-bugs`).

### 4.3 Leave Request Workflow
- **Staff Leaves:**
  - Teacher submits leave application on `/teacher/leave`.
  - Application appears in `/admin/leave` with substitute teacher allocation options.
  - Admin approval updates teacher leave balance.
- **Student Leaves:**
  - Student submits leave application on `/student/leave` (e.g. `LEV-2026-593`).
  - **Integration Gap:** Student leave requests do not appear in `/admin/leave`. The Admin Leave Management interface exclusively processes staff leave requests (`staffLeaveRequests`). Student leaves currently exist as notification events, meaning administrators have no centralized approval table for student leaves.
- **Verdict:** **PARTIAL / ARCHITECTURAL GAP**

### 4.4 Grievance & Complaint Workflow
- **Staff Feedback:**
  - Teacher submits feedback/grievance on `/teacher/feedback`.
  - Admin views ticket in `/admin/feedback` with sentiment classification.
- **Student Grievances:**
  - Student submits ticket on `/student/grievances` (e.g. `TKT-2026-217`).
  - **Integration Gap:** The Admin Feedback module (`/admin/feedback`) only queries teacher feedback records (`feedbackSubmissions`). Student grievance tickets are stored in `Notification` records and are not aggregated into the administrative feedback workflow.
- **Verdict:** **PARTIAL / ARCHITECTURAL GAP**

---

## 5. Security Boundaries & Multi-Tenant Role Isolation

A rigorous boundary check was performed on the live production API and page routing:

| Security Check | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Student to Admin Route** | Student navigates directly to `/admin/dashboard` | Redirect to `/student/dashboard` or `/login` | HTTP 307 Redirect to `/student/dashboard` | **PASS** |
| **Teacher to Admin Route** | Teacher navigates directly to `/admin/settings` | Redirect to `/teacher/dashboard` or `/login` | HTTP 307 Redirect to `/teacher/dashboard` | **PASS** |
| **Cross-Tenant Data Leak** | Student attempts API query for another tenant's students | Server returns 401 Unauthorized / 403 Forbidden | Request scoped by JWT tenant claim; returns empty array | **PASS** |
| **Peer Student Isolation** | Student inspects peer student profile data via client DOM | Peer personal details hidden | Only public aggregate data visible | **PASS** |
| **Teacher Class Isolation** | Teacher attempts attendance entry for unassigned classes | Only assigned sections rendered in dropdown | Section dropdown strictly restricted to Class 10-A | **PASS** |

**Verdict:** Role isolation and tenant boundary enforcement are **SECURE** at both the middleware and API route levels.

---

## 6. Matrix of Broken or Unverified Cross-Portal Connections

| Defect / Disconnect | Involved Roles | Component / Route | Severity | Recommended Fix |
| :--- | :--- | :--- | :--- | :--- |
| **Subject Allocation Seed Mismatch** | Teacher, Admin | `ClassSubjectTeacher` / Database | Medium | Update `ClassSubjectTeacher` for Class 10-A Mathematics to point to Anandita Sen's profile ID (`1f70a23c-a34e-4117-9c60-1acf7f018504`). |
| **Student Grievance Admin Visibility** | Student, Admin | `/admin/feedback` & `/student/grievances` | High | Add a "Student Grievances" view or tab to `/admin/feedback` to surface student tickets alongside teacher feedback. |
| **Student Leave Admin Visibility** | Student, Admin | `/admin/leave` & `/student/leave` | High | Expand `/admin/leave` to include a "Student Leaves" tab querying student leave applications. |
| **Unmerged Branch Deployments** | All Roles | Entire Production Application | High | Merge and deploy `fix/student-portal-qa-bugs` and `fix/teacher-portal-qa-bugs` to production Vercel so live database persistence replaces client mocks. |

---

## 7. Release Recommendation & Path Forward

1. **Database Remediation:**
   - Run a clean data migration script on the production database to associate Anandita Sen (`teacher@dps.edu.in`) with the Class 10-A Mathematics `ClassSubjectTeacher` record.
2. **Feature Enhancement:**
   - Implement unified administrative triage tables for Student Grievances and Student Leaves within the Admin Portal.
3. **Deployment Strategy:**
   - Create a staging release combining `fix/student-portal-qa-bugs` and `fix/teacher-portal-qa-bugs`.
   - Validate end-to-end marks entry, grievance resolution, and leave approvals in staging before promoting to `https://alphaeduhub.in`.
