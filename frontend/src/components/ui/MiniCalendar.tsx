'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, format, isSameDay, isBefore,
  isAfter, isSameMonth, startOfDay,
} from 'date-fns';

export interface MiniCalendarProps {
  checkIn: string;
  checkOut: string;
  onSelectDate: (date: string) => void;
  unavailableDates?: string[];
  locale?: 'en' | 'ar';
  className?: string;
}

const DAY_NAMES_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_NAMES_AR = ['أح', 'إث', 'ث', 'أر', 'خ', 'ج', 'س'];

export default function MiniCalendar({
  checkIn,
  checkOut,
  onSelectDate,
  unavailableDates = [],
  locale = 'en',
  className = '',
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (checkIn) {
      const d = new Date(checkIn);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });
  const today = startOfDay(new Date());

  const unavailableSet = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates]
  );

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }
    return rows;
  }, [currentMonth]);

  const checkInDate = checkIn ? startOfDay(new Date(checkIn)) : null;
  const checkOutDate = checkOut ? startOfDay(new Date(checkOut)) : null;

  const isInRange = (day: Date) => {
    if (!checkInDate || !checkOutDate) return false;
    return isAfter(day, checkInDate) && isBefore(day, checkOutDate);
  };

  const dayNames = locale === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  return (
    <div className={`p-3 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={locale === 'ar' ? 'الشهر السابق' : 'Previous month'}
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <span className="text-sm font-semibold text-gray-800">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label={locale === 'ar' ? 'الشهر التالي' : 'Next month'}
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {weeks.flat().map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isPast = isBefore(day, today);
          const isUnavailable = unavailableSet.has(dateStr);
          const disabled = isPast || isUnavailable || !isSameMonth(day, currentMonth);
          const isCheckIn = checkInDate && isSameDay(day, checkInDate);
          const isCheckOut = checkOutDate && isSameDay(day, checkOutDate);
          const inRange = isInRange(day);

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(dateStr)}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-disabled={disabled}
              className={`
                h-8 text-xs rounded-md transition-colors
                ${disabled ? 'text-gray-300 cursor-default' : 'hover:bg-primary-100 cursor-pointer'}
                ${isCheckIn || isCheckOut ? 'bg-primary-600 text-white font-bold hover:bg-primary-700' : ''}
                ${inRange ? 'bg-primary-100 text-primary-800' : ''}
                ${!disabled && !isCheckIn && !isCheckOut && !inRange ? 'text-gray-700' : ''}
              `}
            >
              {isSameMonth(day, currentMonth) ? format(day, 'd') : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
