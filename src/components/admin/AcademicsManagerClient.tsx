'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Clock,
  UserCheck,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Building2,
  Users,
  Search,
  Trash2,
  Edit2,
  User,
  School,
  Hash,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminModal from './ui/AdminModal';
import {
  assignTeacherSubstitutionAction,
  cancelTeacherSubstitutionAction,
} from '@/actions/admin/substitutions';
import {
  createClassGradeAction,
  createSectionAction,
  deleteClassGradeAction,
  deleteSectionAction,
  assignClassTeacherAction,
} from '@/actions/admin/academics';
import { DayOfWeek } from '@prisma/client';

export interface TimetableSlotItem {
  id: string;
  sectionId: string;
  sectionName: string;
  classGradeName: string;
  periodName: string;
  startTime: string;
  endTime: string;
  order: number;
  isBreak: boolean;
  dayOfWeek: DayOfWeek;
  subjectName?: string | null;
  subjectCode?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  activeSubstitution?: {
    id: string;
    substituteTeacherId: string;
    substituteTeacherName: string;
    reason?: string | null;
    status: string;
    date: string;
  } | null;
}

export interface TeacherLookupItem {
  id: string;
  name: string;
  department: string;
}

export interface SubstitutionItem {
  id: string;
  date: string;
  timetableEntryId: string;
  periodName: string;
  timeRange: string;
  classSection: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName: string;
  reason?: string | null;
  status: string;
}

export interface SectionItem {
  id: string;
  name: string;
  classTeacherId?: string | null;
  classTeacherName?: string | null;
  studentCount: number;
}

export interface ClassGradeItem {
  id: string;
  name: string;
  numericOrder: number;
  sectionCount: number;
  studentCount: number;
  sections: SectionItem[];
}

export interface AcademicsManagerClientProps {
  timetableSlots: TimetableSlotItem[];
  teachers: TeacherLookupItem[];
  sections: { id: string; name: string; classGradeName: string }[];
  recentSubstitutions: SubstitutionItem[];
  initialClassGrades?: ClassGradeItem[];
}

