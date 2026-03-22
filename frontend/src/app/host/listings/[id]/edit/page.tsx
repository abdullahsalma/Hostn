'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Property } from '@/types';
import { propertiesApi } from '@/lib/api';
import PropertyForm from '@/components/host/PropertyForm';
import { ChevronLeft } from 'lucide-react';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await propertiesApi.getOne(id);
        setProperty(res.data.data);
      } catch {
        router.push('/host/listings');
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="h-3 w-48 bg-gray-100 rounded" />
        <div className="h-2 bg-gray-100 rounded-full w-full" />
        <div className="flex gap-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-100 rounded-xl flex-shrink-0" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/host/listings"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Listings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-sm text-gray-500 mt-1">{property.title}</p>
      </div>
      <PropertyForm initialData={property} isEditing />
    </div>
  );
}
