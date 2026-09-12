import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  History,
  TrendingUp,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Layers,
  ArrowRight,
  RotateCw,
  X,
  Loader2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  couponService,
  type CouponItem,
  type CouponUsageItem,
  type CreateCouponPayload,
  type UpdateCouponPayload,
} from '@/services/couponService';
import { courseService } from '@/services/courseService';

export const AdminCoupons: React.FC = () => {
  const { user } = useAuth();

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [savingCoupon, setSavingCoupon] = useState<boolean>(false);

  // Usage Audit Drawer State
  const [usageDrawerCoupon, setUsageDrawerCoupon] = useState<CouponItem | null>(null);
  const [usages, setUsages] = useState<CouponUsageItem[]>([]);
  const [loadingUsages, setLoadingUsages] = useState<boolean>(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState<{
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number | string;
    maxDiscountAmount: number | string;
    minPurchaseAmount: number | string;
    applicableCourses: string[];
    isAllCourses: boolean;
    startDate: string;
    endDate: string;
    totalUsageLimit: number | string;
    perUserLimit: number | string;
    isActive: boolean;
  }>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscountAmount: '',
    minPurchaseAmount: '',
    applicableCourses: [],
    isAllCourses: true,
    startDate: '',
    endDate: '',
    totalUsageLimit: '',
    perUserLimit: '1',
    isActive: true,
  });

  // Load Coupons and Courses
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await couponService.listCoupons({ includeArchived: false }, token);
      if (res.success) {
        setCoupons(res.data);
      } else {
        toast.error(res.error || 'Failed to fetch coupons');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res: any = await courseService.getCourses();
      if (res && res.courses) {
        setCourses(res.courses.map((c: any) => ({ id: c.id, title: c.title })));
      }
    } catch (e) {
      console.warn('Could not load course list for coupon dropdown:', e);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCoursesList();
  }, [user]);

  // Copy Code Handler
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied "${code}" to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Toggle Status Handler
  const handleToggleStatus = async (coupon: CouponItem) => {
    const newStatus = !coupon.isActive;
    // Optimistic UI update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: newStatus, version: c.version + 1 } : c))
    );

    try {
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await couponService.toggleCoupon(coupon.id, newStatus, token);
      if (res.success) {
        toast.success(`Coupon ${coupon.code} is now ${newStatus ? 'Active' : 'Inactive'}`);
      } else {
        // Revert on error
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
        );
        toast.error(res.error || 'Failed to update coupon status');
      }
    } catch (err: any) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c))
      );
      toast.error(err.message || 'Error updating coupon status');
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxDiscountAmount: '',
      minPurchaseAmount: '',
      applicableCourses: [],
      isAllCourses: true,
      startDate: '',
      endDate: '',
      totalUsageLimit: '',
      perUserLimit: '1',
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount ?? '',
      minPurchaseAmount: coupon.minPurchaseAmount ?? '',
      applicableCourses: coupon.applicableCourses || [],
      isAllCourses: !coupon.applicableCourses || coupon.applicableCourses.length === 0,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : '',
      totalUsageLimit: coupon.totalUsageLimit ?? '',
      perUserLimit: coupon.perUserLimit ?? '1',
      isActive: coupon.isActive,
    });
    setIsCreateModalOpen(true);
  };

  // Save Coupon (Create or Update with Concurrency)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error('Please specify a valid discount value greater than 0');
      return;
    }

    setSavingCoupon(true);

    try {
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const payload: CreateCouponPayload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount:
          formData.discountType === 'percentage' && formData.maxDiscountAmount !== ''
            ? Number(formData.maxDiscountAmount)
            : null,
        minPurchaseAmount: formData.minPurchaseAmount !== '' ? Number(formData.minPurchaseAmount) : null,
        applicableCourses: formData.isAllCourses ? null : formData.applicableCourses,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        totalUsageLimit: formData.totalUsageLimit !== '' ? Number(formData.totalUsageLimit) : null,
        perUserLimit: formData.perUserLimit !== '' ? Number(formData.perUserLimit) : null,
        isActive: formData.isActive,
      };

      if (editingCoupon) {
        // Update existing with optimistic concurrency
        const updatePayload: UpdateCouponPayload = {
          ...payload,
          expectedRevision: editingCoupon.version,
        };
        const res = await couponService.updateCoupon(editingCoupon.id, updatePayload, token);
        if (res.conflict) {
          toast.error('Conflict: This coupon was modified in another window. Refreshing data...');
          await fetchCoupons();
          setIsCreateModalOpen(false);
          return;
        }
        if (res.success) {
          toast.success(`Coupon ${formData.code.toUpperCase()} updated successfully!`);
          setIsCreateModalOpen(false);
          await fetchCoupons();
        } else {
          toast.error(res.error || res.message || 'Failed to update coupon');
        }
      } else {
        // Create new
        const res = await couponService.createCoupon(payload, token);
        if (res.success) {
          toast.success(`Coupon ${formData.code.toUpperCase()} created successfully!`);
          setIsCreateModalOpen(false);
          await fetchCoupons();
        } else {
          toast.error(res.error || res.message || 'Failed to create coupon');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  // Archive Coupon Handler
  const handleArchiveCoupon = async (coupon: CouponItem) => {
    if (!window.confirm(`Are you sure you want to archive coupon "${coupon.code}"?`)) {
      return;
    }

    try {
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await couponService.archiveCoupon(coupon.id, token);
      if (res.success) {
        toast.success(`Coupon "${coupon.code}" archived.`);
        setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      } else {
        toast.error(res.error || 'Failed to archive coupon');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error archiving coupon');
    }
  };

  // Open Usage Drawer
  const handleOpenUsageDrawer = async (coupon: CouponItem) => {
    setUsageDrawerCoupon(coupon);
    setLoadingUsages(true);
    try {
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const res = await couponService.getCouponUsages(coupon.id, 50, token);
      if (res.success) {
        setUsages(res.data);
      } else {
        setUsages([]);
        toast.error(res.error || 'Failed to load usage history');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error loading usages');
    } finally {
      setLoadingUsages(false);
    }
  };

  // Filtered Coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));

      // Status
      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = c.isActive;
      if (statusFilter === 'inactive') matchesStatus = !c.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchQuery, statusFilter]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive).length;
    const totalRedeemed = coupons.reduce((sum, c) => sum + (c.totalUsed || 0), 0);
    return { total, active, totalRedeemed };
  }, [coupons]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Coupons & Discounts
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Create and manage promotional discount vouchers, redemption limits, and course offers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCoupons}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Coupons</span>
            <h3 className="text-2xl font-heading font-black text-white mt-1">{stats.total}</h3>
            <span className="text-[11px] text-slate-500">Created vouchers</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Active Codes</span>
            <h3 className="text-2xl font-heading font-black text-emerald-400 mt-1">{stats.active}</h3>
            <span className="text-[11px] text-slate-500">Available for checkout</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Total Redemptions</span>
            <h3 className="text-2xl font-heading font-black text-cyan-400 mt-1">{stats.totalRedeemed}</h3>
            <span className="text-[11px] text-slate-500">Student purchases</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0">Filter:</span>
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">Loading coupon promotions...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
              <Tag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No coupons found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'No coupon codes match your active filters. Try clearing your search.'
                : 'Create your first discount coupon code to incentivize student enrollments.'}
            </p>
            {(!searchQuery && statusFilter === 'all') && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Course Scope</th>
                  <th className="py-3.5 px-4">Redemptions</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Active</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {filteredCoupons.map((coupon) => {
                  const isPercentage = coupon.discountType === 'percentage';
                  const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
                  const isScheduled = coupon.startDate && new Date(coupon.startDate) > new Date();

                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Code */}
                      <td className="py-4 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs tracking-wider">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-[11px] text-slate-400 font-sans truncate max-w-xs mt-1">
                            {coupon.description}
                          </p>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-white text-sm">
                          {isPercentage ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                        </div>
                        <div className="text-[11px] text-slate-400 space-y-0.5">
                          {isPercentage && coupon.maxDiscountAmount && (
                            <span>Cap: ₹{coupon.maxDiscountAmount}</span>
                          )}
                          {coupon.minPurchaseAmount && (
                            <span className="block">Min: ₹{coupon.minPurchaseAmount}</span>
                          )}
                        </div>
                      </td>

                      {/* Course Scope */}
                      <td className="py-4 px-4">
                        {!coupon.applicableCourses || coupon.applicableCourses.length === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
                            <Layers className="w-3 h-3 text-slate-400" /> All Courses
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-semibold text-blue-300">
                            <BookOpen className="w-3 h-3 text-blue-400" />
                            {coupon.applicableCourses.length} Specific Course{coupon.applicableCourses.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </td>

                      {/* Usage Limits & Count */}
                      <td className="py-4 px-4">
                        <div className="font-extrabold text-white">
                          {coupon.totalUsed || 0}
                          <span className="text-slate-500 font-normal">
                            {' / '}
                            {coupon.totalUsageLimit ? coupon.totalUsageLimit : '∞'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Per user: {coupon.perUserLimit || '∞'}
                        </div>
                      </td>

                      {/* Validity Dates */}
                      <td className="py-4 px-4">
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-bold text-rose-400">
                            <XCircle className="w-3 h-3" /> Expired
                          </span>
                        ) : isScheduled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                            <Calendar className="w-3 h-3" /> Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}

                        <div className="text-[10px] text-slate-400 mt-1 font-mono">
                          {coupon.endDate ? `Ends: ${new Date(coupon.endDate).toLocaleDateString()}` : 'No expiry'}
                        </div>
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="py-4 px-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={coupon.isActive}
                            onChange={() => handleToggleStatus(coupon)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenUsageDrawer(coupon)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Redemptions"
                          >
                            <History className="w-4 h-4 text-cyan-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(coupon)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 className="w-4 h-4 text-indigo-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchiveCoupon(coupon)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Archive Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT COUPON MODAL                                                */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base">
                    {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : 'Create New Coupon'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingCoupon
                      ? `Version v${editingCoupon.version} (Protected Concurrency)`
                      : 'Define discount rules and validity conditions'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 overflow-y-auto">
              {/* Coupon Code & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Coupon Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })
                    }
                    placeholder="e.g. SUMMER50"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white uppercase placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. 50% Early Bird discount"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Discount Type <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as 'percentage' | 'fixed',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="percentage">Percentage (%) Discount</option>
                    <option value="fixed">Fixed Amount (₹) Discount</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Discount Value <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={formData.discountType === 'percentage' ? 100 : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === 'percentage' ? 'e.g. 20 (for 20%)' : 'e.g. 500 (for ₹500)'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      {formData.discountType === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Max Discount & Min Purchase */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      placeholder="Optional (e.g. 1000)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Min Purchase Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                    placeholder="Optional (e.g. 499)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Course Scope */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <label className="text-xs font-bold text-slate-300 block">Course Applicability</label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="courseScope"
                      checked={formData.isAllCourses}
                      onChange={() => setFormData({ ...formData, isAllCourses: true, applicableCourses: [] })}
                      className="text-indigo-600"
                    />
                    <span>All Courses</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="courseScope"
                      checked={!formData.isAllCourses}
                      onChange={() => setFormData({ ...formData, isAllCourses: false })}
                      className="text-indigo-600"
                    />
                    <span>Specific Courses Only</span>
                  </label>
                </div>

                {!formData.isAllCourses && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {courses.map((course) => {
                      const isSelected = formData.applicableCourses.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableCourses: [...formData.applicableCourses, course.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableCourses: formData.applicableCourses.filter((id) => id !== course.id),
                                });
                              }
                            }}
                            className="rounded text-indigo-600"
                          />
                          <span className="truncate text-slate-300">{course.title}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-800/80">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valid Until (Expiry)</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalUsageLimit}
                    onChange={(e) => setFormData({ ...formData, totalUsageLimit: e.target.value })}
                    placeholder="Leave empty for Unlimited"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Usage Limit Per Student
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    placeholder="Defaults to 1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-indigo-600 w-4 h-4"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Activate coupon immediately upon saving
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingCoupon ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCoupon ? 'Save Changes' : 'Create Coupon'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REDEMPTION USAGE HISTORY DRAWER                                           */}
      {/* ========================================================================= */}
      {usageDrawerCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col text-slate-100 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-white text-base">
                    Redemptions: {usageDrawerCoupon.code}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {usages.length} recorded usage{usages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUsageDrawerCoupon(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {loadingUsages ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-medium">Fetching usage history...</p>
                </div>
              ) : usages.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-500">
                    <History className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No redemptions yet</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    This coupon code has not been redeemed by any student orders yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {usages.map((u) => (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-indigo-400 font-bold">{u.orderId}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(u.usedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-slate-300 font-medium">
                        Student: <span className="text-white font-bold">{u.userEmail || u.userId}</span>
                      </div>

                      <div className="text-slate-400">
                        Course: <span className="text-slate-200">{u.courseTitle || u.courseId}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-slate-400">
                          Orig: ₹{u.originalPrice} - Disc: ₹{u.discountAmount}
                        </span>
                        <span className="text-emerald-400 font-bold">Paid: ₹{u.finalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
