'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ChevronRight,
  Layers,
  Copy,
  Check,
  Power,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Key,
  Palette,
  Upload,
} from 'lucide-react';
import {
  provisionSchoolTenantAction,
  toggleTenantStatusAction,
  ProvisionSchoolInput,
} from '@/actions/superadmin';

export interface TenantListItem {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  board: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  subscriptionPlanPrice: number;
  maxStudents: number;
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  domains: {
    id: string;
    domain: string;
    isPrimary: boolean;
    isVerified: boolean;
  }[];
  branding?: {
    primaryColor: string;
    tagline: string | null;
  } | null;
  createdAt: string;
}

export interface PlanOption {
  id: string;
  name: string;
  priceMonthly: number;
  maxStudents: number;
  maxStaff: number;
}

interface TenantsManagerClientProps {
  tenants: TenantListItem[];
  plans: PlanOption[];
}

export default function TenantsManagerClient({
  tenants,
  plans,
}: TenantsManagerClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal & Drawer State (initialized safely to prevent hydration mismatch)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [tenantToSuspend, setTenantToSuspend] = useState<TenantListItem | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<TenantListItem | null>(null);

  // Sync URL searchParams on client mount
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsWizardOpen(true);
    }
    const tenantId = searchParams.get('tenantId');
    if (tenantId) {
      const match = tenants.find((t) => t.id === tenantId);
      if (match) setSelectedTenant(match);
    }
  }, [searchParams, tenants]);

  // Additional UI states
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [country, setCountry] = useState('India');
  const [adminPhone, setAdminPhone] = useState('+91 98765 43210');
  const [logoFileName, setLogoFileName] = useState<string | null>(null);

  // Form State for Provisioning Wizard
  const [formData, setFormData] = useState<ProvisionSchoolInput>({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    board: 'CBSE',
    subscriptionPlanId: plans[1]?.id || plans[0]?.id || '',
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPassword: '',
    customDomain: '',
    tagline: 'Empowering Minds, Shaping Leaders',
    primaryColor: '#7C3AED',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<{
    name: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
  } | null>(null);

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Demo Autofill Helper
  const handleFillDemoData = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const demoName = `Heritage Global Academy ${randomSuffix}`;
    const demoSlug = `heritage-${randomSuffix}`;
    setFormData({
      name: demoName,
      slug: demoSlug,
      email: `principal@heritage${randomSuffix}.edu.in`,
      phone: '+91 98765 43210',
      address: 'Plot 18, Knowledge Park III, Institutional Area',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      board: 'CBSE',
      subscriptionPlanId: plans[1]?.id || plans[0]?.id || '',
      adminFirstName: 'Rajesh',
      adminLastName: 'Sharma',
      adminEmail: `admin@heritage${randomSuffix}.edu.in`,
      adminPassword: `Heritage@${randomSuffix}!`,
      customDomain: '',
      tagline: 'Excellence in Education, Leadership in Life',
      primaryColor: '#7C3AED',
    });
    setAcademicYear('2026-2027');
    setCountry('India');
    setAdminPhone('+91 98765 43210');
    setLogoFileName('heritage-crest-logo.png');
    setFormError(null);
  };

  // Generate Password Helper
  const handleGeneratePassword = () => {
    const rand = Math.floor(100 + Math.random() * 900);
    const generated = `Alpha@${rand}!`;
    setFormData((prev) => ({ ...prev, adminPassword: generated }));
    setShowPassword(true);
  };

  // Step Validators
  const validateStep1 = () => {
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setFormError('School / Institution name must be at least 3 characters.');
      return false;
    }
    if (!formData.slug.trim() || formData.slug.trim().length < 2) {
      setFormError('Subdomain slug must be at least 2 characters.');
      return false;
    }
    if (!formData.subscriptionPlanId) {
      setFormError('Please select a subscription plan tier.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please provide a valid official school email address.');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setFormError('Please provide a valid school phone number.');
      return false;
    }
    if (!formData.city.trim() || !formData.state.trim() || !formData.address.trim() || !formData.pincode.trim()) {
      setFormError('Please fill in all campus location fields (City, State, Address, Pincode).');
      return false;
    }
    setFormError(null);
    return true;
  };

  const validateStep3 = () => {
    if (!formData.adminFirstName.trim() || formData.adminFirstName.trim().length < 2) {
      setFormError('Administrator full name is required.');
      return false;
    }
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setFormError('Please provide a valid administrator email.');
      return false;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 8) {
      setFormError('Admin password must be at least 8 characters long.');
      return false;
    }
    setFormError(null);
    return true;
  };

  // Filtered tenants calculation
  const filteredTenants = useMemo(() => {
    return tenants.filter((tenant) => {
      if (selectedBoard !== 'ALL' && tenant.board !== selectedBoard) return false;
      if (selectedStatus !== 'ALL' && tenant.subscriptionStatus !== selectedStatus)
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tenant.name.toLowerCase().includes(q);
        const matchesSlug = tenant.slug.toLowerCase().includes(q);
        const matchesCity = tenant.city.toLowerCase().includes(q);
        const matchesEmail = tenant.email.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesCity && !matchesEmail) return false;
      }

      return true;
    });
  }, [tenants, selectedBoard, selectedStatus, searchQuery]);

  // Dynamic Name & Subdomain Auto-generator
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    setFormData((prev) => {
      const isInitialOrAutoSlug =
        !prev.slug ||
        prev.slug ===
          prev.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-');

      return {
        ...prev,
        name,
        slug: isInitialOrAutoSlug ? generatedSlug : prev.slug,
        email: !prev.email || prev.email.startsWith('principal@') ? `principal@${generatedSlug || 'school'}.edu.in` : prev.email,
        adminEmail: !prev.adminEmail || prev.adminEmail.startsWith('admin@') ? `admin@${generatedSlug || 'school'}.edu.in` : prev.adminEmail,
      };
    });
  };

  // Status toggle handler
  const handleToggleStatus = (tenant: TenantListItem) => {
    const nextStatus = tenant.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const nextActive = nextStatus === 'ACTIVE';

    startTransition(async () => {
      const res = await toggleTenantStatusAction({
        tenantId: tenant.id,
        status: nextStatus,
        isActive: nextActive,
      });

      if (res.success) {
        if (selectedTenant && selectedTenant.id === tenant.id) {
          setSelectedTenant({
            ...selectedTenant,
            subscriptionStatus: nextStatus,
            isActive: nextActive,
          });
        }
        router.refresh();
      } else {
        alert(res.error || 'Failed to update status');
      }
    });
  };

  // Form submission
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    startTransition(async () => {
      const res = await provisionSchoolTenantAction(formData);
      if (res.success) {
        setProvisionSuccess({
          name: formData.name,
          slug: formData.slug,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
        });
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to provision tenant.');
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              School Tenants & Campuses
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {tenants.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage educational institutions, subscription plans, and custom domain routing.
          </p>
        </div>

        <button
          onClick={() => {
            setProvisionSuccess(null);
            setFormError(null);
            setWizardStep(1);
            setIsWizardOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add School</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution name, slug, city, or admin email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-purple-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Board Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Board:</span>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-600 font-semibold"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE_BOARD">State Board</option>
              <option value="CAMBRIDGE">Cambridge</option>
              <option value="IB">IB</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-purple-600 font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
                <th className="py-3 pl-4">School / Tenant</th>
                <th className="py-3 px-3">Board & Location</th>
                <th className="py-3 px-3">Subscription Plan</th>
                <th className="py-3 px-3">Student Seats</th>
                <th className="py-3 px-3">Domains</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium">No school tenants match your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const primaryDomain =
                    tenant.domains.find((d) => d.isPrimary)?.domain ||
                    tenant.domains[0]?.domain ||
                    `${tenant.slug}.alphaeduhub.in`;

                  const seatPercent = Math.min(
                    100,
                    Math.round((tenant.studentCount / (tenant.maxStudents || 1)) * 100)
                  );

                  return (
                    <tr
                      key={tenant.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                            style={{
                              backgroundColor: tenant.branding?.primaryColor || '#7C3AED',
                            }}
                          >
                            {tenant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                              {tenant.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {tenant.slug}.alphaeduhub.in
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-800">
                          {tenant.board === 'STATE_BOARD' ? 'State Board' : tenant.board}
                        </div>
                        <div className="text-xs text-slate-500">
                          {tenant.city}, {tenant.state}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-800">
                          {tenant.subscriptionPlanName}
                        </span>
                        <div className="text-xs text-slate-500 font-medium">
                          ₹{tenant.subscriptionPlanPrice.toLocaleString('en-IN')}/student/mo
                          {tenant.studentCount > 0 && (
                            <span className="text-purple-600 ml-1 font-semibold">
                              (₹{(tenant.subscriptionPlanPrice * tenant.studentCount).toLocaleString('en-IN')}/mo)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {tenant.studentCount} / {tenant.maxStudents}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            ({seatPercent}%)
                          </span>
                        </div>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              seatPercent >= 95
                                ? 'bg-red-600'
                                : seatPercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-purple-600'
                            }`}
                            style={{ width: `${seatPercent}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 text-slate-700 font-mono text-xs">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{primaryDomain}</span>
                        </div>
                        {tenant.domains.some((d) => !d.isVerified) && (
                          <span className="text-xs text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            DNS Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            tenant.subscriptionStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tenant.subscriptionStatus === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {tenant.subscriptionStatus}
                        </span>
                      </td>

                      <td
                        className="py-3.5 pr-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedTenant(tenant)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-xs cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => {
                              if (tenant.subscriptionStatus === 'ACTIVE') {
                                setTenantToSuspend(tenant);
                              } else {
                                handleToggleStatus(tenant);
                              }
                            }}
                            disabled={isPending}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              tenant.subscriptionStatus === 'ACTIVE'
                                ? 'border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {tenant.subscriptionStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredTenants.length} of {tenants.length} institutions
          </span>
        </div>
      </div>

      {/* Suspend School Confirmation Modal */}
      {tenantToSuspend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Suspend School Access</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to suspend access for <strong>{tenantToSuspend.name}</strong>?
              All enrolled students and associated faculty accounts will temporarily lose access immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTenantToSuspend(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleToggleStatus(tenantToSuspend);
                  setTenantToSuspend(null);
                }}
                disabled={isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Tenant Drawer */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTenant(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-6 bg-[#0B132B] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-sm"
                    style={{
                      backgroundColor: selectedTenant.branding?.primaryColor || '#7C3AED',
                    }}
                  >
                    {selectedTenant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white truncate max-w-[200px]">
                      {selectedTenant.name}
                    </h2>
                    <p className="text-xs text-purple-300 font-mono">
                      id: {selectedTenant.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTenant(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600">
                {/* Status & Plan Quick Badge */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Contract & Billing Tier
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {selectedTenant.subscriptionPlanName}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      ₹{selectedTenant.subscriptionPlanPrice.toLocaleString('en-IN')} / student / month
                    </div>
                    <div className="text-[11px] text-purple-700 font-bold mt-0.5">
                      Monthly SaaS Bill: ₹{(selectedTenant.subscriptionPlanPrice * selectedTenant.studentCount).toLocaleString('en-IN')}/mo ({selectedTenant.studentCount} enrolled students)
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTenant.subscriptionStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {selectedTenant.subscriptionStatus}
                  </span>
                </div>

                {/* Institution Details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    School Coordinates
                  </h3>
                  <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span>
                        {selectedTenant.address}, {selectedTenant.city},{' '}
                        {selectedTenant.state} - {selectedTenant.pincode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{selectedTenant.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedTenant.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Subdomains & Custom Domains */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Hostnames & DNS Mapping
                  </h3>
                  <div className="space-y-2">
                    {selectedTenant.domains.map((dom) => (
                      <div
                        key={dom.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2 font-mono text-slate-800">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dom.domain}</span>
                          {dom.isPrimary && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            dom.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {dom.isVerified ? 'Verified' : 'Pending DNS'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Row-Level Isolation Audit Verification */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Multi-Tenant DB Partitioning</span>
                  </div>
                  <p className="text-[11px] text-purple-700 leading-relaxed">
                    All queries for student profiles, staff attendance, fee structures, and notices are strictly partitioned by tenantId <code className="bg-white/80 px-1 py-0.2 rounded font-mono">{selectedTenant.id}</code>.
                  </p>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
                <button
                  onClick={() => handleToggleStatus(selectedTenant)}
                  disabled={isPending}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                    selectedTenant.subscriptionStatus === 'ACTIVE'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>
                    {selectedTenant.subscriptionStatus === 'ACTIVE'
                      ? 'Suspend Tenant'
                      : 'Activate Tenant'}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedTenant(null)}
                  className="py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacious Redesigned "Create Your School" Wizard Modal (1100-1200px) */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-8">
          <div
            className="fixed inset-0 transition-opacity"
            onClick={() => !isPending && setIsWizardOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-5xl w-full xl:max-w-[1150px] shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            {/* Header: "Create Your School" & "Fill Demo Data" */}
            <div className="px-6 sm:px-10 py-6 border-b border-slate-100 bg-white z-10 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Create Your School
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      Set up your institution in under a minute.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {!provisionSuccess && (
                    <button
                      type="button"
                      onClick={handleFillDemoData}
                      title="Auto-fill realistic demo data for testing"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs hover:shadow"
                    >
                      <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                      <span>Fill Demo Data</span>
                    </button>
                  )}

                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => setIsWizardOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Steps: ● School Info ───── ○ Location & Contact ───── ○ Admin & Theme */}
              {!provisionSuccess && (
                <div className="pt-6">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {/* Step 1 Tab */}
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer group"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                          wizardStep === 1
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-100'
                            : wizardStep > 1
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {wizardStep > 1 ? '✓' : '1'}
                      </span>
                      <span
                        className={`${
                          wizardStep === 1
                            ? 'text-purple-700 font-extrabold'
                            : wizardStep > 1
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        School Info
                      </span>
                    </button>

                    <div
                      className={`flex-1 h-0.5 mx-3 sm:mx-6 transition-colors ${
                        wizardStep > 1 ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />

                    {/* Step 2 Tab */}
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) setWizardStep(2);
                      }}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer group"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                          wizardStep === 2
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-100'
                            : wizardStep > 2
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {wizardStep > 2 ? '✓' : '2'}
                      </span>
                      <span
                        className={`${
                          wizardStep === 2
                            ? 'text-purple-700 font-extrabold'
                            : wizardStep > 2
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        Location & Contact
                      </span>
                    </button>

                    <div
                      className={`flex-1 h-0.5 mx-3 sm:mx-6 transition-colors ${
                        wizardStep > 2 ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />

                    {/* Step 3 Tab */}
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1() && validateStep2()) setWizardStep(3);
                      }}
                      className="flex items-center gap-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer group"
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all ${
                          wizardStep === 3
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-4 ring-purple-100'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        3
                      </span>
                      <span
                        className={`${
                          wizardStep === 3 ? 'text-purple-700 font-extrabold' : 'text-slate-400'
                        }`}
                      >
                        Admin & Theme
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Success View */}
            {provisionSuccess ? (
              <div className="overflow-y-auto px-6 sm:px-10 py-10 space-y-6 flex-1 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1 max-w-lg mx-auto">
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    School Successfully Created!
                  </h3>
                  <p className="text-sm text-slate-500">
                    <strong>{provisionSuccess.name}</strong> is now live with dedicated multi-tenant isolation, default academic sessions, and administrative access.
                  </p>
                </div>

                <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200/80">
                    <span className="text-xs font-bold text-slate-500 uppercase">Subdomain URL</span>
                    <span className="font-mono font-bold text-sm text-purple-700">
                      {provisionSuccess.slug}.alphaeduhub.in
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-200/80">
                    <span className="text-xs font-bold text-slate-500 uppercase">Admin Email</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {provisionSuccess.adminEmail}
                      </span>
                      <button
                        onClick={() => handleCopy(provisionSuccess.adminEmail, 'email')}
                        className="text-slate-400 hover:text-purple-600 cursor-pointer p-1"
                      >
                        {copiedKey === 'email' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Admin Password</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {provisionSuccess.adminPassword}
                      </span>
                      <button
                        onClick={() => handleCopy(provisionSuccess.adminPassword, 'pw')}
                        className="text-slate-400 hover:text-purple-600 cursor-pointer p-1"
                      >
                        {copiedKey === 'pw' ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="max-w-xl mx-auto pt-4">
                  <button
                    onClick={() => {
                      setProvisionSuccess(null);
                      setWizardStep(1);
                      setIsWizardOpen(false);
                    }}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    Done & Return to Directory
                  </button>
                </div>
              </div>
            ) : (
              /* Multi-step Form Body */
              <form onSubmit={handleProvisionSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="overflow-y-auto px-6 sm:px-10 py-7 flex-1 space-y-6 sm:space-y-8">
                  {formError && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-in fade-in duration-200">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span className="font-semibold">{formError}</span>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* STEP 1: SCHOOL INFO                                          */}
                  {/* ============================================================ */}
                  {wizardStep === 1 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* School / Institution Name (Full Width) */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            School / Institution Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Heritage Public School"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-semibold transition-all placeholder:text-slate-400"
                          />
                        </div>

                        {/* Subdomain (Auto-generated with live suffix) */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Subdomain <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[11px] font-semibold text-purple-600">
                              Auto-generated
                            </span>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="text"
                              required
                              placeholder="heritage"
                              value={formData.slug}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                                })
                              }
                              className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-l-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 font-mono text-slate-900 font-bold transition-all"
                            />
                            <span className="h-12 flex items-center bg-slate-100 border border-l-0 border-slate-200 px-3.5 text-slate-600 font-mono rounded-r-xl text-xs sm:text-sm font-semibold whitespace-nowrap">
                              .alphaeduhub.in
                            </span>
                          </div>
                        </div>

                        {/* Institution Type / Board */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Institution Type / Board <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={formData.board}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                board: e.target.value as any,
                              })
                            }
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 font-semibold text-slate-900 transition-all cursor-pointer"
                          >
                            <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                            <option value="ICSE">ICSE / CISCE Board</option>
                            <option value="STATE_BOARD">State Board of Education</option>
                            <option value="CAMBRIDGE">Cambridge Assessment International (IGCSE)</option>
                            <option value="IB">International Baccalaureate (IB)</option>
                          </select>
                        </div>

                        {/* Academic Year */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Academic Session Year
                          </label>
                          <input
                            type="text"
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            placeholder="2026–2027"
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Student Capacity Info */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Expected Enrolment Capacity
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={
                              plans.find((p) => p.id === formData.subscriptionPlanId)?.maxStudents
                                ? `Up to ${plans
                                    .find((p) => p.id === formData.subscriptionPlanId)
                                    ?.maxStudents.toLocaleString('en-IN')} Students Included`
                                : 'Select a Plan below'
                            }
                            className="h-12 w-full px-4 text-sm bg-slate-100/80 border border-slate-200 rounded-xl text-slate-700 font-semibold transition-all cursor-default"
                          />
                        </div>
                      </div>

                      {/* Subscription Plan Cards */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Choose Subscription Plan Tier <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-xs font-semibold text-purple-700">
                            Transparent per-student pricing
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {plans.map((p) => {
                            const isSelected = formData.subscriptionPlanId === p.id;
                            const isPrime = p.name.toLowerCase().includes('prime');
                            return (
                              <div
                                key={p.id}
                                onClick={() => setFormData({ ...formData, subscriptionPlanId: p.id })}
                                className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-purple-600 bg-purple-50/60 shadow-lg shadow-purple-600/10 ring-2 ring-purple-500/20'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-2">
                                    <span className="font-extrabold text-sm text-slate-900">
                                      {p.name}
                                    </span>
                                    {isPrime && (
                                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-1.5 my-2">
                                    <span className="text-2xl font-black text-slate-900">
                                      ₹{p.priceMonthly.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-purple-700 font-bold">
                                      / student / mo
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-medium text-slate-600">
                                  <span>Up to {p.maxStudents.toLocaleString('en-IN')} seats</span>
                                  {isSelected ? (
                                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="w-5 h-5 rounded-full border-2 border-slate-300" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* STEP 2: LOCATION & CONTACT                                   */}
                  {/* ============================================================ */}
                  {wizardStep === 2 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Country (Preselected) */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Country <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="India"
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            State / Province <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Delhi, Maharashtra, Karnataka"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            City / District <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Postal / PIN Code <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="110001"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-mono font-medium transition-all"
                          />
                        </div>

                        {/* Campus Street Address (Full Width) */}
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Campus Street Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Plot 18, Institutional Area, Sector 4"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* School Phone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            School Phone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Official School Email */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Official School Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="principal@school.edu.in"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-mono font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* STEP 3: ADMIN & THEME                                        */}
                  {/* ============================================================ */}
                  {wizardStep === 3 && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Admin First Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Administrator First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ramesh"
                            value={formData.adminFirstName}
                            onChange={(e) =>
                              setFormData({ ...formData, adminFirstName: e.target.value })
                            }
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Admin Last Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Administrator Last Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Sharma"
                            value={formData.adminLastName}
                            onChange={(e) =>
                              setFormData({ ...formData, adminLastName: e.target.value })
                            }
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Administrator Login Email */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Administrator Login Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="admin@heritage.edu.in"
                            value={formData.adminEmail}
                            onChange={(e) =>
                              setFormData({ ...formData, adminEmail: e.target.value })
                            }
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-mono font-semibold transition-all"
                          />
                        </div>

                        {/* Admin Mobile Phone */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Administrator Mobile Phone
                          </label>
                          <input
                            type="text"
                            placeholder="+91 98765 43210"
                            value={adminPhone}
                            onChange={(e) => setAdminPhone(e.target.value)}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Admin Password (with Generator + Toggle) */}
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Admin Initial Password <span className="text-rose-500">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={handleGeneratePassword}
                              className="text-xs font-bold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Generate Strong Password</span>
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              placeholder="Minimum 8 characters (e.g. Alpha@921!)"
                              value={formData.adminPassword}
                              onChange={(e) =>
                                setFormData({ ...formData, adminPassword: e.target.value })
                              }
                              className="h-12 w-full px-4 pr-12 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-mono font-bold transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* School Crest / Logo Upload */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            School Logo / Crest (Optional)
                          </label>
                          <label className="h-12 w-full px-4 flex items-center justify-between bg-slate-50/70 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors text-xs text-slate-600 font-medium">
                            <span className="truncate">
                              {logoFileName ? `📁 ${logoFileName}` : 'Choose school emblem file (.png, .svg, .jpg)'}
                            </span>
                            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-purple-700 font-bold shrink-0 shadow-2xs">
                              Browse
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setLogoFileName(file.name);
                              }}
                            />
                          </label>
                        </div>

                        {/* Tagline / Motto */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Campus Tagline / Motto
                          </label>
                          <input
                            type="text"
                            placeholder="Empowering Minds, Shaping Leaders"
                            value={formData.tagline || ''}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            className="h-12 w-full px-4 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 text-slate-900 font-medium transition-all"
                          />
                        </div>

                        {/* Primary Brand Theme Color */}
                        <div className="md:col-span-2 pt-2 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                            Primary Brand Color & Portal Palette
                          </label>
                          <div className="flex flex-wrap items-center gap-4">
                            {[
                              { hex: '#7C3AED', name: 'Alpha Purple (Default)' },
                              { hex: '#4F46E5', name: 'Royal Indigo' },
                              { hex: '#0D9488', name: 'Teal Academy' },
                              { hex: '#0F172A', name: 'Slate Prestige' },
                              { hex: '#DC2626', name: 'Crimson' },
                            ].map((preset) => (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setFormData({ ...formData, primaryColor: preset.hex })}
                                title={preset.name}
                                style={{ backgroundColor: preset.hex }}
                                className={`w-10 h-10 rounded-xl transition-all cursor-pointer flex items-center justify-center text-white shadow-xs ${
                                  formData.primaryColor === preset.hex
                                    ? 'ring-4 ring-purple-300 scale-110 shadow-md'
                                    : 'hover:scale-105 opacity-90'
                                }`}
                              >
                                {formData.primaryColor === preset.hex && (
                                  <Check className="w-5 h-5 stroke-[3]" />
                                )}
                              </button>
                            ))}

                            <div className="flex items-center gap-2 ml-auto">
                              <span className="text-xs font-semibold text-slate-500">Custom Hex:</span>
                              <input
                                type="text"
                                value={formData.primaryColor || '#7C3AED'}
                                onChange={(e) =>
                                  setFormData({ ...formData, primaryColor: e.target.value })
                                }
                                className="h-10 w-28 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ready Summary Banner */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl text-xs sm:text-sm space-y-1.5">
                        <div className="font-extrabold text-purple-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-700" />
                          <span>Ready to Provision</span>
                        </div>
                        <p className="text-purple-800 leading-relaxed">
                          Your institution <strong>{formData.name || 'Your School'}</strong> will be provisioned at subdomain{' '}
                          <span className="font-mono font-bold text-purple-950">
                            {formData.slug || 'slug'}.alphaeduhub.in
                          </span>{' '}
                          with the <strong>{academicYear}</strong> academic calendar and school administrator credentials.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prominent Bottom Action Bar */}
                <div className="px-6 sm:px-10 py-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
                  {wizardStep > 1 ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setFormError(null);
                        setWizardStep((wizardStep - 1) as any);
                      }}
                      className="h-12 inline-flex items-center gap-2 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setIsWizardOpen(false)}
                      className="h-12 px-6 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}

                  <div>
                    {wizardStep < 3 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (wizardStep === 1 && validateStep1()) {
                            setWizardStep(2);
                          } else if (wizardStep === 2 && validateStep2()) {
                            setWizardStep(3);
                          }
                        }}
                        className="h-12 inline-flex items-center gap-2 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-purple-600/30 transition-all cursor-pointer"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isPending}
                        className="h-12 inline-flex items-center gap-2.5 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating School...</span>
                          </>
                        ) : (
                          <>
                            <span>🚀 Create School</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
