'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Clock,
  MessageSquare,
  Star,
  ArrowRight,
  X,
} from 'lucide-react';
import { useState } from 'react';

export interface ActionItem {
  id: string;
  type: 'pending_booking' | 'unread_message' | 'new_review' | 'action_required';
  title: string;
  description: string;
  href: string;
  count?: number;
  urgent?: boolean;
}

interface ActionBannerProps {
  items: ActionItem[];
}

const typeConfig: Record<string, { icon: React.ElementType; bg: string; iconColor: string; badge: string }> = {
  pending_booking: {
    icon: Clock,
    bg: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
  unread_message: {
    icon: MessageSquare,
    bg: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  new_review: {
    icon: Star,
    bg: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  action_required: {
    icon: AlertTriangle,
    bg: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
  },
};

export default function ActionBanner({ items }: ActionBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = items.filter((item) => !dismissed.has(item.id));

  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      {visible.map((item) => {
        const config = typeConfig[item.type] || typeConfig.action_required;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} transition-all`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.badge}`}>
              <Icon className={`w-4 h-4 ${config.iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                {item.count && item.count > 1 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.badge}`}>
                    {item.count}
                  </span>
                )}
                {item.urgent && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
            </div>

            <Link
              href={item.href}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0"
            >
              View <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>

            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(item.id))}
              className="p-1 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
