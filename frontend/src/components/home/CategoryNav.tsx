'use client';

import Link from 'next/link';

const categories = [
  { label: 'Chalets', icon: '🏔️', value: 'chalet', color: 'bg-blue-50 text-blue-700' },
  { label: 'Villas', icon: '🏰', value: 'villa', color: 'bg-purple-50 text-purple-700' },
  { label: 'Apartments', icon: '🏢', value: 'apartment', color: 'bg-green-50 text-green-700' },
  { label: 'Studios', icon: '🛋️', value: 'studio', color: 'bg-amber-50 text-amber-700' },
  { label: 'Farms', icon: '🌾', value: 'farm', color: 'bg-emerald-50 text-emerald-700' },
  { label: 'Camps', icon: '⛺', value: 'camp', color: 'bg-orange-50 text-orange-700' },
  { label: 'Hotels', icon: '🏨', value: 'hotel', color: 'bg-red-50 text-red-700' },
];

export default function CategoryNav() {
  return (
    <section className="py-10 border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/listings?type=${cat.value}`}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${cat.color} group-hover:scale-110 transition-transform duration-200 shadow-sm`}
              >
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 group-hover:text-primary-600 transition-colors whitespace-nowrap">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
