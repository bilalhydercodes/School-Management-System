import { BASE_AI_IDENTITY, BASE_AI_RULES } from '../prompts/base';
import type { AIDashboardContext } from './types';

/**
 * Builds the dynamic, role-aware system prompt for Alpha AI Copilot.
 * Ensures strict multi-tenancy, RBAC enforcement, and factual grounding.
 */
export function buildSystemPrompt(context: AIDashboardContext): string {
  const { user, tenant, academicYear, currentPath, role } = context;

  const schoolName = tenant?.name || (role === 'SUPER_ADMIN' ? 'Alpha Platform' : 'School');
  const boardInfo = tenant?.board ? ` (${tenant.board} Board)` : '';
  const academicYearInfo = academicYear ? ` for Academic Year ${academicYear}` : '';

  let roleGuidance = '';
  let specificContextSummary = '';

  switch (role) {
    case 'STUDENT': {
      const student = context.student;
      roleGuidance = `You are speaking with a Student named "${user.name}".
Focus on their academics, timetable, attendance percentage, upcoming exams, homework, and student notices.
Maintain an encouraging, polite, and educational tone.`;

      if (student) {
        specificContextSummary = `Student Information:
- Full Name: ${user.name}
- Class & Section: ${student.classGrade} - ${student.section}
- Admission No: ${student.admissionNumber}
- Attendance Record: ${student.attendanceSummary.presentDays}/${student.attendanceSummary.totalWorkingDays} days (${student.attendanceSummary.attendancePercentage}%)
- Upcoming Exams: ${student.upcomingExamsCount}
- Pending Assignments: ${student.pendingAssignmentsCount} (No overdue assignments currently flagged)
- Recent School Announcements: ${
          student.recentAnnouncements.length > 0
            ? student.recentAnnouncements.map((a) => `\n  * [${a.date}] ${a.title} (${a.priority})`).join('')
            : 'None currently'
        }`;
      }
      break;
    }

    case 'TEACHER': {
      const teacher = context.teacher;
      roleGuidance = `You are speaking with a Teacher named "${user.name}".
Assist them with their class schedule, assigned sections, student attendance monitoring, syllabus tracking, and staff announcements.
Maintain a professional and efficient tone.`;

      if (teacher) {
        const classesList = teacher.assignedClasses
          .map((c) => `${c.className} ${c.sectionName} (${c.subject})`)
          .join(', ');

        specificContextSummary = `Teacher Information:
- Name: ${user.name}
- Employee ID: ${teacher.employeeId}
- Department: ${teacher.department} (${teacher.designation || 'Teacher'})
- Assigned Classes: ${classesList || 'None assigned yet'}
- Classes Scheduled for Today: ${teacher.todaysClassesCount}
- Today's Attendance Status: ${teacher.attendanceStatus}
- Recent Staff Announcements: ${
          teacher.recentAnnouncements.length > 0
            ? teacher.recentAnnouncements.map((a) => `\n  * [${a.date}] ${a.title}`).join('')
            : 'None currently'
        }`;
      }
      break;
    }

    case 'PARENT': {
      const parent = context.parent;
      roleGuidance = `You are speaking with a Parent/Guardian named "${user.name}".
Assist them with their children's school attendance, upcoming exams, fee dues, notices, and parent-teacher communications.
Maintain a respectful, clear, and reassuring tone.`;

      if (parent) {
        const childrenSummary = parent.children
          .map(
            (c) =>
              `\n  * ${c.name} (Class ${c.className}-${c.sectionName}): Attendance ${c.attendancePercentage}%, Pending Invoices: ${c.pendingFeeInvoicesCount}`
          )
          .join('');

        specificContextSummary = `Parent Information:
- Name: ${user.name}
- Enrolled Children:${childrenSummary || ' None linked to this account'}
- Recent School Notices: ${
          parent.recentNotices.length > 0
            ? parent.recentNotices.map((n) => `\n  * [${n.date}] ${n.title}`).join('')
            : 'None currently'
        }`;
      }
      break;
    }

    case 'ADMIN':
    case 'ACCOUNTANT': {
      const admin = context.admin;
      roleGuidance = `You are speaking with a School Administrator (${role}) named "${user.name}".
Assist them with school oversight, student and staff metrics, daily attendance rates, operational alerts, fees, and administrative procedures.
Maintain an executive, analytical, and actionable tone.`;

      if (admin) {
        const alerts = admin.operationalAlerts.map((a) => `\n  * [${a.severity.toUpperCase()}] ${a.message}`).join('');
        specificContextSummary = `School Overview:
- Institution Name: ${admin.schoolName}
- Total Enrolled Students: ${admin.studentCount}
- Total Teaching Staff: ${admin.teacherCount}
- Today's Student Attendance: ${admin.attendanceSummary.todayPresent}/${admin.attendanceSummary.todayTotalMarked} recorded (${admin.attendanceSummary.studentAttendanceRate}%)
- Operational Alerts:${alerts || ' All daily operations currently normal'}`;
      }
      break;
    }

    case 'SUPER_ADMIN': {
      const superAdmin = context.superAdmin;
      roleGuidance = `You are speaking with the Platform Super Administrator named "${user.name}".
Assist them with multi-tenant platform health, school tenant provisioning, tenant subscriptions, and system-wide configurations.`;

      if (superAdmin) {
        specificContextSummary = `Platform Overview:
- Total Registered Schools: ${superAdmin.totalTenants}
- Active Running Schools: ${superAdmin.activeTenants}
- Pending Institution Applications: ${superAdmin.pendingApplications}`;
      }
      break;
    }

    default: {
      roleGuidance = `You are speaking with user "${user.name}" with role "${role}".`;
      break;
    }
  }

  return `${BASE_AI_IDENTITY}

${BASE_AI_RULES}

==================================================
CURRENT ERP ENVIRONMENT & CONTEXT
==================================================
Institution: ${schoolName}${boardInfo}${academicYearInfo}
Current Page / Location: ${currentPath || 'Dashboard'}
User Role: ${role}
User Full Name: ${user.name}
User Email: ${user.email}

${roleGuidance}

==================================================
VERIFIED REAL DATABASE CONTEXT (LIVE ERP DATA)
==================================================
${specificContextSummary || 'No additional live metrics available for this view.'}

==================================================
SERVER-SIDE TOOLS & FUNCTION CALLING GUIDELINES
==================================================
- You have access to authorized server-side database tools for your role.
- When the user asks for specific details such as attendance, marks, schedule, timetable, or reports, ALWAYS invoke the appropriate server-side tool to retrieve verified real-time records.
- When proposing actions (such as publishing announcements, generating study plans, or compiling attendance audit reports), invoke the corresponding proposal tool so the user can review and confirm.

Remember:
- Always base your answers on verified real data and tools.
- Give concise, clear, and helpful answers. Format lists and key data cleanly.`;
}
