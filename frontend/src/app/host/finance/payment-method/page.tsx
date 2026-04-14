'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { hostFinanceApi } from '@/lib/api';
import { CreditCard, Clock, Pencil, Trash2, Plus, Loader2, X } from 'lucide-react';
import { usePageTitle } from '@/lib/usePageTitle';
import toast from 'react-hot-toast';

interface BankAccount {
  _id: string;
  bankName: string;
  bankNameAr?: string;
  iban: string;
  accountHolder: string;
  isActive: boolean;
  isVerified: boolean;
  transferDuration?: {
    type: 'default' | 'custom';
    hours: number;
  };
}

const t: Record<string, Record<string, string>> = {
  title: { en: 'Payment Method', ar: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0633\u062a\u0644\u0627\u0645\u0643 \u0644\u0644\u0645\u0628\u0627\u0644\u063a' },
  paymentReception: { en: 'Payment Reception Method', ar: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u0645\u0628\u0627\u0644\u063a' },
  receptionMethod: { en: 'Reception Method', ar: '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645' },
  bankTransfer: { en: 'Bank Transfer', ar: '\u062a\u062d\u0648\u064a\u0644 \u0628\u0646\u0643\u064a' },
  bankName: { en: 'Bank Name', ar: '\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643' },
  bankNameAr: { en: 'Bank Name (Arabic)', ar: '\u0627\u0633\u0645 \u0627\u0644\u0628\u0646\u0643 (\u0639\u0631\u0628\u064a)' },
  iban: { en: 'IBAN', ar: '\u0631\u0642\u0645 \u0627\u0644\u0627\u064a\u0628\u0627\u0646' },
  accountHolder: { en: 'Account Holder', ar: '\u0627\u0633\u0645 \u0635\u0627\u062d\u0628 \u0627\u0644\u062d\u0633\u0627\u0628' },
  edit: { en: 'Edit', ar: '\u062a\u0639\u062f\u064a\u0644' },
  delete: { en: 'Delete', ar: '\u062d\u0630\u0641' },
  save: { en: 'Save', ar: '\u062d\u0641\u0638' },
  cancel: { en: 'Cancel', ar: '\u0625\u0644\u063a\u0627\u0621' },
  addBank: { en: 'Add Bank Account', ar: '\u0625\u0636\u0627\u0641\u0629 \u062d\u0633\u0627\u0628 \u0628\u0646\u0643\u064a' },
  noBankAccount: { en: 'No bank account added', ar: '\u0644\u0645 \u064a\u062a\u0645 \u0625\u0636\u0627\u0641\u0629 \u062d\u0633\u0627\u0628 \u0628\u0646\u0643\u064a' },
  noBankDesc: { en: 'Add your bank account to receive payouts', ar: '\u0623\u0636\u0641 \u062d\u0633\u0627\u0628\u0643 \u0627\u0644\u0628\u0646\u0643\u064a \u0644\u0627\u0633\u062a\u0644\u0627\u0645 \u0627\u0644\u062d\u0648\u0627\u0644\u0627\u062a' },
  transferDuration: { en: 'Transfer Duration', ar: '\u0645\u062f\u0629 \u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0645\u0628\u0627\u0644\u063a' },
  durationType: { en: 'Duration Type', ar: '\u0646\u0648\u0639 \u0627\u0644\u0645\u062f\u0629' },
  durationDefault: { en: 'Default', ar: '\u0627\u0641\u062a\u0631\u0627\u0636\u064a' },
  durationCustom: { en: 'Custom', ar: '\u0645\u062e\u0635\u0635' },
  hours: { en: 'hours', ar: '\u0633\u0627\u0639\u0629' },
  duration: { en: 'Duration', ar: '\u0627\u0644\u0645\u062f\u0629' },
  ibanError: { en: 'IBAN must start with SA followed by 22 digits', ar: '\u0631\u0642\u0645 \u0627\u0644\u0627\u064a\u0628\u0627\u0646 \u064a\u062c\u0628 \u0623\u0646 \u064a\u0628\u062f\u0623 \u0628\u0640 SA \u0645\u062a\u0628\u0648\u0639\u064b\u0627 \u0628\u0640 22 \u0631\u0642\u0645' },
  required: { en: 'This field is required', ar: '\u0647\u0630\u0627 \u0627\u0644\u062d\u0642\u0644 \u0645\u0637\u0644\u0648\u0628' },
  savedSuccess: { en: 'Saved successfully', ar: '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u0628\u0646\u062c\u0627\u062d' },
  deletedSuccess: { en: 'Bank account deleted', ar: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064a' },
  deleteConfirm: { en: 'Are you sure you want to delete this bank account?', ar: '\u0647\u0644 \u0623\u0646\u062a \u0645\u062a\u0623\u0643\u062f \u0645\u0646 \u062d\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064a\u061f' },
  durationSaved: { en: 'Transfer duration updated', ar: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0645\u062f\u0629 \u0627\u0644\u062a\u062d\u0648\u064a\u0644' },
};

function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return `${iban.slice(0, 4)}${'*'.repeat(iban.length - 8)}${iban.slice(-4)}`;
}

export default function PaymentMethodPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'ar';
  const isAr = lang === 'ar';
  usePageTitle(isAr ? '\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u0627\u0633\u062a\u0644\u0627\u0645' : 'Payment Method');

  const [account, setAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Bank editing
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', bankNameAr: '', iban: '', accountHolder: '' });
  const [bankErrors, setBankErrors] = useState<Record<string, string>>({});

  // Transfer duration editing
  const [editingDuration, setEditingDuration] = useState(false);
  const [durationForm, setDurationForm] = useState({ type: 'default' as 'default' | 'custom', hours: 48 });

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      const res = await hostFinanceApi.getBankAccount();
      const acc = res.data?.data || null;
      setAccount(acc);
      if (acc) {
        setBankForm({
          bankName: acc.bankName || '',
          bankNameAr: acc.bankNameAr || '',
          iban: acc.iban || '',
          accountHolder: acc.accountHolder || '',
        });
        setDurationForm({
          type: acc.transferDuration?.type || 'default',
          hours: acc.transferDuration?.hours || 48,
        });
      }
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const validateBank = (): boolean => {
    const errors: Record<string, string> = {};
    if (!bankForm.bankName.trim()) errors.bankName = t.required[lang];
    if (!bankForm.iban.trim()) errors.iban = t.required[lang];
    else if (!/^SA\d{22}$/.test(bankForm.iban.trim())) errors.iban = t.ibanError[lang];
    if (!bankForm.accountHolder.trim()) errors.accountHolder = t.required[lang];
    setBankErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBank = async () => {
    if (!validateBank()) return;
    setSaving(true);
    try {
      const res = await hostFinanceApi.upsertBankAccount({
        bankName: bankForm.bankName.trim(),
        bankNameAr: bankForm.bankNameAr.trim() || undefined,
        iban: bankForm.iban.trim(),
        accountHolder: bankForm.accountHolder.trim(),
      });
      setAccount(res.data?.data || null);
      setEditingBank(false);
      toast.success(t.savedSuccess[lang]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await hostFinanceApi.deleteBankAccount();
      setAccount(null);
      setBankForm({ bankName: '', bankNameAr: '', iban: '', accountHolder: '' });
      setShowDeleteConfirm(false);
      setEditingBank(false);
      toast.success(t.deletedSuccess[lang]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDuration = async () => {
    setSaving(true);
    try {
      const res = await hostFinanceApi.updateTransferDuration({
        type: durationForm.type,
        hours: durationForm.type === 'default' ? 48 : durationForm.hours,
      });
      setAccount(res.data?.data || null);
      setEditingDuration(false);
      toast.success(t.durationSaved[lang]);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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

      <div className="space-y-6">
        {/* Card 1: Bank Account */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">{t.paymentReception[lang]}</h2>
            </div>
            {account && !editingBank && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingBank(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t.edit[lang]}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t.delete[lang]}
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {editingBank || !account ? (
              /* Edit / Add mode */
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.bankName[lang]} *</label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {bankErrors.bankName && <p className="text-xs text-red-500 mt-1">{bankErrors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.bankNameAr[lang]}</label>
                  <input
                    type="text"
                    value={bankForm.bankNameAr}
                    onChange={(e) => setBankForm({ ...bankForm, bankNameAr: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.iban[lang]} *</label>
                  <input
                    type="text"
                    value={bankForm.iban}
                    onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value.toUpperCase() })}
                    placeholder="SA0000000000000000000000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono"
                    dir="ltr"
                    maxLength={24}
                  />
                  {bankErrors.iban && <p className="text-xs text-red-500 mt-1">{bankErrors.iban}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.accountHolder[lang]} *</label>
                  <input
                    type="text"
                    value={bankForm.accountHolder}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  {bankErrors.accountHolder && <p className="text-xs text-red-500 mt-1">{bankErrors.accountHolder}</p>}
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveBank}
                    disabled={saving}
                    className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save[lang]}
                  </button>
                  {account && (
                    <button
                      onClick={() => {
                        setEditingBank(false);
                        setBankErrors({});
                        setBankForm({
                          bankName: account.bankName || '',
                          bankNameAr: account.bankNameAr || '',
                          iban: account.iban || '',
                          accountHolder: account.accountHolder || '',
                        });
                      }}
                      className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t.cancel[lang]}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Display mode */
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">{t.receptionMethod[lang]}</span>
                  <span className="text-sm font-medium text-gray-900">{t.bankTransfer[lang]}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">{t.bankName[lang]}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {isAr && account.bankNameAr ? account.bankNameAr : account.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">{t.iban[lang]}</span>
                  <span className="text-sm font-medium text-gray-900 font-mono" dir="ltr">
                    {maskIban(account.iban)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-50">
                  <span className="text-sm text-gray-500">{t.accountHolder[lang]}</span>
                  <span className="text-sm font-medium text-gray-900">{account.accountHolder}</span>
                </div>
              </div>
            )}

            {/* No account empty state */}
            {!account && !editingBank && (
              <div className="text-center py-8">
                <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">{t.noBankAccount[lang]}</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">{t.noBankDesc[lang]}</p>
                <button
                  onClick={() => setEditingBank(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.addBank[lang]}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Transfer Duration */}
        {account && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">{t.transferDuration[lang]}</h2>
              </div>
              {!editingDuration && (
                <button
                  onClick={() => setEditingDuration(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t.edit[lang]}
                </button>
              )}
            </div>

            <div className="p-5">
              {editingDuration ? (
                <div className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.durationType[lang]}</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="durationType"
                          checked={durationForm.type === 'default'}
                          onChange={() => setDurationForm({ type: 'default', hours: 48 })}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{t.durationDefault[lang]} (48 {t.hours[lang]})</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="durationType"
                          checked={durationForm.type === 'custom'}
                          onChange={() => setDurationForm({ type: 'custom', hours: durationForm.hours })}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{t.durationCustom[lang]}</span>
                      </label>
                    </div>
                  </div>

                  {durationForm.type === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t.duration[lang]} ({t.hours[lang]})</label>
                      <input
                        type="number"
                        min={24}
                        max={336}
                        value={durationForm.hours}
                        onChange={(e) => setDurationForm({ ...durationForm, hours: parseInt(e.target.value) || 48 })}
                        className="w-32 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-400 mt-1">24 — 336 {t.hours[lang]}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSaveDuration}
                      disabled={saving}
                      className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.save[lang]}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDuration(false);
                        setDurationForm({
                          type: account.transferDuration?.type || 'default',
                          hours: account.transferDuration?.hours || 48,
                        });
                      }}
                      className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {t.cancel[lang]}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-500">{t.durationType[lang]}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {account.transferDuration?.type === 'custom' ? t.durationCustom[lang] : t.durationDefault[lang]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-gray-50">
                    <span className="text-sm text-gray-500">{t.duration[lang]}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {account.transferDuration?.hours || 48} {t.hours[lang]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{t.delete[lang]}</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">{t.deleteConfirm[lang]}</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t.cancel[lang]}
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t.delete[lang]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
