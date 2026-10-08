# Codebase Error Audit

## Audit Findings
Our grep scans of the codebase revealed numerous instances of anti-patterns:

1. **Empty Catch Blocks (`catch {}`)**: Found over 50 instances across the codebase, particularly in:
   - `src/services/auth.service.ts`
   - `src/lib/tenant.ts`
   - `src/lib/offline/db.ts`
   - `src/components/registration/InstitutionRegistrationWizard.tsx`
   - Many empty catches silently swallow errors, leading to missing logic rather than handled logic.

2. **Console Error Leaks (`console.error(...)`)**: Found 120+ instances where errors are logged directly to the browser or server console, but lack structured recovery, such as:
   - `src/actions/superadmin-requests.ts`
   - `src/actions/feedback.ts`
   - `src/workers/notification.worker.ts`
   - Unstructured logs lack a request ID and aren't properly funneled to an APM/Error tracking tool.

3. **Raw Exception Throws (`throw new Error(...)`)**: Found 170+ instances of manual throws containing internal logic, paths, or database states:
   - `src/services/admission.service.ts`
   - `src/services/fee-engine.service.ts`
   - `src/ai/tools/teacher/index.ts`
   - These raw errors frequently escape to the UI because the server actions don't catch and transform them properly.

## Problem Areas
- **Database/Prisma**: Errors are thrown raw without catching unique constraint violations or mapping them to user-safe error types.
- **Next.js Error Boundaries**: Missing route-specific and component-specific error boundaries.
- **API Architecture**: Success/failure response shape is inconsistent across `route.ts` handlers.
- **Server Actions**: Not universally wrapped in try-catch to return `{ success: false, error: ... }`.

## Next Steps
We will establish a central `AppError` framework, integrate it across the app, and wrap endpoints/components.
