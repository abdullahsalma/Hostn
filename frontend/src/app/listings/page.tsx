'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/listings/PropertyCard';
import { useLanguage } from '@/context/LanguageContext';
import { propertiesApi } from '@/lib/api';
import { Loader2, Search } from 'lucide-react';
import { Property } from '@/types';

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const lang = language as 'en' | 'ar';

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState(searchParams.get('city') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (searchCity) params.city = searchCity;
      if (selectedType) params.type = selectedType;
      const res = await propertiesApi.getAll(params);
      setProperties(res.data.properties || res.data.data || []);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [selectedType]);

  const types = [
    { key: '', label: { en: 'All', ar: 'الكل' } },
    { key: 'chalet', label: { en: 'Chalets', ar: 'شاليهات' } },
    { key: 'villa', label: { en: 'Villas', ar: 'فلل' } },
    { key: 'apartment', label: { en: 'Apartments', ar: 'شقق' } },
    { key: 'farm', label: { en: 'Farms', ar: 'مزارع' } },
    { key: 'camp', label: { en: 'Camps', ar: 'مخيمات' } },
    { key: 'hotel', label: { en: 'Hotels', ar: 'فنادق' } },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder={lang === 'ar' ? 'ابحث عن مدينة...' : 'Search by city...'}
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProperties()}
                className="flex-1 input-base"
              />
              <button onClick={fetchProperties} className="btn-primary flex items-center gap-2">
                <Search className="w-4 h-4" />
                {lang === 'ar' ? 'بحث' : 'Search'}
              </button>
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {types.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedType(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {label[lang]}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                {lang === 'ar' ? 'لا توجد عقارات' : 'No properties found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
