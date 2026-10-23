'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Save,
  CheckCircle2,
  User,
  HeartHandshake,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';
import { saveStudentRemarkAction } from '@/actions/teacher-portal';

export default function StudentRemarksPage() {
  const [selectedStudent, setSelectedStudent] = useState('1');
  const [academicRemark, setAcademicRemark] = useState('Demonstrates exceptional grasp of algebraic formulas and active class participation.');
  const [behavioralRemark, setBehavioralRemark] = useState('Polite, respectful, and collaborates effectively in team group projects.');
  const [generalNote, setGeneralNote] = useState('Recommended for regional inter-school mathematics olympiad preparation.');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const studentsList = [
    { id: '1', name: 'Aarav Sharma', roll: '01', classSec: 'Grade 8-A' },
    { id: '2', name: 'Ananya Verma', roll: '02', classSec: 'Grade 8-A' },
    { id: '3', name: 'Dev Patel', roll: '03', classSec: 'Grade 8-A' },
    { id: '4', name: 'Ishaan Gupta', roll: '04', classSec: 'Grade 8-A' },
    { id: '5', name: 'Kavya Singh', roll: '05', classSec: 'Grade 8-A' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await saveStudentRemarkAction({
        studentId: selectedStudent,
        academicRemark: academicRemark.trim(),
        behavioralRemark: behavioralRemark.trim(),
        generalNote: generalNote.trim() || undefined,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Student remarks recorded and visible to parents in portal.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to save remarks.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A network error occurred while saving student remarks.',
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Student Remarks"
        description="Add academic progress and behavioral remarks for your students."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Student Remarks' },
        ]}
        action={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving...' : 'Save Remarks'}</span>
          </button>
        }
      />

      {feedback && (
        <div
          role="alert"
          className={`p-3.5 border rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Student Selector List */}
        <div className="lg:col-span-4">
          <TeacherCard>
            <h3 className="text-sm font-bold text-[#102A56] pb-3 border-b border-[#EEF2F6]">
              Select Student (Grade 8-A)
            </h3>
            <div className="mt-3 space-y-1.5">
              {studentsList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer ${
                    selectedStudent === s.id
                      ? 'bg-blue-50/80 border border-[#2563EB]/40 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        selectedStudent === s.id ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#102A56]'
                      }`}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#102A56]">{s.name}</p>
                      <p className="text-[11px] text-[#64748B]">Roll #{s.roll}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </TeacherCard>
        </div>

        {/* Right: Remarks Form */}
        <div className="lg:col-span-8 space-y-5">
          <TeacherCard>
            <div className="flex items-center gap-3 pb-4 border-b border-[#EEF2F6]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A56]">Academic Performance Observation</h3>
                <p className="text-xs text-[#64748B]">Subject comprehension, homework completion, exam aptitude</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={academicRemark}
              onChange={(e) => setAcademicRemark(e.target.value)}
              className="mt-3 w-full p-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs text-[#102A56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all leading-relaxed"
            />
          </TeacherCard>

          <TeacherCard>
            <div className="flex items-center gap-3 pb-4 border-b border-[#EEF2F6]">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#9333EA] flex items-center justify-center font-bold text-xs">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A56]">Behavioral & Conduct Remark</h3>
                <p className="text-xs text-[#64748B]">Discipline, peer teamwork, punctuality, classroom etiquette</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={behavioralRemark}
              onChange={(e) => setBehavioralRemark(e.target.value)}
              className="mt-3 w-full p-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs text-[#102A56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all leading-relaxed"
            />
          </TeacherCard>

          <TeacherCard>
            <div className="flex items-center gap-3 pb-4 border-b border-[#EEF2F6]">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#102A56]">General Recommendation / Progress Note</h3>
                <p className="text-xs text-[#64748B]">Notes visible during parent-teacher conference & term report card</p>
              </div>
            </div>
            <textarea
              rows={3}
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              className="mt-3 w-full p-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs text-[#102A56] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all leading-relaxed"
            />
          </TeacherCard>
        </div>
      </div>
    </div>
  );
}
