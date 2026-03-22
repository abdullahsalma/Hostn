'use client';

import { useEffect, useState, useMemo } from 'react';
import { Property, CalendarData, CalendarBooking } from '@/types';
import { propertiesApi, hostApi } from '@/lib/api';
import { formatDate, formatPrice, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  Unlock,
  Calendar as CalIcon,
  Building2,
  User,
  CalendarDays,
  Info,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CalendarSkeleton } from '@/components/ui/PageSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  isWithinInterval,
  parseISO,
  addDays,
  isBefore,
  isToday,
} from 'date-fns';

export default function CalendarPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [calLoading, setCalLoading] = useState(false);

  // Date selection for blocking
  const [selectStart, setSelectStart] = useState<Date | null>(null);
  const [selectEnd, setSelectEnd] = useState<Date | null>(null);
  const [blocking, setBlocking] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) loadCalendar();
  }, [selectedPropertyId, currentMonth]);

  const loadProperties = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await propertiesApi.getMyProperties();
      const props = res.data.data || [];
      setProperties(props);
      if (props.length > 0) setSelectedPropertyId(props[0]._id);
    } catch {
      setError(true);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendar = async () => {
    setCalLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(addMonths(currentMonth, 1)), 'yyyy-MM-dd');
      const res = await hostApi.getCalendar(selectedPropertyId, start, end);
      setCalendarData(res.data.data);
    } catch {
      toast.error('Failed to load calendar data');
    } finally {
      setCalLoading(false);
    }
  };

  const handleBlockDates = async () => {
    if (!selectStart || !selectEnd || !selectedPropertyId) return;
    setBlocking(true);
    try {
      await hostApi.blockDates(selectedPropertyId, {
        startDate: format(selectStart, 'yyyy-MM-dd'),
        endDate: format(selectEnd, 'yyyy-MM-dd'),
        action: 'block',
      });
      toast.success('Dates blocked successfully');
      setSelectStart(null);
      setSelectEnd(null);
      loadCalendar();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to block dates');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockDates = async (start: string, end: string) => {
    if (!selectedPropertyId) return;
    try {
      await hostApi.blockDates(selectedPropertyId, { startDate: start, endDate: end, action: 'unblock' });
      toast.success('Dates unblocked');
      loadCalendar();
    } catch {
      toast.error('Failed to unblock dates');
    }
  };

  const handleDayClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) return;
    if (!selectStart || (selectStart && selectEnd)) {
      setSelectStart(day);
      setSelectEnd(null);
    } else {
      if (isBefore(day, selectStart)) {
        setSelectEnd(selectStart);
        setSelectStart(day);
      } else {
        setSelectEnd(day);
      }
    }
  };

  const getDayStatus = (day: Date) => {
    if (!calendarData) return null;
    for (const b of calendarData.bookings) {
      const checkIn = parseISO(b.checkIn);
      const checkOut = parseISO(b.checkOut);
      if (isWithinInterval(day, { start: checkIn, end: addDays(checkOut, -1) })) {
        return { type: 'booked' as const, booking: b };
      }
    }
    for (const block of calendarData.blockedDates) {
      const s = parseISO(block.start);
      const e = parseISO(block.end);
      if (isWithinInterval(day, { start: s, end: addDays(e, -1) })) {
        return { type: 'blocked' as const, block };
      }
    }
    return null;
  };

  const isInSelection = (day: Date) => {
    if (!selectStart) return false;
    if (!selectEnd) {
      // Show hover preview
      if (hoveredDay && isBefore(selectStart, hoveredDay)) {
        return isWithinInterval(day, { start: selectStart, end: hoveredDay });
      }
      return isSameDay(day, selectStart);
    }
    return isWithinInterval(day, { start: selectStart, end: selectEnd });
  };

  // Stats from calendar data
  const stats = useMemo(() => {
    if (!calendarData) return { booked: 0, blocked: 0, available: 0 };
    const monthDays = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    });
    let booked = 0, blocked = 0;
    monthDays.forEach((d) => {
      const s = getDayStatus(d);
      if (s?.type === 'booked') booked++;
      else if (s?.type === 'blocked') blocked++;
    });
    return { booked, blocked, available: monthDays.length - booked - blocked };
  }, [calendarData, currentMonth]);

  // Render a single month grid
  const renderMonth = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    return (
      <div>
        <h3 className="text-sm font-bold text-gray-900 text-center mb-3">
          {format(month, 'MMMM yyyy')}
        </h3>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
          {days.map((day) => {
            const status = getDayStatus(day);
            const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
            const selected = isInSelection(day);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                disabled={isPast}
                title={
                  status?.type === 'booked'
                    ? `Booked: ${(status.booking as CalendarBooking).guest?.name}`
                    : status?.type === 'blocked'
                    ? 'Blocked'
                    : isPast ? '' : 'Available'
                }
                className={cn(
                  'relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all',
                  isPast && 'text-gray-200 cursor-not-allowed',
                  !isPast && !selected && !status && 'text-gray-700 hover:bg-gray-100',
                  !isPast && !selected && status?.type === 'booked' && 'bg-green-50 text-green-700 hover:bg-green-100',
                  !isPast && !selected && status?.type === 'blocked' && 'bg-red-50 text-red-500 hover:bg-red-100',
                  selected && 'bg-primary-100 text-primary-700 ring-1 ring-primary-400',
                  today && !selected && !status && 'ring-1 ring-primary-300 bg-primary-50 text-primary-700',
                )}
              >
                <span className="leading-none">{format(day, 'd')}</span>
                {status?.type === 'booked' && <div className="w-1 h-1 bg-green-500 rounded-full mt-0.5" />}
                {status?.type === 'blocked' && <Lock className="w-2 h-2 text-red-400 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <CalendarSkeleton />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load calendar"
        message="We had trouble fetching your properties. Please try again."
        onRetry={loadProperties}
      />
    );
  }

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Availability</h1>
          <p className="text-sm text-gray-500 mt-1">Manage booking dates and block unavailable periods</p>
        </div>
        <EmptyState
          icon={CalendarDays}
          title="No properties yet"
          description="Add a property to start managing your calendar."
          actionLabel="Add Property"
          actionHref="/host/listings/new"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar & Availability</h1>
          <p className="text-sm text-gray-500 mt-1">Manage booking dates and block unavailable periods</p>
        </div>
      </div>

      {/* Property selector + selection bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-72">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-400 appearance-none bg-white"
          >
            {properties.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {selectStart && (
          <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 px-4 py-2 rounded-xl">
            <span className="text-sm text-primary-700">
              <strong>{format(selectStart, 'MMM d')}</strong>
              {selectEnd && <> → <strong>{format(selectEnd, 'MMM d')}</strong></>}
            </span>
            <Button
              size="sm"
              onClick={handleBlockDates}
              isLoading={blocking}
              disabled={!selectEnd}
              leftIcon={<Lock className="w-3.5 h-3.5" />}
            >
              Block
            </Button>
            <button
              onClick={() => { setSelectStart(null); setSelectEnd(null); }}
              className="text-xs text-primary-500 hover:text-primary-700 font-medium"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <div>
            <p className="text-sm font-bold text-gray-900">{stats.booked}</p>
            <p className="text-[10px] text-gray-500">Booked days</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div>
            <p className="text-sm font-bold text-gray-900">{stats.blocked}</p>
            <p className="text-[10px] text-gray-500">Blocked days</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-3 h-3 bg-gray-200 rounded-full" />
          <div>
            <p className="text-sm font-bold text-gray-900">{stats.available}</p>
            <p className="text-[10px] text-gray-500">Available days</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-50"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Two-month grid */}
          <div className={cn('grid gap-6', calLoading && 'opacity-50 pointer-events-none')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderMonth(currentMonth)}
              {renderMonth(addMonths(currentMonth, 1))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100">
            {[
              { color: 'bg-green-500', label: 'Booked' },
              { color: 'bg-red-400', label: 'Blocked' },
              { color: 'bg-primary-400', label: 'Selected' },
              { color: 'bg-gray-200', label: 'Available' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="text-[11px] text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <CalIcon className="w-4 h-4 text-primary-500" />
              Upcoming Bookings
            </h3>
            {calendarData?.bookings && calendarData.bookings.length > 0 ? (
              <div className="space-y-3">
                {calendarData.bookings.map((b) => {
                  const isConfirmed = b.status === 'confirmed';
                  return (
                    <div key={b._id} className={cn('p-3 rounded-xl', isConfirmed ? 'bg-green-50' : 'bg-amber-50')}>
                      <div className="flex items-center gap-2 mb-1">
                        <User className={cn('w-3 h-3', isConfirmed ? 'text-green-600' : 'text-amber-600')} />
                        <span className={cn('text-xs font-semibold', isConfirmed ? 'text-green-800' : 'text-amber-800')}>
                          {b.guest?.name}
                        </span>
                      </div>
                      <div className={cn('text-xs', isConfirmed ? 'text-green-700' : 'text-amber-700')}>
                        {formatDate(b.checkIn, 'MMM d')} → {formatDate(b.checkOut, 'MMM d')}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className={cn('text-xs font-bold', isConfirmed ? 'text-green-800' : 'text-amber-800')}>
                          {formatPrice(b.total || 0)}
                        </span>
                        <span className={cn(
                          'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          isConfirmed ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                        )}>
                          {isConfirmed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                          {b.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No upcoming bookings for this property.</p>
            )}
          </div>

          {/* Blocked dates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-500" />
              Blocked Dates
            </h3>
            {calendarData?.blockedDates && calendarData.blockedDates.length > 0 ? (
              <div className="space-y-2">
                {calendarData.blockedDates.map((block, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="text-xs text-red-700">
                      {formatDate(block.start, 'MMM d')} → {formatDate(block.end, 'MMM d')}
                    </div>
                    <button
                      onClick={() => handleUnblockDates(block.start, block.end)}
                      className="text-xs font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" /> Unblock
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No blocked dates. Select dates on the calendar to block them.</p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-1">Tips</p>
                <ul className="text-[11px] text-blue-600 space-y-1">
                  <li>Click a date to start selecting</li>
                  <li>Click another date to complete the range</li>
                  <li>Then click "Block" to mark as unavailable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
