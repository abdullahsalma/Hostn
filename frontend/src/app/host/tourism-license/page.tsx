'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { hostApi } from '@/lib/api';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  Loader2, ChevronDown, ChevronUp, ShieldCheck, Plus,
  Building2, X, AlertTriangle, FileCheck, Trash2, Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Types ─────────────────────────────────────────────────────────────

interface LicenseData {
  licenseNumber: string;
  licenseType?: string;
  issueDate?: string;
  expiryDate?: string;
  status: 'pending' | 'active' | 'expired' | 'rejected';
}

interface LicenseUnit {
  unitId: string;
  nameEn: string;
  nameAr: string;
  thumbnail: string | null;
  license: LicenseData | null;
}

interface LicenseProperty {
  propertyId: string;
  propertyTitle: string;
  propertyTitleAr: string;
  unitCount: number;
  units: LicenseUnit[];
  location?: { city?: string; district?: string };
}

// ── Translations ──────────────────────────────────────────────────────

const t: Record<string, Record<string, string>> = {
  title: { en: 'Ministry of Tourism License', ar: 'رخصة وزارة السياحة' },
  helpTitle: { en: 'Need help?', ar: 'تريد مساعدة؟' },
  helpDesc: { en: 'Learn how to issue your tourism permit from the Ministry of Tourism', ar: 'كيفية إصدار التصريح' },
  addPermit: { en: 'Add Permit', ar: 'اضف تصريح' },
  editPermit: { en: 'Edit', ar: 'تعديل' },
  deletePermit: { en: 'Remove', ar: 'حذف' },
  licenseNumber: { en: 'License Number', ar: 'رقم الرخصة' },
  licenseType: { en: 'License Type', ar: 'نوع الرخصة' },
  issueDate: { en: 'Issue Date', ar: 'تاريخ الإصدار' },
  expiryDate: { en: 'Expiry Date', ar: 'تاريخ الانتهاء' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  units: { en: 'units', ar: 'وحدات' },
  unit: { en: 'unit', ar: 'وحدة' },
  noProperties: { en: 'No properties found', ar: 'لا توجد عقارات' },
  noPropertiesDesc: { en: 'Create a listing to manage tourism licenses', ar: 'أنشئ إعلاناً لإدارة رخص السياحة' },
  active: { en: 'Active', ar: 'فعالة' },
  pending: { en: 'Pending', ar: 'قيد المراجعة' },
  expired: { en: 'Expired', ar: 'منتهية' },
  rejected: { en: 'Rejected', ar: 'مرفوضة' },
  saveSuccess: { en: 'License saved successfully', ar: 'تم حفظ الرخصة بنجاح' },
  deleteSuccess: { en: 'License removed successfully', ar: 'تم إزالة الرخصة بنجاح' },
  deleteConfirm: { en: 'Are you sure you want to remove this license?', ar: 'هل تريد إزالة هذه الرخصة؟' },
  warningTitle: { en: 'Units without permits', ar: 'وحدات بدون تصريح' },
  warningDesc: { en: 'Units without a tourism permit may be hidden from search results', ar: 'الوحدات بدون تصريح سياحي قد تكون مخفية من نتائج البحث' },
  general: { en: 'General', ar: 'عام' },
  seasonal: { en: 'Seasonal', ar: 'موسمي' },
  event: { en: 'Event', ar: 'فعالية' },
  required: { en: 'This field is required', ar: 'هذا الحقل مطلوب' },
  addLicenseTitle: { en: 'Add Tourism License', ar: 'إضافة رخصة سياحة' },
  editLicenseTitle: { en: 'Edit Tourism License', ar: 'تعديل رخصة السياحة' },
  expires: { en: 'Expires', ar: 'ينتهي' },
  licenseNo: { en: 'License #', ar: 'رقم الرخصة' },
};

// ── Status Badge ──────────────────────────────────────────────────────

function StatusBadge({ status, lang }: { status: string; lang: 'en' | 'ar' }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    expired: 'bg-red-50 text-red-700 border-red-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, Record<string, string>> = {
    active: t.active,
    pending: t.pending,
    expired: t.expired,
    rejected: t.rejected,
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
      colors[status] || colors.pending
    )}>
      {status === 'active' && <FileCheck className="w-3 h-3" />}
      {labels[status]?.[lang] || status}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function TourismLicensePage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'ar';
  const isAr = lang === 'ar';
  usePageTitle(isAr ? 'رخصة وزارة السياحة' : 'Tourism License');

  const [properties, setProperties] = useState<LicenseProperty[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<LicenseUnit | null>(null);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    licenseType: 'general',
    issueDate: '',
    expiryDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<LicenseUnit | null>(null);

  // Count unlicensed units
  const unlicensedCount = properties.reduce((sum, p) =>
    sum + p.units.filter((u) => !u.license).length, 0
  );

  // ── Load data ─────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const res = await hostApi.getLicenseOverview();
      setProperties(res.data?.data || []);
    } catch {
      toast.error(isAr ? 'فشل في تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Toggle accordion ──────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Open modal ────────────────────────────────────────────────────

  const openAddModal = (unit: LicenseUnit) => {
    setEditingUnit(unit);
    setFormData({
      licenseNumber: '',
      licenseType: 'general',
      issueDate: '',
      expiryDate: '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (unit: LicenseUnit) => {
    setEditingUnit(unit);
    setFormData({
      licenseNumber: unit.license?.licenseNumber || '',
      licenseType: unit.license?.licenseType || 'general',
      issueDate: unit.license?.issueDate ? new Date(unit.license.issueDate).toISOString().split('T')[0] : '',
      expiryDate: unit.license?.expiryDate ? new Date(unit.license.expiryDate).toISOString().split('T')[0] : '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  // ── Save license ──────────────────────────────────────────────────

  const handleSave = async () => {
    const errors: Record<string, boolean> = {};
    if (!formData.licenseNumber.trim()) errors.licenseNumber = true;
    if (!formData.expiryDate) errors.expiryDate = true;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!editingUnit) return;
    setSubmitting(true);

    try {
      await hostApi.upsertLicense(editingUnit.unitId, {
        licenseNumber: formData.licenseNumber.trim(),
        licenseType: formData.licenseType,
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate,
      });
      toast.success(t.saveSuccess[lang]);
      setShowModal(false);
      await loadData();
    } catch {
      toast.error(isAr ? 'فشل في حفظ الرخصة' : 'Failed to save license');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete license ────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await hostApi.deleteLicense(deleteTarget.unitId);
      toast.success(t.deleteSuccess[lang]);
      setDeleteTarget(null);
      await loadData();
    } catch {
      toast.error(isAr ? 'فشل في حذف الرخصة' : 'Failed to remove license');
    }
  };

  // ── Format date ───────────────────────────────────────────────────

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // ── Render ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t.title[lang]}</h1>

      {/* Help banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">{t.helpTitle[lang]}</p>
          <p className="text-xs text-amber-600 mt-0.5">{t.helpDesc[lang]}</p>
        </div>
      </div>

      {/* Warning banner for unlicensed units */}
      {unlicensedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">{t.warningTitle[lang]}</p>
            <p className="text-xs text-red-600 mt-0.5">{t.warningDesc[lang]}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{t.noProperties[lang]}</p>
          <p className="text-sm text-gray-400 mt-1">{t.noPropertiesDesc[lang]}</p>
        </div>
      ) : (
        /* Property accordion list */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
          {properties.map((prop) => (
            <div key={prop.propertyId}>
              {/* Accordion header */}
              <button
                onClick={() => toggleExpand(prop.propertyId)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-start"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {expandedIds.has(prop.propertyId)
                    ? <ChevronUp className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {isAr && prop.propertyTitleAr ? prop.propertyTitleAr : prop.propertyTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {prop.unitCount} {prop.unitCount === 1 ? t.unit[lang] : t.units[lang]}
                    </p>
                  </div>
                </div>
                {/* Summary: how many licensed */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {prop.units.every((u) => u.license?.status === 'active') ? (
                    <span className="text-xs text-emerald-600 font-medium">✓</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">
                      {prop.units.filter((u) => !u.license).length} {isAr ? 'بدون تصريح' : 'unlicensed'}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded unit list */}
              {expandedIds.has(prop.propertyId) && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {prop.units.map((unit) => (
                    <div
                      key={unit.unitId}
                      className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Thumbnail */}
                      <div className="w-11 h-11 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {unit.thumbnail ? (
                          <img src={unit.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Unit info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {isAr && unit.nameAr ? unit.nameAr : unit.nameEn || unit.nameAr}
                        </p>
                        {unit.license && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {t.licenseNo[lang]}: {unit.license.licenseNumber}
                            {unit.license.expiryDate && (
                              <> · {t.expires[lang]}: {formatDate(unit.license.expiryDate)}</>
                            )}
                          </p>
                        )}
                      </div>

                      {/* License action */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unit.license ? (
                          <>
                            <StatusBadge status={unit.license.status} lang={lang} />
                            <button
                              onClick={() => openEditModal(unit)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              title={t.editPermit[lang]}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(unit)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title={t.deletePermit[lang]}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAddModal(unit)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t.addPermit[lang]}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── License Modal ──────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUnit?.license ? t.editLicenseTitle[lang] : t.addLicenseTitle[lang]}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Unit name */}
            {editingUnit && (
              <p className="text-sm text-gray-500 mb-4 -mt-2">
                {isAr && editingUnit.nameAr ? editingUnit.nameAr : editingUnit.nameEn || editingUnit.nameAr}
              </p>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.licenseNumber[lang]} *</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, licenseNumber: e.target.value });
                    setFormErrors({ ...formErrors, licenseNumber: false });
                  }}
                  className={cn(
                    'w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    formErrors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  )}
                  placeholder={isAr ? 'ادخل رقم الرخصة' : 'Enter license number'}
                />
                {formErrors.licenseNumber && (
                  <p className="text-xs text-red-500 mt-1">{t.required[lang]}</p>
                )}
              </div>

              {/* License Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.licenseType[lang]}</label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="general">{t.general[lang]}</option>
                  <option value="seasonal">{t.seasonal[lang]}</option>
                  <option value="event">{t.event[lang]}</option>
                </select>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.issueDate[lang]}</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.expiryDate[lang]} *</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    setFormData({ ...formData, expiryDate: e.target.value });
                    setFormErrors({ ...formErrors, expiryDate: false });
                  }}
                  className={cn(
                    'w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                    formErrors.expiryDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  )}
                />
                {formErrors.expiryDate && (
                  <p className="text-xs text-red-500 mt-1">{t.required[lang]}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.save[lang]}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-4">{t.deleteConfirm[lang]}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                {t.deletePermit[lang]}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
