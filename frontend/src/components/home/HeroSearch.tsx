'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, ChevronDown, Star, Shield, Award } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useLanguage } from '@/context/LanguageContext';
import { CITIES } from '@/lib/constants';
import MiniCalendar from '@/components/ui/MiniCalendar';

type SearchStep = 'idle' | 'location' | 'dates' | 'ready';

export default function HeroSearch() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Search state
  const [city, setCity] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [propertyType, setPropertyType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Step flow state
  const [step, setStep] = useState<SearchStep>('idle');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);

  // Refs for click-outside
  const calendarRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const filteredCities = CITIES.filter((c) => {
    const q = citySearch.toLowerCase();
    return !q || c.en.toLowerCase().includes(q) || c.ar.includes(q);
  });

  const PROPERTY_TYPES = [
    { label: t('hero.allTypes'), value: '' },
    { label: t('type.chalets'), value: 'chalet' },
    { label: t('type.apartments'), value: 'apartment' },
    { label: t('type.villas'), value: 'villa' },
    { label: t('type.studios'), value: 'studio' },
    { label: t('type.farms'), value: 'farm' },
    { label: t('type.camps'), value: 'camp' },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (propertyType) params.set('type', propertyType);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    router.push(`/listings?${params.toString()}`);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  // City selection handler — triggers step flow
  const handleCitySelect = useCallback((cityValue: string, cityLabel: string) => {
    setCity(cityValue);
    setCitySearch(cityLabel);
    setShowCityDropdown(false);
    // Auto-advance to dates step
    setStep('dates');
    setShowCalendar(true);
    setSelectingCheckOut(false);
  }, []);

  // Calendar date selection handler
  const handleDateSelect = useCallback((dateStr: string) => {
    if (!selectingCheckOut) {
      // Selecting check-in
      setCheckIn(dateStr);
      setCheckOut('');
      setSelectingCheckOut(true);
    } else {
      // Selecting check-out
      if (dateStr > checkIn) {
        setCheckOut(dateStr);
        setSelectingCheckOut(false);
        setShowCalendar(false);
        setStep('ready');
      } else {
        // Clicked before check-in — reset to new check-in
        setCheckIn(dateStr);
        setCheckOut('');
      }
    }
  }, [selectingCheckOut, checkIn]);

  // Duration shortcut handler
  const handleDurationShortcut = useCallback((nights: number) => {
    const startDate = checkIn || today;
    const endDate = format(addDays(new Date(startDate), nights), 'yyyy-MM-dd');
    setCheckIn(startDate);
    setCheckOut(endDate);
    setSelectingCheckOut(false);
    setShowCalendar(false);
    setStep('ready');
  }, [checkIn, today]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isAr
      ? date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
      : format(date, 'MMM d');
  };

  const durationShortcuts = [
    { nights: 1, label: t('hero.nights1') },
    { nights: 2, label: t('hero.nights2') },
    { nights: 3, label: t('hero.nights3') },
    { nights: 7, label: t('hero.week1') },
  ];

  // Step indicator dots
  const steps: { key: SearchStep; label: string }[] = [
    { key: 'location', label: t('hero.destination') },
    { key: 'dates', label: t('hero.dates') },
    { key: 'ready', label: t('hero.search') },
  ];

  const currentStepIndex = step === 'idle' ? -1 : steps.findIndex((s) => s.key === step);

  return (
    <div className="relative min-h-[520px] sm:min-h-[600px] md:min-h-[720px] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(26,14,46,0.95) 0%, rgba(59,21,120,0.88) 35%, rgba(109,40,217,0.72) 70%, rgba(109,40,217,0.55) 100%)',
          }}
        />
      </div>

      {/* Decorative orbs */}
      <div className="hidden sm:block absolute top-20 left-10 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="hidden sm:block absolute bottom-20 right-10 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Content */}
      <div className="relative z-10 container-custom text-center py-10 sm:py-16 md:py-20 px-4 sm:px-6">
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs sm:text-sm font-medium px-3 sm:px-5 py-1.5 sm:py-2 rounded-full backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse-soft" />
            {t('hero.badge')}
          </span>
        </div>

        {/* Headline */}
        <div className="animate-fade-in-up mt-6" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-3 sm:mb-5 leading-[1.1] tracking-tight">
            {t('hero.title1')}
            <br />
            <span className="font-display italic text-gradient-gold inline-block mt-1">
              {t('hero.title2')}
            </span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-6 sm:mb-10 max-w-xl mx-auto leading-relaxed font-light px-2 sm:px-0">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Step indicator */}
        <div className="animate-fade-in-up flex items-center justify-center gap-2 mb-4" style={{ animationDelay: '0.3s' }}>
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${i <= currentStepIndex ? 'bg-gold-400 scale-110' : 'bg-white/30'}
              `} />
              <span className={`text-xs font-medium transition-colors duration-300 ${i <= currentStepIndex ? 'text-gold-400' : 'text-white/40'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px transition-colors duration-300 ${i < currentStepIndex ? 'bg-gold-400/60' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Glass search box */}
        <div
          className="animate-fade-in-up max-w-4xl mx-auto"
          style={{ animationDelay: '0.35s' }}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-5 border border-white/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {/* City */}
              <div className="relative" ref={cityDropdownRef}>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ltr:text-left rtl:text-right px-1">
                  {t('hero.destination')}
                </label>
                <div className="relative">
                  <MapPin className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setCity('');
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => {
                      setShowCityDropdown(true);
                      setStep('location');
                    }}
                    placeholder={t('hero.selectCity')}
                    aria-expanded={showCityDropdown}
                    role="combobox"
                    aria-haspopup="listbox"
                    className={`w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-3 border rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 bg-gray-50/50 transition-all duration-200 ${
                      step === 'location' ? 'border-primary-300 ring-2 ring-primary-400/40' : 'border-gray-100'
                    }`}
                  />
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-64 overflow-y-auto animate-fade-in-up" role="listbox">
                      {/* Header */}
                      <div className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                        {t('hero.popularDestinations')}
                      </div>
                      {filteredCities.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          role="option"
                          aria-selected={city === c.value}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleCitySelect(c.value, isAr ? c.ar : c.en)}
                          className={`w-full text-start px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                            city === c.value
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span>{isAr ? c.ar : c.en}</span>
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                          {isAr ? 'لا توجد نتائج' : 'No results'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ltr:text-left rtl:text-right px-1">
                  {t('hero.propertyType')}
                </label>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-300 bg-gray-50/50 appearance-none cursor-pointer transition-all duration-200"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Dates — visual calendar trigger */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ltr:text-left rtl:text-right px-1">
                  {t('hero.dates')}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendar(!showCalendar);
                    if (!showCalendar) {
                      setStep('dates');
                      if (!checkIn) setSelectingCheckOut(false);
                    }
                  }}
                  className={`w-full flex items-center gap-2 ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-3 border rounded-xl text-sm text-start transition-all duration-200 bg-gray-50/50 ${
                    step === 'dates' || showCalendar
                      ? 'border-primary-300 ring-2 ring-primary-400/40'
                      : 'border-gray-100'
                  }`}
                >
                  <Calendar className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                  <span className={checkIn ? 'text-gray-800' : 'text-gray-400'}>
                    {checkIn && checkOut
                      ? `${formatDateDisplay(checkIn)} — ${formatDateDisplay(checkOut)}`
                      : checkIn
                        ? `${formatDateDisplay(checkIn)} — ...`
                        : t('hero.checkIn') + ' — ' + t('hero.checkOut')
                    }
                  </span>
                </button>

                {/* Calendar overlay */}
                {showCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-fade-in-up min-w-[300px]">
                    {/* Calendar label */}
                    <div className="px-4 pt-3 pb-1">
                      <p className="text-xs font-semibold text-primary-600">
                        {selectingCheckOut ? t('hero.selectCheckOut') : t('hero.selectCheckIn')}
                      </p>
                    </div>

                    <MiniCalendar
                      checkIn={checkIn}
                      checkOut={checkOut}
                      onSelectDate={handleDateSelect}
                      locale={isAr ? 'ar' : 'en'}
                    />

                    {/* Duration shortcuts */}
                    <div className="px-3 pb-3 pt-1 border-t border-gray-50">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {t('hero.quickSelect')}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {durationShortcuts.map((d) => (
                          <button
                            key={d.nights}
                            type="button"
                            onClick={() => handleDurationShortcut(d.nights)}
                            className="bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-full px-3 py-1 text-xs font-medium transition-colors"
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search button */}
              <div className="flex flex-col justify-end">
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ltr:text-left rtl:text-right px-1 md:opacity-0">
                  {t('hero.search')}
                </label>
                <button
                  onClick={handleSearch}
                  className={`w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 flex items-center justify-center gap-2 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 ${
                    step === 'ready' ? 'ring-2 ring-gold-400/50 animate-pulse-soft' : ''
                  }`}
                >
                  <Search className="w-4 h-4" />
                  {t('hero.search')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick city links */}
        <div
          className="flex flex-wrap justify-center gap-2 mt-8 animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          {CITIES.slice(0, 6).map((c) => (
            <button
              key={c.value}
              onClick={() => {
                handleCitySelect(c.value, isAr ? c.ar : c.en);
              }}
              className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/5 hover:border-white/15"
            >
              {isAr ? c.ar : c.en}
            </button>
          ))}
        </div>

        {/* Trust indicators */}
        <div
          className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 mt-6 sm:mt-10 animate-fade-in-up"
          style={{ animationDelay: '0.65s' }}
        >
          {[
            { icon: Shield, label: t('hero.trustedStays') },
            { icon: Star, label: t('hero.guestReviewed') },
            { icon: Award, label: t('hero.support24') },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-white/60"
            >
              <Icon className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
