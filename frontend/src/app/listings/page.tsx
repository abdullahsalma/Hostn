'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchFilters from '@/components/listings/SearchFilters';
import PropertyCard from '@/components/listings/PropertyCard';
import { Property } from '@/types';
import { propertiesApi } from '@/lib/api';
import { ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

function ListingsContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const paramsObj = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    fetchProperties();
  }, [searchParams.toString()]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertiesApi.getAll({ ...paramsObj, limit: 12 });
      setProperties(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', p.toString());
    window.history.pushState(null, '', `/listings?${params.toString()}`);
    window.location.href = `/listings?${params.toString()}`;
  };

  const getTitle = () => {
    const parts = [];
    if (paramsObj.city) parts.push(`in ${paramsObj.city}`);
    if (paramsObj.type) parts.push(paramsObj.type + 's');
    if (paramsObj.guests) parts.push(`for ${paramsObj.guests}+ guests`);
    return parts.length > 0 ? `Stays ${parts.join(' ')}` : 'All Properties';
  };

  return (
    <>
      <SearchFilters />
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
            {!loading && (
              <p className="text-gray-500 text-sm mt-1">
                {pagination.total} propert{pagination.total !== 1 ? 'ies' : 'y'} found
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search in a different area.</p>
            <a href="/listings" className="btn-primary inline-flex">
              Clear filters
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const p = i + 1;
                  if (p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          p === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - pagination.page) === 2) {
                    return <span key={p} className="text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function ListingsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50/30">
        <Suspense fallback={<div className="container-custom py-8 text-center">Loading...</div>}>
          <ListingsContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
