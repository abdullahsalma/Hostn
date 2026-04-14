'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { hostApi } from '@/lib/api';
import { usePageTitle } from '@/lib/usePageTitle';
import {
  Loader2, ChevronDown, Trophy, CheckCircle2,
  Moon, Star, MessageSquare, Zap, Camera, Video,
  ShieldCheck, CalendarCheck, MapPin, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────

interface PropertyOption {
  _id: string;
  title: string;
  titleAr?: string;
  units: { _id: string; nameEn: string; nameAr: string }[];
}

interface PointMetric {
  key: string;
  score: number;
  max: number;
  label: { en: string; ar: string };
}

interface PointsData {
  unitId: string;
  unitName: string;
  totalPoints: number;
  maxPoints: number;
  previousPoints: number | null;
  delta: number | null;
  performance: { total: number; max: number; metrics: PointMetric[] };
  excellence: { total: number; max: number; metrics: PointMetric[] };
  complaints: number;
}

// ── Translations ──────────────────────────────────────────────────────

const t: Record<string, Record<string, string>> = {
  title: { en: 'Unit Points', ar: 'نقاط الوحدات' },
  subtitle: { en: 'Points help your unit appear higher in search results', ar: 'النقاط تساهم في ظهور الوحدة في نتائج البحث' },
  selectProperty: { en: 'Select Property', ar: 'اختر العقار' },
  selectUnit: { en: 'Select Unit', ar: 'اختر الوحدة' },
  points: { en: 'points', ar: 'نقطة' },
  comparedToLast: { en: 'compared to last update', ar: 'مقارنة بآخر تحديث' },
  noComplaints: { en: 'No complaints on your unit!', ar: 'لا توجد شكاوى على وحدتك!' },
  noComplaintsDesc: { en: 'Thanks for your continuous efforts in providing an excellent hosting experience', ar: 'شكراً لجهودك المستمرة في تقديم تجربة إستضافة مميزة للضيوف' },
  performancePoints: { en: 'Performance Points', ar: 'نقاط الأداء' },
  excellencePoints: { en: 'Excellence Points', ar: 'نقاط التميز' },
  learnMore: { en: 'Learn more', ar: 'اعرف المزيد' },
  noProperties: { en: 'No properties found. Create a listing to see your unit points.', ar: 'لا توجد عقارات. أنشئ إعلاناً لمشاهدة نقاط وحداتك.' },
  noUnits: { en: 'This property has no units yet.', ar: 'لا توجد وحدات في هذا العقار بعد.' },
  loadError: { en: 'Failed to load points data', ar: 'فشل في تحميل بيانات النقاط' },
};

// ── Metric icons ──────────────────────────────────────────────────────

const METRIC_ICONS: Record<string, React.ElementType> = {
  nightsBooked: Moon,
  reviews: Star,
  responseRate: MessageSquare,
  responseSpeed: Zap,
  photosUpdated: Camera,
  videoUpdated: Video,
  tourismPermit: ShieldCheck,
  unitAvailability: CalendarCheck,
  arrivalInstructions: MapPin,
  discounts: Tag,
};

// ── CircularProgress ──────────────────────────────────────────────────

function CircularProgress({ value, max, size = 160 }: { value: number; max: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  // Color based on percentage
  let strokeColor = '#ef4444'; // red
  if (pct >= 0.7) strokeColor = '#10b981'; // green
  else if (pct >= 0.4) strokeColor = '#f59e0b'; // amber

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={10}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

// ── MetricCard ────────────────────────────────────────────────────────

function MetricCard({ metric, lang }: { metric: PointMetric; lang: 'en' | 'ar' }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = METRIC_ICONS[metric.key] || Trophy;
  const pct = metric.max > 0 ? metric.score / metric.max : 0;

  let barColor = 'bg-red-500';
  if (pct >= 0.8) barColor = 'bg-emerald-500';
  else if (pct >= 0.5) barColor = 'bg-amber-500';
  else if (pct >= 0.3) barColor = 'bg-orange-500';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-4 text-start hover:bg-gray-50 transition-colors"
      >
        <div className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
          pct >= 0.8 ? 'bg-emerald-50 text-emerald-600' :
          pct >= 0.5 ? 'bg-amber-50 text-amber-600' :
          'bg-gray-50 text-gray-400'
        )}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-gray-700">{metric.label[lang]}</span>
            <span className="text-sm font-semibold text-gray-900">
              {metric.score}<span className="text-gray-400">/{metric.max}</span>
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={cn('h-2 rounded-full transition-all duration-500', barColor)}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
          expanded && 'rotate-180'
        )} />
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          <p className="text-xs text-gray-500 mt-2">
            {lang === 'ar'
              ? `حصلت على ${metric.score} من أصل ${metric.max} ${t.points.ar}`
              : `You earned ${metric.score} out of ${metric.max} ${t.points.en}`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function UnitPointsPage() {
  const { language } = useLanguage();
  const lang = language as 'en' | 'ar';
  const isAr = lang === 'ar';
  usePageTitle(isAr ? 'نقاط الوحدات' : 'Unit Points');

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load properties on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await hostApi.getPropertiesWithUnits();
        const data: PropertyOption[] = res.data?.data || [];
        setProperties(data);
        if (data.length > 0) {
          setSelectedPropertyId(data[0]._id);
          if (data[0].units.length > 0) {
            setSelectedUnitId(data[0].units[0]._id);
          }
        }
      } catch {
        setError(t.loadError[lang]);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load points when unit changes
  const loadPoints = useCallback(async (unitId: string) => {
    if (!unitId) return;
    setPointsLoading(true);
    setError('');
    try {
      const res = await hostApi.getUnitPoints(unitId);
      setPointsData(res.data?.data || null);
    } catch {
      setError(t.loadError[lang]);
      setPointsData(null);
    } finally {
      setPointsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (selectedUnitId) loadPoints(selectedUnitId);
  }, [selectedUnitId, loadPoints]);

  // Handle property change
  const handlePropertyChange = (propId: string) => {
    setSelectedPropertyId(propId);
    const prop = properties.find((p) => p._id === propId);
    if (prop && prop.units.length > 0) {
      setSelectedUnitId(prop.units[0]._id);
    } else {
      setSelectedUnitId('');
      setPointsData(null);
    }
  };

  const selectedProperty = properties.find((p) => p._id === selectedPropertyId);
  const units = selectedProperty?.units || [];

  // ── Render ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title[lang]}</h1>
        <p className="text-gray-500 mb-6">{t.subtitle[lang]}</p>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t.noProperties[lang]}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t.title[lang]}</h1>
      <p className="text-sm text-gray-500 mb-6">{t.subtitle[lang]}</p>

      {/* Property / Unit selectors */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.selectProperty[lang]}</label>
          <select
            value={selectedPropertyId}
            onChange={(e) => handlePropertyChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {properties.map((p) => (
              <option key={p._id} value={p._id}>
                {isAr && p.titleAr ? p.titleAr : p.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.selectUnit[lang]}</label>
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={units.length === 0}
          >
            {units.length === 0 && (
              <option value="">{t.noUnits[lang]}</option>
            )}
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {isAr && u.nameAr ? u.nameAr : u.nameEn || u.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {pointsLoading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {/* Error */}
      {error && !pointsLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Points data */}
      {pointsData && !pointsLoading && (
        <div className="space-y-6">
          {/* Score circle + delta */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center">
            <div className="relative">
              <CircularProgress value={pointsData.totalPoints} max={pointsData.maxPoints} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{pointsData.totalPoints}</span>
                <span className="text-xs text-gray-500">{t.points[lang]}</span>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold text-gray-900">{pointsData.unitName}</p>
            {pointsData.delta !== null && (
              <p className={cn(
                'mt-1 text-xs font-medium',
                pointsData.delta > 0 ? 'text-emerald-600' : pointsData.delta < 0 ? 'text-red-600' : 'text-gray-400'
              )}>
                {pointsData.delta > 0 ? '▲' : pointsData.delta < 0 ? '▼' : '—'}{' '}
                {pointsData.delta > 0 ? '+' : ''}{pointsData.delta} {t.comparedToLast[lang]}
              </p>
            )}
          </div>

          {/* Complaints banner */}
          {pointsData.complaints === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">{t.noComplaints[lang]}</p>
                <p className="text-xs text-emerald-600 mt-0.5">{t.noComplaintsDesc[lang]}</p>
              </div>
            </div>
          )}

          {/* Performance Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{t.performancePoints[lang]}</h2>
              <span className="text-sm font-medium text-gray-500">
                <span className="text-gray-900 font-semibold">{pointsData.performance.total}</span>
                /{pointsData.performance.max} {t.points[lang]}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pointsData.performance.metrics.map((m) => (
                <MetricCard key={m.key} metric={m} lang={lang} />
              ))}
            </div>
          </div>

          {/* Excellence Points */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">{t.excellencePoints[lang]}</h2>
              <span className="text-sm font-medium text-gray-500">
                <span className="text-gray-900 font-semibold">{pointsData.excellence.total}</span>
                /{pointsData.excellence.max} {t.points[lang]}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pointsData.excellence.metrics.map((m) => (
                <MetricCard key={m.key} metric={m} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
