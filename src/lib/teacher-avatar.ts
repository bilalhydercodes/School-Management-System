/**
 * Alpha Edu Hub - Teacher Avatar Resolution Utility
 * 
 * Provides gender-aware default profile avatars for teachers:
 * - Male teachers: /assets/teacher-dashboard/Male_teacher_avatar.png
 * - Female teachers: /assets/teacher-dashboard/Female_teacher_avatar.png
 * - Custom avatarUrl takes precedence when present
 */

export interface TeacherAvatarOptions {
  avatarUrl?: string | null;
  gender?: string | null;
  teacherName?: string | null;
}

export function getTeacherAvatarUrl(options?: TeacherAvatarOptions): string {
  if (options?.avatarUrl && options.avatarUrl.trim().length > 0) {
    return options.avatarUrl;
  }

  const gender = options?.gender?.toLowerCase().trim();
  if (gender === 'female' || gender === 'f' || gender === 'woman') {
    return '/assets/teacher-dashboard/Female_teacher_avatar.png';
  }
  if (gender === 'male' || gender === 'm' || gender === 'man') {
    return '/assets/teacher-dashboard/Male_teacher_avatar.png';
  }

  // Heuristic matching based on title or common female names if gender was not explicitly recorded
  const name = options?.teacherName?.toLowerCase().trim() || '';
  if (
    name.startsWith('mrs.') ||
    name.startsWith('ms.') ||
    name.startsWith('miss') ||
    /\b(anandita|priya|pooja|sunita|anita|kavita|neha|shweta|meena|ritu|anjali|deepa|geeta|seema|swati|monika|divya|shikha|jyoti|preeti|radhika|rashmi|shalini|smita|vandana|aanya|diya|tanvi|rupali)\b/i.test(
      name
    )
  ) {
    return '/assets/teacher-dashboard/Female_teacher_avatar.png';
  }

  // Default to Male teacher avatar
  return '/assets/teacher-dashboard/Male_teacher_avatar.png';
}
