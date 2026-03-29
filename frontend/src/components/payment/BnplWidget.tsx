'use client';

import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';

interface BnplWidgetProps {
  total: number;
  compact?: boolean;
}

/**
 * BNPL installment preview widget — shown on property pages and booking widget.
 * Displays Tabby and Tamara "split into 4" previews like Gathern does.
 * Only shown for amounts between 1-5000 SAR.
 */
export default function BnplWidget({ total, compact = false }: BnplWidgetProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // BNPL available for 1-5000 SAR
  if (total <= 0 || total > 5000) return null;

  const installment = Math.ceil((total / 4) * 100) / 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {isAr
            ? `قسّمها على 4 دفعات بدون فوائد — ${formatPrice(installment)} / دفعة`
            : `Split into 4 interest-free payments of ${formatPrice(installment)}`
          }
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-emerald-800">
          {isAr ? 'قسّمها على 4 دفعات بدون فوائد' : 'Split into 4 interest-free payments'}
        </p>
      </div>

      {/* Installment timeline */}
      <div className="flex items-center justify-between gap-1 mb-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`h-1.5 rounded-full mb-1.5 ${i === 0 ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
            <p className="text-xs font-bold text-emerald-800">{formatPrice(installment)}</p>
            <p className="text-[10px] text-emerald-600">
              {i === 0
                ? (isAr ? 'اليوم' : 'Today')
                : (isAr ? `الشهر ${i}` : `Month ${i}`)
              }
            </p>
          </div>
        ))}
      </div>

      {/* Provider logos */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-emerald-200">
        <div className="flex items-center gap-1.5">
          <div className="w-14 h-5 bg-white rounded flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-purple-600 tracking-wider">tabby</span>
          </div>
        </div>
        <span className="text-emerald-300">|</span>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-5 bg-white rounded flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-blue-600 tracking-wider">tamara</span>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-center text-emerald-600 mt-2">
        {isAr ? 'بدون رسوم تأخير • بدون فوائد' : 'No late fees • No interest'}
      </p>
    </div>
  );
}
