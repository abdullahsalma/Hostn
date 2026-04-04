'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { propertiesApi } from '@/lib/api';
import { Property } from '@/types';
import PropertyCard from '@/components/listings/PropertyCard';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const lang = language as 'en' | 'ar';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.wishlist?.length) {
      setLoading(false);
      return;
    }
    const fetchFavorites = async () => {
      try {
        // Fetch each wishlisted property
        const results = await Promise.allSettled(
          user.wishlist.map((id) => propertiesApi.getOne(id))
        );
        const props = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => (r as PromiseFulfilledResult<{ data: { data: Property } }>).value.data.data)
          .filter(Boolean);
        setProperties(props);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [isAuthenticated, user?.wishlist]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {lang === 'ar' ? '\u0627\u0644\u0645\u0641\u0636\u0644\u0629' : 'Favorites'}
        </h1>
        <p className="text-gray-500 mt-1">
          {lang === 'ar' ? '\u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u064A \u0623\u0639\u062C\u0628\u062A\u0643' : 'Properties you\'ve saved'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">
            {lang === 'ar'
              ? '\u0644\u0645 \u062A\u062D\u0641\u0638 \u0623\u064A \u0639\u0642\u0627\u0631\u0627\u062A \u0628\u0639\u062F'
              : 'You haven\'t saved any properties yet'}
          </p>
          <Link
            href="/listings"
            className="inline-block bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {lang === 'ar' ? '\u062A\u0635\u0641\u062D \u0627\u0644\u0639\u0642\u0627\u0631\u0627\u062A' : 'Browse Properties'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