const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AcademicsManagerClient({
  timetableSlots: initialSlots,
  teachers,
  sections: initialFlatSections,
  recentSubstitutions: initialSubs,
  initialClassGrades = [],
}: AcademicsManagerClientProps) {
  const router = useRouter();

  // Active top-level Tab: 'classes' | 'timetable'
  const [activeTab, setActiveTab] = useState<'classes' | 'timetable'>('classes');

  // Classes & Sections state
  const [classGrades, setClassGrades] = useState<ClassGradeItem[]>(initialClassGrades);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ message?: string; error?: string } | null>(null);

  // Modal 1: Add Class / Section Unified Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'class' | 'section'>('class');

  // Form: Create Class
  const [newClassName, setNewClassName] = useState('');
  const [newClassOrder, setNewClassOrder] = useState<number | ''>('');
  const [newClassSections, setNewClassSections] = useState<string>('A, B');
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Form: Create Section
  const [targetClassId, setTargetClassId] = useState<string>(initialClassGrades[0]?.id || '');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionTeacherId, setNewSectionTeacherId] = useState<string>('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  // Modal 2: Assign Class Teacher Modal
  const [editingSection, setEditingSection] = useState<{
    sectionId: string;
    sectionName: string;
    classGradeName: string;
    currentTeacherId?: string | null;
  } | null>(null);
  const [selectedTeacherForSection, setSelectedTeacherForSection] = useState<string>('');
  const [isUpdatingTeacher, setIsUpdatingTeacher] = useState(false);

  // Timetable & Substitution State
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialFlatSections[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlotItem[]>(initialSlots);
  const [recentSubstitutions, setRecentSubstitutions] = useState<SubstitutionItem[]>(initialSubs);

  // Substitution Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<TimetableSlotItem | null>(null);
  const [subDate, setSubDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subTeacherId, setSubTeacherId] = useState<string>('');
  const [subReason, setSubReason] = useState<string>('');
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Calculated Totals
  const totalStudentsAcrossClasses = useMemo(() => {
    return classGrades.reduce((sum, cg) => sum + cg.studentCount, 0);
  }, [classGrades]);

  const totalSectionsAcrossClasses = useMemo(() => {
    return classGrades.reduce((sum, cg) => sum + cg.sections.length, 0);
  }, [classGrades]);

  // Filtered Class Grades by search query
  const filteredClassGrades = useMemo(() => {
    if (!searchQuery.trim()) return classGrades;
    const q = searchQuery.toLowerCase().trim();
    return classGrades.filter(
      (cg) =>
        cg.name.toLowerCase().includes(q) ||
        cg.sections.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.classTeacherName && s.classTeacherName.toLowerCase().includes(q))
        )
    );
  }, [classGrades, searchQuery]);

  // Filtered Slots for the selected Section & Day
  const currentSlots = useMemo(() => {
    return timetableSlots
      .filter((s) => s.sectionId === selectedSectionId && s.dayOfWeek === selectedDay)
      .sort((a, b) => a.order - b.order);
  }, [timetableSlots, selectedSectionId, selectedDay]);

  const activeSubsCount = useMemo(() => {
    return recentSubstitutions.filter((s) => s.status === 'ASSIGNED').length;
  }, [recentSubstitutions]);

  // Open Add Modal targeting Section directly
  const openAddSectionForClass = (classId: string) => {
    setTargetClassId(classId);
    setNewSectionName('');
    setNewSectionTeacherId('');
    setAddModalTab('section');
    setIsAddModalOpen(true);
  };

  // Open Add Modal targeting Class
  const openAddClassModal = () => {
    setNewClassName('');
    setNewClassOrder('');
    setNewClassSections('A, B');
    setAddModalTab('class');
    setIsAddModalOpen(true);
  };

  // 1. Submit: Add Class Grade
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      setFeedback({ error: 'Please enter a class name (e.g., Grade 10).' });
      return;
    }

    setIsCreatingClass(true);
    setFeedback(null);

    const initialSecs = newClassSections
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await createClassGradeAction({
      name: newClassName.trim(),
      numericOrder: typeof newClassOrder === 'number' ? newClassOrder : undefined,
      initialSections: initialSecs.length > 0 ? initialSecs : ['A'],
    });

    setIsCreatingClass(false);

    if (res.success && res.classGrade) {
      const created = res.classGrade;
      const newGradeItem: ClassGradeItem = {
        id: created.id,
        name: created.name,
        numericOrder: created.numericOrder,
        sectionCount: created.sections.length,
        studentCount: 0,
        sections: created.sections.map((s) => ({
          id: s.id,
          name: s.name,
          classTeacherId: null,
          classTeacherName: null,
          studentCount: 0,
        })),
      };

      setClassGrades((prev) => [...prev, newGradeItem].sort((a, b) => a.numericOrder - b.numericOrder));
      setFeedback({ message: `Successfully added ${created.name} with ${created.sections.length} section(s).` });
      setIsAddModalOpen(false);
      setNewClassName('');
      setNewClassOrder('');
      router.refresh();
    } else {
      setFeedback({ error: res.error || 'Failed to create class.' });
    }
  };

  // 2. Submit: Add Section to Class
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassId) {
      setFeedback({ error: 'Please select a parent class.' });
      return;
    }
    if (!newSectionName.trim()) {
      setFeedback({ error: 'Please enter a section name (e.g., C).' });
      return;
    }

    setIsCreatingSection(true);
    setFeedback(null);

    const res = await createSectionAction({
      classGradeId: targetClassId,
      name: newSectionName.trim(),
      classTeacherId: newSectionTeacherId || null,
    });

    setIsCreatingSection(false);

    if (res.success && res.section) {
      const sec = res.section;
      setClassGrades((prev) =>
        prev.map((cg) => {
          if (cg.id === targetClassId) {
            return {
              ...cg,
              sectionCount: cg.sectionCount + 1,
              sections: [
                ...cg.sections,
                {
                  id: sec.id,
                  name: sec.name,
                  classTeacherId: sec.classTeacherId,
                  classTeacherName: sec.classTeacher
                    ? `${sec.classTeacher.user.firstName} ${sec.classTeacher.user.lastName}`
                    : null,
                  studentCount: 0,
                },
              ].sort((a, b) => a.name.localeCompare(b.name)),
            };
          }
          return cg;
        })
      );

      setFeedback({ message: `Section "${sec.name}" created under ${sec.classGrade.name}.` });
      setIsAddModalOpen(false);
      setNewSectionName('');
      setNewSectionTeacherId('');
      router.refresh();
    } else {
      setFeedback({ error: res.error || 'Failed to create section.' });
    }
  };

  // 3. Delete Class Grade
  const handleDeleteClass = async (classId: string, className: string) => {
    if (!confirm(`Are you sure you want to delete "${className}"? This will remove all associated sections.`)) {
      return;
    }

    setFeedback(null);
    const res = await deleteClassGradeAction({ id: classId });
    if (res.success) {
      setClassGrades((prev) => prev.filter((cg) => cg.id !== classId));
      setFeedback({ message: `Class "${className}" deleted successfully.` });
      router.refresh();
    } else {
      setFeedback({ error: res.error || 'Failed to delete class.' });
    }
  };

  // 4. Delete Section
  const handleDeleteSection = async (sectionId: string, sectionName: string, className: string) => {
    if (!confirm(`Are you sure you want to delete Section "${sectionName}" of ${className}?`)) {
      return;
    }

    setFeedback(null);
    const res = await deleteSectionAction({ id: sectionId });
    if (res.success) {
      setClassGrades((prev) =>
        prev.map((cg) => ({
          ...cg,
          sections: cg.sections.filter((s) => s.id !== sectionId),
          sectionCount: cg.sections.filter((s) => s.id !== sectionId).length,
        }))
      );
      setFeedback({ message: `Section "${sectionName}" removed.` });
      router.refresh();
    } else {
      setFeedback({ error: res.error || 'Failed to delete section.' });
    }
  };

  // 5. Open Teacher Assignment Modal
  const openTeacherModal = (section: SectionItem, classGradeName: string) => {
    setEditingSection({
      sectionId: section.id,
      sectionName: section.name,
      classGradeName,
      currentTeacherId: section.classTeacherId,
    });
    setSelectedTeacherForSection(section.classTeacherId || '');
  };

  // 6. Submit Teacher Assignment
  const handleAssignTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsUpdatingTeacher(true);
    const res = await assignClassTeacherAction(
      editingSection.sectionId,
      selectedTeacherForSection || null
    );
    setIsUpdatingTeacher(false);

    if (res.success && res.section) {
      const sec = res.section;
      const teacherName = sec.classTeacher
        ? `${sec.classTeacher.user.firstName} ${sec.classTeacher.user.lastName}`
        : null;

      setClassGrades((prev) =>
        prev.map((cg) => ({
          ...cg,
          sections: cg.sections.map((s) =>
            s.id === sec.id
              ? { ...s, classTeacherId: sec.classTeacherId, classTeacherName: teacherName }
              : s
          ),
        }))
      );

      setFeedback({ message: `Class Teacher updated for ${editingSection.classGradeName} - ${editingSection.sectionName}.` });
      setEditingSection(null);
      router.refresh();
    } else {
      setFeedback({ error: res.error || 'Failed to update class teacher.' });
    }
  };

  // Timetable Substitution Handlers
  const openAssignModal = (slot: TimetableSlotItem) => {
    setTargetSlot(slot);
    const candidate = teachers.find((t) => t.id !== slot.teacherId);
    setSubTeacherId(candidate?.id || '');
    setSubReason('Emergency substitution assigned by administration');
    setAssignError(null);
    setIsAssignModalOpen(true);
  };

  const handleAssignSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlot) return;
    if (!subTeacherId) {
      setAssignError('Please select a substitute teacher.');
      return;
    }

    setIsSubmittingSub(true);
    setAssignError(null);

    const res = await assignTeacherSubstitutionAction({
      timetableEntryId: targetSlot.id,
      substituteTeacherId: subTeacherId,
      date: subDate,
      reason: subReason || undefined,
    });

    setIsSubmittingSub(false);

    if (res.success && res.substitution) {
      const subTeacher = teachers.find((t) => t.id === subTeacherId);
      const newSub: SubstitutionItem = {
        id: res.substitution.id,
        date: subDate,
        timetableEntryId: targetSlot.id,
        periodName: targetSlot.periodName,
        timeRange: `${targetSlot.startTime} - ${targetSlot.endTime}`,
        classSection: `${targetSlot.classGradeName}-${targetSlot.sectionName}`,
        subjectName: targetSlot.subjectName || 'General',
        originalTeacherName: targetSlot.teacherName || 'Faculty',
        substituteTeacherName: subTeacher?.name || 'Substitute',
        reason: subReason,
        status: 'ASSIGNED',
      };

      setRecentSubstitutions((prev) => [newSub, ...prev]);
      setTimetableSlots((prev) =>
        prev.map((s) =>
          s.id === targetSlot.id
            ? {
                ...s,
                activeSubstitution: {
                  id: res.substitution.id,
                  substituteTeacherId: subTeacherId,
                  substituteTeacherName: subTeacher?.name || 'Substitute',
                  reason: subReason,
                  status: 'ASSIGNED',
                  date: subDate,
                },
              }
            : s
        )
      );

      setIsAssignModalOpen(false);
      setTargetSlot(null);
    } else {
      setAssignError(res.error || 'Failed to assign substitution.');
    }
  };

  const handleCancelSubstitution = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this substitution?')) return;

    setCancellingId(id);
    const res = await cancelTeacherSubstitutionAction(id);
    setCancellingId(null);

    if (res.success) {
      setRecentSubstitutions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' } : s))
      );
      setTimetableSlots((prev) =>
        prev.map((s) => (s.activeSubstitution?.id === id ? { ...s, activeSubstitution: null } : s))
      );
    } else {
      alert(res.error || 'Failed to cancel substitution.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header with Breadcrumbs & Action Buttons */}
      <PageHeader
        title="Classes, Sections & Daily Schedule"
        subtitle="Configure institution classes and sections, assign faculty leaders, and monitor daily instruction coverage."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Academics' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={openAddClassModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B72E7] hover:bg-[#095ec2] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class / Section</span>
            </button>
            <Link href="/admin/timetable">
              <AdminButton variant="secondary" icon={<Calendar className="w-3.5 h-3.5" />}>
                Master Builder
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* Global Feedback Banner */}
      {feedback?.message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {feedback?.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{feedback.error}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Classes</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{classGrades.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Academic grade tiers</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">{totalSectionsAcrossClasses}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Classroom divisions</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Students</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{totalStudentsAcrossClasses}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Enrolled across classes</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Roster</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{teachers.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Available teaching faculty</p>
        </AdminCard>
      </div>

      {/* 3. Top Mode Toggle Switcher: Classes & Sections vs Timetable Grid */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Classes &amp; Sections</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'classes' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {classGrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Daily Schedule &amp; Substitution</span>
            {activeSubsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                {activeSubsCount} active
              </span>
            )}
          </button>
        </div>

        {activeTab === 'classes' && (
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search class or section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0B72E7]"
            />
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CLASSES & SECTIONS DIRECTORY & MANAGEMENT           */}
      {/* ========================================================= */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {filteredClassGrades.length === 0 ? (
            <AdminCard className="p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto mb-3">
                <School className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery ? 'No matching classes found' : 'No classes configured yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                {searchQuery
                  ? `No classes or sections matched "${searchQuery}". Clear your search query.`
                  : 'Get started by creating your institution’s first class grade with sections.'}
              </p>
              <button
                onClick={openAddClassModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B72E7] text-white rounded-xl text-xs font-semibold hover:bg-[#095ec2] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Class / Section</span>
              </button>
            </AdminCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClassGrades.map((cg) => (
                <div
                  key={cg.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,45,95,0.04)] hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Class Header */}
                  <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50/50 to-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#0B72E7] text-xs font-black flex items-center justify-center">
                            {cg.numericOrder || '#'}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{cg.name}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                          <span>{cg.sections.length} Section{cg.sections.length === 1 ? '' : 's'}</span>
                          <span>•</span>
                          <span className="text-slate-700 font-semibold">{cg.studentCount} Students</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openAddSectionForClass(cg.id)}
                          title={`Add new section to ${cg.name}`}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0B72E7] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Section</span>
                        </button>

                        <button
                          onClick={() => handleDeleteClass(cg.id, cg.name)}
                          title={`Delete ${cg.name}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section List */}
                  <div className="p-5 space-y-2.5 flex-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Sections &amp; Class Teachers</span>
                      <span>Enrolled</span>
                    </div>

                    {cg.sections.length === 0 ? (
                      <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl">
                        <p className="text-xs text-slate-400">No sections yet.</p>
                        <button
                          onClick={() => openAddSectionForClass(cg.id)}
                          className="text-xs text-[#0B72E7] font-bold mt-1 hover:underline cursor-pointer"
                        >
                          + Add Section A
                        </button>
                      </div>
                    ) : (
                      cg.sections.map((sec) => (
                        <div
                          key={sec.id}
                          className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3 transition-colors"
                        >
                          <div className="min-w-0 flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-900 font-black text-xs flex items-center justify-center shrink-0">
                              {sec.name}
                            </span>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 block leading-tight">
                                Section {sec.name}
                              </span>
                              <button
                                onClick={() => openTeacherModal(sec, cg.name)}
                                className="text-[11px] text-slate-500 hover:text-[#0B72E7] flex items-center gap-1 truncate text-left mt-0.5 cursor-pointer font-medium"
                                title="Click to assign or change class teacher"
                              >
                                <User className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  {sec.classTeacherName || (
                                    <span className="text-amber-600 font-semibold italic">Assign Teacher</span>
                                  )}
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700">
                              {sec.studentCount}
                            </span>
                            <button
                              onClick={() => handleDeleteSection(sec.id, sec.name, cg.name)}
                              title={`Delete Section ${sec.name}`}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Card Footer Quick Link */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs font-semibold">
                    <button
                      onClick={() => openAddSectionForClass(cg.id)}
                      className="text-[#0B72E7] hover:text-[#095ec2] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Section</span>
                    </button>
                    <Link
                      href="/admin/students"
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                    >
                      <span>View Students</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DAILY SCHEDULE & SUBSTITUTION VIEW                  */}
      {/* ========================================================= */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Day & Section Selector Bar */}
          <AdminCard className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Day of Week Navigation Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                      selectedDay === day
                        ? 'bg-[#0B72E7] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Section Picker */}
              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Section:</span>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
                >
                  {initialFlatSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.classGradeName} - Section {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </AdminCard>

          {/* Timetable Period Slots for Selected Day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0B72E7]" />
                {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule Grid
              </h2>
              <span className="text-xs font-semibold text-slate-400">{currentSlots.length} Scheduled Periods</span>
            </div>

            {currentSlots.length === 0 ? (
              <AdminCard className="p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">No timetable slots configured for {selectedDay}</p>
                <p className="text-xs text-slate-400 mt-1">Configure schedule in the Master Builder.</p>
              </AdminCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSlots.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <div
                        key={slot.id}
                        className="bg-slate-50/80 border border-dashed border-slate-200 rounded-[20px] p-5 flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Break Interval
                          </span>
                          <h4 className="text-sm font-bold text-slate-600">{slot.periodName}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <AdminCard
                      key={slot.id}
                      className={`p-5 flex flex-col justify-between transition-all ${
                        slot.activeSubstitution
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)]'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {slot.periodName}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {slot.subjectName || 'Self Study / Activity'}
                          </div>
                          {slot.subjectCode && (
                            <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{slot.subjectCode}</span>
                          )}
                        </div>

                        {/* Assigned Teacher */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Faculty</span>
                            <span className="font-bold text-slate-800">
                              {slot.teacherName || 'Not Assigned'}
                            </span>
                          </div>

                          {slot.activeSubstitution ? (
                            <div className="text-right">
                              <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wider block">
                                Covered By
                              </span>
                              <span className="font-bold text-amber-900">
                                {slot.activeSubstitution.substituteTeacherName}
                              </span>
                            </div>
                          ) : (
                            <AdminButton
                              variant="ghost"
                              size="sm"
                              onClick={() => openAssignModal(slot)}
                              icon={<UserCheck className="w-3.5 h-3.5 text-[#0B72E7]" />}
                              className="text-[11px] text-[#0B72E7] hover:bg-blue-50"
                            >
                              Substitute
                            </AdminButton>
                          )}
                        </div>
                      </div>
                    </AdminCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Substitutions Ticker & List */}
          {recentSubstitutions.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200/80">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Active &amp; Recent Teacher Substitutions
              </h2>

              <div className="space-y-2">
                {recentSubstitutions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span>{sub.classSection}</span>
                        <span>•</span>
                        <span>{sub.periodName} ({sub.timeRange})</span>
                        <span>•</span>
                        <span className="text-slate-600">{sub.subjectName}</span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        Regular: <strong>{sub.originalTeacherName}</strong> &rarr; Substitute:{' '}
                        <strong className="text-amber-700">{sub.substituteTeacherName}</strong>
                        {sub.reason && ` (${sub.reason})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sub.status === 'ASSIGNED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.status}
                      </span>
                      {sub.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleCancelSubstitution(sub.id)}
                          disabled={cancellingId === sub.id}
                          className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-xs font-semibold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD CLASS / SECTION (UNIFIED)                     */}
      {/* ========================================================= */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={addModalTab === 'class' ? 'Add New Class & Sections' : 'Add Section to Class'}
        description="Expand your school's academic hierarchy with classes, divisions, and faculty leaders."
        maxWidth="lg"
      >
        {/* Modal Tab Switcher */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => setAddModalTab('class')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              addModalTab === 'class'
                ? 'border-[#0B72E7] text-[#0B72E7]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. New Class Grade
          </button>
          <button
            type="button"
            onClick={() => setAddModalTab('section')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              addModalTab === 'section'
                ? 'border-[#0B72E7] text-[#0B72E7]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. New Section
          </button>
        </div>

        {addModalTab === 'class' ? (
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Class / Grade Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Class 10, Grade 11 - Science, Pre-KG"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
              />
              <p className="text-[11px] text-slate-400 mt-1">Official name displayed across rosters, report cards, and admissions.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numeric Order (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10 (auto-detected if blank)"
                  value={newClassOrder}
                  onChange={(e) => setNewClassOrder(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Initial Sections
                </label>
                <input
                  type="text"
                  placeholder="e.g. A, B, C"
                  value={newClassSections}
                  onChange={(e) => setNewClassSections(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Automatic Provisioning:</span>
              <span>
                Separate sections with commas (e.g. <code>A, B, C</code>). The system will create the class and all initial section divisions simultaneously.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                isLoading={isCreatingClass}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Class &amp; Sections
              </AdminButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateSection} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parent Class Grade *
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
              >
                <option value="" disabled>Select parent class</option>
                {classGrades.map((cg) => (
                  <option key={cg.id} value={cg.id}>
                    {cg.name} ({cg.sections.length} existing sections)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. C, D, Blue, Rose"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Class Teacher (Optional)
                </label>
                <select
                  value={newSectionTeacherId}
                  onChange={(e) => setNewSectionTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
                >
                  <option value="">-- No Class Teacher Assigned --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                isLoading={isCreatingSection}
                icon={<Plus className="w-4 h-4" />}
              >
                Create Section
              </AdminButton>
            </div>
          </form>
        )}
      </AdminModal>

      {/* ========================================================= */}
      {/* MODAL 2: ASSIGN CLASS TEACHER                             */}
      {/* ========================================================= */}
      {editingSection && (
        <AdminModal
          isOpen={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          title={`Assign Class Teacher — ${editingSection.classGradeName} Section ${editingSection.sectionName}`}
          description="Designate a faculty member as the primary pastoral and administrative leader for this section."
          maxWidth="md"
        >
          <form onSubmit={handleAssignTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Class Teacher
              </label>
              <select
                value={selectedTeacherForSection}
                onChange={(e) => setSelectedTeacherForSection(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0B72E7]"
              >
                <option value="">-- Remove / No Class Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                The class teacher gains attendance oversight, student diary approvals, and direct communication channels.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <AdminButton
                type="button"
                variant="secondary"
                onClick={() => setEditingSection(null)}
              >
                Cancel
              </AdminButton>
              <AdminButton
                type="submit"
                variant="primary"
                isLoading={isUpdatingTeacher}
                icon={<UserCheck className="w-4 h-4" />}
              >
                Save Assignment
              </AdminButton>
            </div>
          </form>
        </AdminModal>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ASSIGN SUBSTITUTION MODAL                         */}
      {/* ========================================================= */}
      <AdminModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Teacher Substitution"
        description="Assign a qualified substitute faculty member to cover this scheduled class period."
        maxWidth="md"
      >
        {targetSlot && (
          <form onSubmit={handleAssignSubstitution} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Period Slot:</span>
                <span className="font-bold text-slate-900">
                  {targetSlot.periodName} ({targetSlot.startTime} - {targetSlot.endTime})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Class Section:</span>
                <span className="font-bold text-slate-900">
                  {targetSlot.classGradeName} - {targetSlot.sectionName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-bold text-slate-900">{targetSlot.subjectName || 'General Instruction'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Regular Faculty:</span>
                <span className="font-bold text-slate-900">{targetSlot.teacherName || 'None'}</span>
              </div>
            </div>

            {assignError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {assignError}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">Coverage Date</label>
              <input
                type="date"
                value={subDate}
                onChange={(e) => setSubDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">Select Substitute Teacher</label>
              <select
                value={subTeacherId}
                onChange={(e) => setSubTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
                required
              >
                {teachers
                  .filter((t) => t.id !== targetSlot.teacherId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block text-xs mb-1">Reason for Substitution</label>
              <input
                type="text"
                placeholder="e.g. Medical leave, Emergency duty"
                value={subReason}
                onChange={(e) => setSubReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              disabled={isSubmittingSub}
              isLoading={isSubmittingSub}
              icon={<UserCheck className="w-4 h-4" />}
              className="w-full py-3"
            >
              Assign Substitution Now
            </AdminButton>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
