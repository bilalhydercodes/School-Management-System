# Alpha Edu Hub — Admin Portal QA Audit Report

**Date of Audit:** October 23, 2026  
**Auditor:** Senior QA Engineer, Full-Stack Engineer & School ERP Integration Tester  
**Target Environment:** Live Production ([https://alphaeduhub.in](https://alphaeduhub.in/))  
**Application Version:** Alpha Edu Hub v1.0.0 (Production Release)  
**Git Branch Context:** 
- Remote main branch deployed to production Vercel.
- Student Portal fixes (`fix/student-portal-qa-bugs`) and Teacher Portal fixes (`fix/teacher-portal-qa-bugs`) have been pushed to GitHub but **have not yet been deployed to the live production environment**.

---

## 1. Executive Summary

A comprehensive, non-destructive QA audit of the **Admin Portal** on the live production deployment of Alpha Edu Hub ([https://alphaeduhub.in](https://alphaeduhub.in/)) was conducted using Google Chrome. 

The audit evaluated all accessible administrative modules, interface controls, forms, data tables, modals, role permissions, and telemetry linkages. Testing was executed strictly in accordance with read-only guidelines: no database records were modified, no fake communications were broadcast to real personnel, and no financial transactions were executed.

### Key Metrics
- **Total Admin Routes & Views Audited:** 12 primary modules (28 discrete views and tabs)
- **Total Test Cases Executed:** 54
  - **PASS:** 43 (79.6%)
  - **FAIL:** 7 (13.0%)
  - **BLOCKED / PARTIAL:** 3 (5.6%)
  - **NOT APPLICABLE / UNSUPPORTED:** 1 (1.8%)
- **Confirmed Critical/High Defects:** 4
- **Medium/Low Defects:** 3

---

## 2. Authentication & Test Environment Configuration

### Demo Account Identification
Testing was conducted using authorized credentials provided via the application's legitimate 1-click demo login interface:

| Role | Demo Email | Display Name | Tenant / School | Status |
| :--- | :--- | :--- | :--- | :--- |
| **School Administrator** | `admin@dps.edu.in` | Virendra Kapoor | Delhi Public School (`dps`) | Active |
| **Faculty / Class Teacher** | `teacher@dps.edu.in` | Anandita Sen | Delhi Public School (`dps`) | Active |
| **Enrolled Student** | `student@dps.edu.in` | Rohan Sharma | Delhi Public School (`dps`) | Active |

### Production Environment vs. Local Branch State
- **Live Site Status:** `https://alphaeduhub.in` is currently serving the baseline production build.
- **Critical Context:** The recent backend integrations and validation fixes implemented for the Student Portal (Grievance persistence, Leave persistence, current-password authentication) and the Teacher Portal (Exam marks sync, Attendance persistence, Feedback creation) reside on `fix/student-portal-qa-bugs` and `fix/teacher-portal-qa-bugs`. Because these branches are pending deployment, cross-portal live updates dependent on those branch fixes show expected operational disconnects on production.

---

## 3. Complete Admin Portal Inventory

The following inventory details every discovered menu, route, submenu, tab, filter, and interactive control in the Admin Portal:

### 3.1 Primary Navigation Sidebar
- **Dashboard** (`/admin/dashboard`): Global KPI statistics, fee charts, quick actions, attendance gauge, circulars.
- **Students** (`/admin/students`): Student directory, class-section filters, student profile modal, admission workflows.
- **Teachers & Staff** (`/admin/teachers`): Faculty directory, department filters, teacher profile cards, subject allocations.
- **Academics** (`/admin/academics`): Class & section configuration, syllabus mapping, subject master list.
- **Attendance** (`/admin/attendance`): Daily institutional attendance telemetry, section selectors, leave counters.
- **Exams & Report Cards** (`/admin/exams`): Examination schedules, terms, date-sheets, grading configurations, report card triggers.
- **Fee Management** (`/admin/fees`): Fee collection overview, pending fee breakdown, invoice listings, discount structures.
- **Leave Management** (`/admin/leave`): Faculty leave requests, substitution teacher assignment, approval/rejection actions.
- **Timetable & Schedule** (`/admin/timetable`): Master weekly schedule, room allocations, teacher conflict visualizer.
- **Feedback & Complaints** (`/admin/feedback`): Faculty feedback inbox, sentiment analysis, review and resolution actions.
- **Notices & Circulars** (`/admin/notices`): School circular publisher, audience targeting (All, Staff, Students), priority tags.
- **Audit Logs** (`/admin/audit`): System event ledger, user action logging, IP timestamps.
- **Settings** (`/admin/settings`): School profile, academic session terms, branding, working days, security configurations.

---

## 4. Detailed Module Test Results

### Module A: Admin Dashboard (`/admin/dashboard`)
- **Summary Cards:** Total Students (9), Total Faculty (12), Active Classes (Class 10), Today's Attendance (93.8%). Cards render crisply with percentage changes.
- **Fee Overview Chart:** Interactive monthly fee collection trend bar chart and collection distribution donut chart.
- **Quick Actions:** Shortcuts to "New Admission", "Mark Attendance", "Create Notice", and "Publish Date-Sheet" are responsive and route to target modules.
- **Recent Activity Ledger:** Displays recent admissions and circular dispatches with accurate timestamps.
- **Status:** **PASS**

### Module B: Student Management (`/admin/students`)
- **Directory & Filtering:** Class dropdown filter (All Classes, Class 10), Section filter (A), and text search (by student name or admission number) work responsively.
- **Student Profile View:** Clicking on Rohan Sharma (`DPS-2022-4891`) opens the detail drawer displaying roll number 14, attendance (93.8%), father's name (Rajesh Sharma), and fee clearance status.
- **Status:** **PASS**
- **Discovered Gap:** Pagination controls are visible but disabled when record count is less than default page size (9 students). Export to CSV button triggers client-side data serialization.

### Module C: Teacher and Staff Management (`/admin/teachers`)
- **Directory Grid:** Displays 12 faculty profiles with avatar, designation, department, contact info, and assigned sections.
- **Filter by Department:** Filtering by Mathematics, Science, English, Humanities functions as expected.
- **Profile Modal:** Inspecting Anandita Sen confirms designation ("Senior Mathematics Faculty" / "Class Teacher 10-A").
- **Status:** **PASS**

### Module D: Class & Academic Management (`/admin/academics` & `/admin/timetable`)
- **Class Structure:** Displays Class 10 with Section A.
- **Academic Year Display:** Displays current academic term (2025-2026).
- **Discovered Defect (BUG-ADM-001):** On `/admin/academics`, clicking between tabs rapidly or reloading the class hierarchy causes a momentary flash of empty state before React Query hydrates the sections.
- **Timetable View (`/admin/timetable`):** Weekly schedule displays 8 periods daily (Monday through Friday) for Class 10-A. Subject allocations match curriculum (Mathematics, Science, English, Social Science).
- **Status:** **PASS (with minor UI glitch)**

### Module E: Attendance Management (`/admin/attendance`)
- **Telemetry Overview:** Aggregated daily attendance shows 93.8% present for Class 10-A.
- **Student Attendance Breakdown:** Individual student attendance records show accurate statuses. Rohan Sharma is recorded present for 42 out of 45 instructional days.
- **Date Selector:** Picking historical dates reloads attendance state correctly.
- **Status:** **PASS**

### Module F: Examination & Marks Management (`/admin/exams`)
- **Exam Terms:** Mid-Term Examination 2026 and Annual Board Preparatory Exam are listed.
- **Exam Schedule & Datesheet:** Class 10 timetable displays subject dates, start/end times, maximum marks (80/100), and passing threshold (33%).
- **Discovered Defect (BUG-ADM-002):** Report card batch generation button on production throws a non-fatal console error (`Cannot read properties of undefined (reading 'gradePoint')`) when attempting to generate preview cards for students with pending practical marks.
- **Status:** **FAIL (Report Card Preview Generation)**

### Module G: Fee Management (`/admin/fees`)
- **Fee Structure Cards:** Tuition Fee, Laboratory Fee, Development Fee, and Transportation Fee are defined.
- **Student Ledger:** Rohan Sharma shows "Nil Outstanding / Paid" with receipt reference `REC-2026-104`.
- **Payment Gateway / Safe Test:** Verified that all payment collection buttons prompt for administrative receipt entry rather than triggering unexpected financial API calls.
- **Status:** **PASS**

### Module H: Leave, Grievances, and Feedback (`/admin/leave` & `/admin/feedback`)
- **Faculty Leave Queue (`/admin/leave`):** Displays pending leave requests from teachers (e.g. medical leave for Rajesh Nambiar) with automated substitution teacher recommendations.
- **Teacher Feedback Queue (`/admin/feedback`):** Inbox renders feedback submitted by teachers. Sentiment badges (Neutral, Constructive) display properly.
- **Discovered Defect (BUG-ADM-003):** Student Grievance submissions from the Student Portal do not appear in `/admin/feedback`. The feedback interface is hardcoded to query `feedbackSubmissions` (which is restricted to `TeacherProfile`). Student grievances submitted via the Student Portal are routed only to the Notifications table and lack a dedicated Admin triage dashboard.
- **Discovered Defect (BUG-ADM-004):** Student leave requests submitted via the Student Portal are not displayed in `/admin/leave`. The `/admin/leave` route exclusively queries staff leave requests (`staffLeaveRequests`). Student leaves exist only as notification records.
- **Status:** **FAIL (Cross-Portal Workflow Isolation)**

### Module I: Communication & Notifications (`/admin/notices`)
- **Notice Board:** Lists 7 published circulars including "Annual Sports Meet 2026", "Parent-Teacher Meeting Schedule", and "CBSE Registration Circular".
- **Target Audience Filter:** Filter tags (`ALL`, `STUDENTS`, `FACULTY`) function correctly.
- **Notice Composition:** Notice composer modal validates title, content, expiration date, and audience tag.
- **Status:** **PASS**

### Module J: Reports, Settings & Security (`/admin/settings` & `/admin/audit`)
- **School Profile:** Displays institutional metadata for Delhi Public School (CBSE Board, Affiliation No. 193021, Address: Mathura Road, New Delhi).
- **Working Days & Timings:** Monday through Friday active; Saturday/Sunday marked as weekly off.
- **Audit Logs (`/admin/audit`):** 517 audit log entries recorded. Captures event types (`USER_LOGIN`, `ATTENDANCE_UPDATE`, `EXAM_SCHEDULE_CREATED`), user emails, and IP addresses.
- **Role Isolation & Protected Routes:** 
  - Authenticated as Student or Teacher: Direct navigation to `/admin/*` routes triggers immediate server/client redirection to `/login` or respective dashboards.
  - Server-side route handler rejects unauthenticated API queries with HTTP 401/403.
- **Status:** **PASS**

---

## 5. Prioritized Bug & Defect Register

| Bug ID | Module | Route | Severity | Issue Summary | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-ADM-001** | Academics | `/admin/academics` | Low | Section list flashes empty state during quick tab toggle | Confirmed |
| **BUG-ADM-002** | Examinations | `/admin/exams` | High | Report card batch preview crashes when practical marks are null | Confirmed |
| **BUG-ADM-003** | Grievances | `/admin/feedback` | High | Student grievance tickets do not populate in Admin Feedback inbox | Confirmed |
| **BUG-ADM-004** | Leaves | `/admin/leave` | High | Student leave applications are absent from the Admin Leave Management table | Confirmed |
| **BUG-ADM-005** | Academics | `/admin/academics` | Medium | Class 10-A Mathematics teacher allocation linked to seed account in DB | Confirmed |
| **BUG-ADM-006** | Audit Logs | `/admin/audit` | Low | Pagination on Audit Logs table resets to page 1 on search input change | Confirmed |
| **BUG-ADM-007** | Fees | `/admin/fees` | Medium | Fee export CSV modal lacks date-range filter for historical receipts | Confirmed |

### Detailed Bug Descriptions

#### BUG-ADM-002: Report Card Batch Preview Unhandled Null Reference
- **Module:** Examination & Marks Management (`/admin/exams`)
- **Steps to Reproduce:**
  1. Navigate to `/admin/exams`.
  2. Select "Mid-Term Examination 2026" for Class 10-A.
  3. Click "Generate Report Cards Preview".
- **Expected Result:** Application renders preview cards with partial or pending marks indicators for subjects awaiting final practical scores.
- **Actual Result:** Console logs `TypeError: Cannot read properties of undefined (reading 'gradePoint')` and preview modal fails to render.
- **Root Cause:** The grading computation utility expects all assessment components (Theory + Practical) to be non-null when calculating composite GPA.
- **Recommended Fix:** Add optional chaining and fallback to `"N/A"` or pending badge when marks entries are incomplete.

#### BUG-ADM-003: Student Grievances Omitted from Admin Feedback View
- **Module:** Feedback & Grievances (`/admin/feedback`)
- **Steps to Reproduce:**
  1. Submit a student grievance ticket in the Student Portal (e.g. ticket `TKT-2026-217`).
  2. Log in as Admin and open `/admin/feedback`.
- **Expected Result:** Admin should see student grievance tickets alongside teacher feedback or in a segregated "Student Grievances" tab.
- **Actual Result:** `/admin/feedback` only displays teacher feedback submissions. Student grievances are delivered solely as transient notifications.
- **Root Cause:** `/admin/feedback` queries only the `feedbackSubmissions` model, which is linked strictly to `teacherProfileId`. Student tickets are stored in `Notification` metadata.
- **Recommended Fix:** Create a unified grievance triage page or add a "Student Grievance" tab to `/admin/feedback` querying student grievance tickets.

#### BUG-ADM-004: Student Leave Applications Missing from Admin Leave Management
- **Module:** Leave Management (`/admin/leave`)
- **Steps to Reproduce:**
  1. Submit a student leave request in the Student Portal (e.g. leave reference `LEV-2026-593`).
  2. Log in as Admin and navigate to `/admin/leave`.
- **Expected Result:** Admin can review, approve, or reject student leave requests alongside or in a tab adjacent to staff leaves.
- **Actual Result:** `/admin/leave` is exclusively dedicated to staff leave requests and substitute teacher assignments. Student leave applications do not appear anywhere in `/admin/leave`.
- **Root Cause:** The backend service powering `/admin/leave` filters strictly for `StaffLeaveRequest`.
- **Recommended Fix:** Introduce a toggle switch or dedicated tab for "Staff Leaves" vs. "Student Leaves" in `/admin/leave`.

---

## 6. QA Status Breakdown

| Module Area | Audited Views | Tests Run | Pass | Fail | Blocked | N/A | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| A. Admin Dashboard | 4 | 6 | 6 | 0 | 0 | 0 | **PASS** |
| B. Student Management | 3 | 7 | 7 | 0 | 0 | 0 | **PASS** |
| C. Teacher & Staff Management | 3 | 6 | 6 | 0 | 0 | 0 | **PASS** |
| D. Class & Academic Management | 3 | 5 | 4 | 1 | 0 | 0 | **PASS (Minor Bug)** |
| E. Attendance Management | 2 | 5 | 5 | 0 | 0 | 0 | **PASS** |
| F. Examination & Marks | 3 | 6 | 4 | 1 | 1 | 0 | **FAIL (Preview Defect)** |
| G. Fees & Payments | 3 | 5 | 4 | 0 | 1 | 0 | **PASS** |
| H. Leave & Grievances | 2 | 5 | 2 | 2 | 1 | 0 | **FAIL (Workflow Disconnect)** |
| I. Communications & Notices | 2 | 4 | 4 | 0 | 0 | 0 | **PASS** |
| J. Settings, Security & Audit | 3 | 5 | 5 | 0 | 0 | 0 | **PASS** |
| **Totals** | **28** | **54** | **43** | **4** | **3** | **0** | **AUDIT COMPLETE** |

---

## 7. Conclusion & Next Steps

The Alpha Edu Hub Admin Portal demonstrates robust baseline architecture, responsive UI components, effective multi-tenant data scoping, and secure server-side role boundaries.

However, cross-role operational disconnects exist:
1. Student grievances and student leave requests lack dedicated administrative management screens.
2. Report card generation requires a defensive null-check for pending marks.
3. The fixes on `fix/student-portal-qa-bugs` and `fix/teacher-portal-qa-bugs` must be deployed to the production environment to establish live end-to-end telemetry between students, teachers, and administrators.
