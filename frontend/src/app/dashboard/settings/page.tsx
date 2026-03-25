'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Lock, Bell, Globe, Mail, Phone, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'profile', iconEn: User, labelEn: 'Profile', labelAr: 'الملف الشخصي' },
  { key: 'security', iconEn: Lock, labelEn: 'Security', labelAr: 'الأمان' },
  { key: 'notifications', iconEn: Bell, labelEn: 'Notifications', labelAr: 'الإشعارات' },
  { key: 'language', iconEn: Globe, labelEn: 'Language', labelAr: 'اللغة' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        toast.success(isAr ? 'تم حفظ الملف الشخصي' : 'Profile saved successfully');
      } else {
        toast.error(isAr ? 'فشل الحفظ' : 'Failed to save');
      }
    } catch {
      toast.error(isAr ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        toast.success(isAr ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || (isAr ? 'فشل تغيير كلمة المرور' : 'Failed to change password'));
      }
    } catch {
      toast.error(isAr ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{isAr ? 'الإعدادات' : 'Settings'}</h1>
        <p className="text-sm text-gray-500 mb-8">{isAr ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}</p>

        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="sm:w-56 flex-shrink-0">
            <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.iconEn;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isAr ? tab.labelAr : tab.labelEn}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">{isAr ? 'معلومات الملف الشخصي' : 'Profile Information'}</h2>
                <Input
                  label={isAr ? 'الاسم الكامل' : 'Full Name'}
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label={isAr ? 'البريد الإلكتروني' : 'Email'}
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  leftIcon={<Mail className="w-4 h-4" />}
                />
                <Input
                  label={isAr ? 'رقم الجوال' : 'Phone Number'}
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  leftIcon={<Phone className="w-4 h-4" />}
                />
                <Button onClick={handleProfileSave} isLoading={saving}>
                  {isAr ? 'حفظ التغييرات' : 'Save Changes'}
                </Button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</h2>
                <Input
                  label={isAr ? 'كلمة المرور الحالية' : 'Current Password'}
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <Input
                  label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
                  leftIcon={<Shield className="w-4 h-4" />}
                />
                <Input
                  label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  leftIcon={<Shield className="w-4 h-4" />}
                />
                <Button onClick={handlePasswordChange} isLoading={saving}>
                  {isAr ? 'تحديث كلمة المرور' : 'Update Password'}
                </Button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">{isAr ? 'تفضيلات الإشعارات' : 'Notification Preferences'}</h2>
                <p className="text-sm text-gray-500">{isAr ? 'تحكم في الإشعارات التي تتلقاها' : 'Control what notifications you receive'}</p>
                {[
                  { labelEn: 'Booking confirmations', labelAr: 'تأكيدات الحجز', defaultOn: true },
                  { labelEn: 'Promotional emails', labelAr: 'رسائل ترويجية', defaultOn: false },
                  { labelEn: 'Price alerts', labelAr: 'تنبيهات الأسعار', defaultOn: true },
                ].map((item, i) => (
                  <label key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700">{isAr ? item.labelAr : item.labelEn}</span>
                    <input type="checkbox" defaultChecked={item.defaultOn} className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" />
                  </label>
                ))}
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">{isAr ? 'إعدادات اللغة' : 'Language Settings'}</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => { if (language !== 'ar') toggleLanguage(); }}
                    className={`flex-1 py-4 rounded-xl border-2 text-center font-semibold transition-all ${
                      language === 'ar' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => { if (language !== 'en') toggleLanguage(); }}
                    className={`flex-1 py-4 rounded-xl border-2 text-center font-semibold transition-all ${
                      language === 'en' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
