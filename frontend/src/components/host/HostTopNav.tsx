'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { hostApi } from '@/lib/api';
import { HostNotification } from '@/types';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HostTopNavProps {
  onMenuClick: () => void;
  title?: string;
}

export default function HostTopNav({ onMenuClick, title }: HostTopNavProps) {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';
  const [notifications, setNotifications] = useState<HostNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await hostApi.getNotifications();
      setNotifications(res.data.data || []);
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          {title && (
            <h1 className="text-lg font-bold text-gray-900 hidden sm:block">{title}</h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            {isAr ? 'EN' : 'AR'}
          </button>

          {/* View site link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />