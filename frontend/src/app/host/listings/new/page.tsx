'use client';

import Link from 'next/link';
import PropertyForm from '@/components/host/PropertyForm';
import { ChevronLeft } from 'lucide-react';

export default function NewPropertyPage() {
  return (
    <div>
      <div className="mb-8">
        <Link
          href="/host/listings"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-sm text-gray-500 mt-1">
          Follow the steps to list your property on Hostn and start hosting guests.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
