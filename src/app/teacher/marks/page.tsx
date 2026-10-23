'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  Save,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';
import { saveExamMarksAction, getExamMarksAction } from '@/actions/teacher-portal';

export default function ExamMarksPage() {
  const [examType, setExamType] = useState('Mid-Term Examination 2026');
  const [selectedSection, setSelectedSection] = useState('8-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initialMarks = [
    { id: '1', roll: '01', name: 'Aarav Sharma', max: 100, obtained: '92', remarks: 'Exceptional problem solving' },
    { id: '2', roll: '02', name: 'Ananya Verma', max: 100, obtained: '96', remarks: 'Highest in algebraic concepts' },
    { id: '3', roll: '03', name: 'Dev Patel', max: 100, obtained: '84', remarks: 'Consistent good performance' },
    { id: '4', roll: '04', name: 'Ishaan Gupta', max: 100, obtained: '71', remarks: 'Needs more practice in geometry' },
    { id: '5', roll: '05', name: 'Kavya Singh', max: 100, obtained: '99', remarks: 'Outstanding work' },
    { id: '6', roll: '06', name: 'Manav Joshi', max: 100, obtained: '78', remarks: 'Good attempt' },
    { id: '7', roll: '07', name: 'Meera Rao', max: 100, obtained: '88', remarks: 'Well articulated answers' },
    { id: '8', roll: '08', name: 'Rohan Sharma', max: 100, obtained: '85', remarks: 'Strong fundamentals' },
  ];

  const [marksData, setMarksData] = useState(initialMarks);

  // Restore saved marks from database if available
  useEffect(() => {
    async function restoreMarks() {
      setIsLoading(true);
      try {
        const res = await getExamMarksAction(examType, selectedSection, selectedSubject);
        if (res.success && res.marks && Array.isArray(res.marks) && res.marks.length > 0) {
          const map = new Map(res.marks.map((m: any) => [m.studentId, m]));
          setMarksData((prev) =>
            prev.map((row) => {
              const saved = map.get(row.id);
              if (saved) {
                return {
                  ...row,
                  obtained: String(saved.marksObtained),
                  remarks: saved.remarks || row.remarks,
                };
              }
              return row;
            })
          );
        }
      } catch {
        // Fallback to initial
      } finally {
        setIsLoading(false);
      }
    }
    restoreMarks();
  }, [examType, selectedSection, selectedSubject]);

  const handleMarkChange = (id: string, value: string) => {
    setMarksData((prev) => prev.map((m) => (m.id === id ? { ...m, obtained: value } : m)));
  };

  const handleRemarkChange = (id: string, value: string) => {
    setMarksData((prev) => prev.map((m) => (m.id === id ? { ...m, remarks: value } : m)));
  };

  const handleSave = async (isDraft = false) => {
    // 1. Validation check
    for (const row of marksData) {
      const num = Number(row.obtained);
      if (isNaN(num) || num < 0 || num > row.max) {
        setFeedback({
          type: 'error',
          text: `Invalid marks for ${row.name} (#${row.roll}). Marks must be between 0 and ${row.max}.`,
        });
        return;
      }
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await saveExamMarksAction({
        examType,
        section: selectedSection,
        subject: selectedSubject,
        isDraft,
        marks: marksData.map((m) => ({
          studentId: m.id,
          studentName: m.name,
          rollNo: m.roll,
          marksObtained: Number(m.obtained),
          maxMarks: m.max,
          remarks: m.remarks,
        })),
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.message || (isDraft ? 'Draft marks saved successfully.' : 'Exam marks submitted and finalized.'),
        });
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to save marks to the database.',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        text: 'A network error occurred while persisting marks.',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Exam Marks Entry"
        description="Enter, validate, and manage assessment marks for your assigned subjects."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Exam Marks' },
        ]}
        action={
          <div className="flex items-center gap-2.5">
            <Link
              href="/teacher/marks/import"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Import Excel</span>
            </Link>
            <button
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#102A56] transition-colors cursor-pointer disabled:opacity-60"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Submit Marks'}</span>
            </button>
          </div>
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
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Selectors Card */}
      <TeacherCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Assessment
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="Mid-Term Examination 2026">Mid-Term Examination 2026</option>
              <option value="Unit Test 2">Unit Test 2</option>
              <option value="Final Board Mock">Final Board Mock</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Class & Section
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="8-A">Grade 8 — Section A</option>
              <option value="9-B">Grade 9 — Section B</option>
              <option value="10-A">Grade 10 — Section A</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="Mathematics">Mathematics (Code: MTH-101)</option>
              <option value="Physics">Physics (Code: PHY-102)</option>
              <option value="Geometry">Geometry (Code: GEO-103)</option>
            </select>
          </div>
        </div>
      </TeacherCard>

      {/* Spreadsheet Entry Table */}
      <TeacherCard>
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
            <p className="text-xs font-medium">Loading saved assessment marks...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3 text-left w-16">Roll</th>
                  <th className="py-3 px-3 text-left">Student Name</th>
                  <th className="py-3 px-3 text-center w-28">Max Marks</th>
                  <th className="py-3 px-3 text-left w-36">Marks Obtained</th>
                  <th className="py-3 px-3 text-left">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {marksData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#102A56]">
                      #{row.roll}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#102A56]">
                      {row.name}
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-[#64748B]">
                      {row.max}
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="number"
                        min="0"
                        max={row.max}
                        value={row.obtained}
                        onChange={(e) => handleMarkChange(row.id, e.target.value)}
                        className="w-24 h-9 px-3 rounded-lg border border-slate-200 bg-white font-mono font-bold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 text-center"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={row.remarks}
                        onChange={(e) => handleRemarkChange(row.id, e.target.value)}
                        placeholder="Add brief observation..."
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/60 text-[#102A56] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TeacherCard>
    </div>
  );
}
