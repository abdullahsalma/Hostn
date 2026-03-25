'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail, Lock, User, Phone, Eye, EyeOff, Shield, Star, Award, Briefcase, Home, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { t, language } = useLanguage();

  const defaultRole = searchParams.get('role') || 'guest';

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
      });
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Hostn</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {t('auth.createAccountHeading')}
            </h1>
            <p className="text-gray-500">{t('auth.joinThousands')}</p>
          </div>

          {/* Role selector — premium design */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { key: 'guest', Icon: Briefcase, labelAr: 'أنا ضيف', labelEn: "I'm a Guest", descAr: 'أبحث عن إقامة مميزة', descEn: 'Looking for a stay' },
              { key: 'host', Icon: Home, labelAr: 'أنا مضيف', labelEn: "I'm a Host", descAr: 'أريد تأجير عقاري', descEn: 'List my property' },
            ].map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => update('role', r.key)}
                className={`relative py-4 px-4 rounded-2xl border-2 text-sm font-semibold transition-all duration-300 flex flex-col items-center gap-2 ${
                  form.role === r.key
                    ? 'border-primary-600 bg-gradient-to-b from-primary-50 to-white text-primary-700 shadow-md ring-1 ring-primary-200'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  form.role === r.key ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <r.Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm">{language === 'ar' ? r.labelAr : r.labelEn}</span>
                <span className={`text-[11px] font-normal ${form.role === r.key ? 'text-primary-500' : 'text-gray-400'}`}>{language === 'ar' ? r.descAr : r.descEn}</span>
                {form.role === r.key && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('auth.nameLabel')}
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              error={errors.name}
              placeholder={t('auth.namePlaceholder')}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label={t('auth.emailLabel')}
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              error={errors.email}
              placeholder={t('auth.emailPlaceholder')}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label={t('auth.phoneLabel')}
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder={t('auth.phonePlaceholder')}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label={t('auth.passwordLabel')}
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              error={errors.password}
              placeholder={t('auth.passwordPlaceholder')}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <Input
              label={t('auth.confirmPasswordLabel')}
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <p className="text-xs text-gray-500">{t('auth.agreeTerms')}</p>

            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              {t('auth.signUpButton')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.haveAccount')}{' '}
            <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              {t('auth.signInLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Premium visual panel */}
      <div className="hidden lg:block relative w-[45%] max-w-[600px] flex-shrink-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(26,14,46,0.92) 0%, rgba(59,21,120,0.82) 40%, rgba(109,40,217,0.65) 100%)',
          }}
        />

        {/* Decorative gold line */}
        <div className="absolute top-0 ltr:left-0 rtl:right-0 w-1 h-full bg-gradient-to-b from-gold-400 via-gold-500/50 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16 text-white">
          {/* Top */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="gold-line mb-4" />
            <p className="text-sm font-medium text-white/60 uppercase tracking-widest">
              {t('auth.journeyStarts')}
            </p>
          </div>

          {/* Center: Features */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Shield, title: t('auth.verifiedProperties'), desc: t('auth.verifiedDesc') },
              { icon: Star, title: t('auth.premiumExperiences'), desc: t('auth.premiumDesc') },
              { icon: Award, title: t('auth.dedicatedSupport'), desc: t('auth.dedicatedDesc') },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom: Platform highlights */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            {[
              { value: t('auth.securePayments'), label: '' },
              { value: t('auth.verifiedListings'), label: '' },
              { value: t('auth.saudiFirst'), label: '' },
              { value: t('auth.support247'), label: '' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                <div className="text-sm font-bold text-gold-300">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>}>
      <RegisterContent />
    </Suspense>
  );
}
