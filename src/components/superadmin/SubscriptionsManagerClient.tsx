'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Plus,
  Check,
  X,
  IndianRupee,
  Building2,
  Users,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Pencil,
} from 'lucide-react';
import {
  createSubscriptionPlanAction,
  updateSubscriptionPlanAction,
} from '@/actions/superadmin';

export interface PlanItem {
  id: string;
  name: string;
  maxStudents: number;
  maxStaff: number;
  features: Record<string, boolean>;
  priceMonthly: number;
  priceAnnual: number;
  isActive: boolean;
  tenantCount: number;
  enrolledStudents?: number;
  totalMonthlyRevenue: number;
}

interface SubscriptionsManagerClientProps {
  plans: PlanItem[];
  totalMrr: number;
  totalArr: number;
}

export default function SubscriptionsManagerClient({
  plans,
  totalMrr,
  totalArr,
}: SubscriptionsManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [maxStudents, setMaxStudents] = useState(2000);
  const [maxStaff, setMaxStaff] = useState(150);
  const [priceMonthly, setPriceMonthly] = useState(11);
  const [priceAnnual, setPriceAnnual] = useState(120);
  const [features, setFeatures] = useState<Record<string, boolean>>({
    admission: true,
    attendance: true,
    fees: true,
    exams: true,
    reports: true,
    portals: true,
    notifications: true,
    timetable: true,
    analytics: true,
    pwa: true,
    customDomain: false,
    whiteLabel: false,
    prioritySupport: false,
  });

  const handleOpenCreateModal = () => {
    setEditingPlan(null);
    setFormError(null);
    applyPreset('prime');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: PlanItem) => {
    setEditingPlan(plan);
    setFormError(null);
    setName(plan.name);
    setMaxStudents(plan.maxStudents);
    setMaxStaff(plan.maxStaff);
    setPriceMonthly(plan.priceMonthly);
    setPriceAnnual(plan.priceAnnual);
    setFeatures(plan.features || {});
    setIsModalOpen(true);
  };

  const applyPreset = (tier: 'lite' | 'prime' | 'whitelabel') => {
    if (tier === 'lite') {
      setName('Alpha Edu Hub Lite');
      setMaxStudents(2000);
      setMaxStaff(100);
      setPriceMonthly(8);
      setPriceAnnual(88);
      setFeatures({
        admission: true,
        attendance: true,
        fees: true,
        exams: true,
        reports: true,
        portals: false,
        notifications: false,
        timetable: false,
        analytics: false,
        pwa: false,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
      });
    } else if (tier === 'prime') {
      setName('Alpha Edu Hub Prime');
      setMaxStudents(5000);
      setMaxStaff(300);
      setPriceMonthly(11);
      setPriceAnnual(120);
      setFeatures({
        admission: true,
        attendance: true,
        fees: true,
        exams: true,
        reports: true,
        portals: true,
        notifications: true,
        timetable: true,
        analytics: true,
        pwa: true,
        customDomain: false,
        whiteLabel: false,
        prioritySupport: false,
      });
    } else if (tier === 'whitelabel') {
      setName('White Label');
      setMaxStudents(10000);
      setMaxStaff(1000);
      setPriceMonthly(25);
      setPriceAnnual(270);
      setFeatures({
        admission: true,
        attendance: true,
        fees: true,
        exams: true,
        reports: true,
        portals: true,
        notifications: true,
        timetable: true,
        analytics: true,
        pwa: true,
        customDomain: true,
        whiteLabel: true,
        prioritySupport: true,
      });
    }
  };

  const handleFeatureToggle = (featureKey: string) => {
    setFeatures((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const handleSubmitPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      let res;
      if (editingPlan) {
        res = await updateSubscriptionPlanAction({
          id: editingPlan.id,
          name,
          maxStudents: Number(maxStudents),
          maxStaff: Number(maxStaff),
          priceMonthly: Number(priceMonthly),
          priceAnnual: Number(priceAnnual),
          features,
          isActive: editingPlan.isActive,
        });
      } else {
        res = await createSubscriptionPlanAction({
          name,
          maxStudents: Number(maxStudents),
          maxStaff: Number(maxStaff),
          priceMonthly: Number(priceMonthly),
          priceAnnual: Number(priceAnnual),
          features,
        });
      }

      if (res.success) {
        setIsModalOpen(false);
        setEditingPlan(null);
        setName('');
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to save plan.');
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Subscription Plans & Pricing
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Per-Student Model
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Change per-student pricing anytime for Lite, Prime, and White Label tiers. Manage entitlements and track live platform MRR/ARR.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-purple-600/20 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Subscription Plan</span>
        </button>
      </div>

      {/* Revenue & Tier Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Platform MRR
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalMrr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">Active student-based monthly SaaS run-rate</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Platform ARR
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{totalArr.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-2">Annualized contractual platform run-rate</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Active SaaS Tiers
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{plans.length}</div>
          <p className="text-xs text-slate-400 mt-2">Tiered plans active in market</p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{plan.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {plan.tenantCount} {plan.tenantCount === 1 ? 'school' : 'schools'} enrolled
                    {plan.enrolledStudents !== undefined && (
                      <span className="text-purple-600 ml-1.5 font-semibold">
                        • {plan.enrolledStudents.toLocaleString('en-IN')} active students
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    Active
                  </span>
                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    title="Change Price or Settings"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors border border-transparent hover:border-purple-200 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price Tag */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/20 border border-slate-100 space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{plan.priceMonthly.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                      / student / mo
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(plan)}
                    className="text-[11px] font-bold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Change Price</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-500 font-medium pt-0.5">
                  Annual rate: <span className="font-semibold text-slate-700">₹{plan.priceAnnual.toLocaleString('en-IN')}/student/yr</span>
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100">
                  <div className="text-[10px] text-purple-600 font-bold uppercase">
                    Max Student Limit
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {plan.maxStudents.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="text-[10px] text-blue-600 font-bold uppercase">Max Faculty Limit</div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {plan.maxStaff.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Included Capabilities
                </div>
                {Object.entries(plan.features).map(([featureName, isEnabled]) => (
                  <div key={featureName} className="flex items-center gap-2">
                    {isEnabled ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`capitalize ${
                        isEnabled ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'
                      }`}
                    >
                      {featureName.replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Footer: Monthly Revenue & Edit Action */}
            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 font-medium block text-[10px] uppercase">Monthly SaaS Cashflow</span>
                <span className="font-extrabold text-purple-700 font-mono text-sm">
                  ₹{plan.totalMonthlyRevenue.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => handleOpenEditModal(plan)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100/70 text-slate-700 hover:text-purple-700 font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Plan</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 sm:py-8">
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => !isPending && setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] my-auto overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Pinned Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    {editingPlan ? 'Edit Plan & Pricing' : 'Create Subscription Plan'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingPlan
                      ? `Modify per-student pricing, limits, and features for ${editingPlan.name}.`
                      : 'Configure per-student pricing matching your landing page tiers.'}
                  </p>
                </div>
              </div>

              {!isPending && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitPlan} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">Quick Presets</label>
                    <span className="text-[10px] text-slate-400">Click to apply base defaults</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => applyPreset('lite')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        priceMonthly === 8
                          ? 'border-purple-600 bg-purple-50 text-purple-800 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px]">Lite</div>
                      <div className="text-xs font-bold text-purple-700">₹8 / student</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('prime')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        priceMonthly === 11
                          ? 'border-purple-600 bg-purple-50 text-purple-800 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px]">Prime</div>
                      <div className="text-xs font-bold text-purple-700">₹11 / student</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('whitelabel')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        priceMonthly === 25
                          ? 'border-purple-600 bg-purple-50 text-purple-800 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-[11px]">White Label</div>
                      <div className="text-xs font-bold text-purple-700">₹25 / student</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alpha Edu Hub Prime"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Monthly Price per Student (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.5"
                      value={priceMonthly}
                      onChange={(e) => setPriceMonthly(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Annual Price per Student (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step="1"
                      value={priceAnnual}
                      onChange={(e) => setPriceAnnual(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Live Estimator Callout */}
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-purple-900 font-medium">Estimated monthly billing for 500 students:</span>
                  <span className="font-extrabold text-purple-800 font-mono">
                    ₹{(500 * Number(priceMonthly)).toLocaleString('en-IN')}/mo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Max Students Limit *</label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={maxStudents}
                      onChange={(e) => setMaxStudents(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Max Staff Limit *</label>
                    <input
                      type="number"
                      required
                      min={2}
                      value={maxStaff}
                      onChange={(e) => setMaxStaff(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700">Included Features</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(features).map((featKey) => (
                      <label
                        key={featKey}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={features[featKey]}
                          onChange={() => handleFeatureToggle(featKey)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="capitalize font-medium text-slate-700 text-xs">
                          {featKey.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pinned Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{editingPlan ? 'Updating Plan...' : 'Creating Plan...'}</span>
                    </>
                  ) : (
                    <span>{editingPlan ? 'Update Plan' : 'Save Plan'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
