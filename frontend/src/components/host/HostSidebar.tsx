'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  BookOpen,
  DollarSign,
  Star,
  MessageSquare,
  ArrowLeft,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HostSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function getNavItems(isAr: boolean) {
  return [
    { href: '/host', label: isAr ? '\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629' : 'Overview', icon: LayoutDashboard },
    { href: '/host/listings', label: isAr ? '\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A' : 'Listings', icon: Building2 },
    { href: '/host/bookings', label: isAr ? '\u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A' : 'Bookings', icon: BookOpen },
    { href: '/host/calendar', label: isAr ? '\u0627\u0644\u062A\u0642\u0648\u064A\u0645' : 'Calendar', icon: CalendarDays },
    { href: '/host/earnings', label: isAr ? '\u0627\u0644\u0623\u0631\u0628\u0627\u062D' : 'Earnings', icon: DollarSign },
    { href: '/host/reviews', label: isAr ? '\u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A' : 'Reviews', icon: Star },
    { href: '/host/messages', label: isAr ? '\u0627\u0644\u0631\u0633\u0627\u0626\u0644' : 'Messages', icon: MessageSquare },
  ];
}

function getBottomNavItems(isAr: boolean) {
  return [
    { href: '/host/settings', label: isAr ? '\u0627\u0644\u0625\u0639\u062F\u0627\u062D\u0627\u062A' : 'Settings', icon: Settings },
  ];
}

export default function HostSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: HostSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';
  const navItems = getNavItems(isAr);
  const bottomNavItems = getBottomNavItems(isAr);

  const isActive = (href: string) => {
    if (href === '/host') return pathname === '/host';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <Link href="/host" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">