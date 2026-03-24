'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Booking, Property } from '@/types';
import { bookingsApi, propertiesApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDays, Home, User, Heart, Star, PlusCircle,
  Clock, CheckCircle2, XCircle, ArrowRight, Settings,
  BookOpen, Trophy, Users
} from 'lucide-react';

type TabType = 'overview' | 'bookings' | 'properties' | 'wishlist' | 'profile';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [bookRes, propRes] = await Promise.allSettled([
        bookingsApi.getMyBookings(),
        user?.role === 'host' ? propertiesApi.getMyProperties() : Promise.resolve(null),
      ]);
      if (bookRes.status === 'fulfilled') setBookings(bookRes.value?.data?.data || []);
      if (propRes.status === 'fulfilled' && propRes.value) setProperties(propRes.value?.data?.data || []);
    } catch {
      // ignore
    } finally {
      setDataLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <main className="container-custom py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-48" />
            <div className="h-40 bg-gray-100 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-blue-100 text-blue-700',
    rejected: 'bg-gray-100 text-gray-700',
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'confirmed' || status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (status === 'cancelled' || status === 'rejected') return <XCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  const tabs = [
    { id: 'overview', label: t('dash.overview'), Icon: Home },
    { id: 'bookings', label: t('dash.bookings'), Icon: CalendarDays, badge: bookings.filter(b => b.status === 'confirmed').length },
    ...(user.role === 'host' ? [{ id: 'properties', label: t('dash.myProperties'), Icon: Home }] : []),
    { id: 'wishlist', label: t('dash.wishlist'), Icon: Heart },
    { id: 'profile', label: t('dash.profile'), Icon: User },
  ] as const;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container-custom py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Mobile tab nav */}
            <div className="lg:hidden overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
              <div className="flex gap-2 min-w-max">��b6�74��S�'76Rג�#��F'2������B��&V���6���&FvRӢ��C�7G&��s��&Vâ7G&��s��6��&V7B�V�V�V�EG�S�&FvS��V�&W"Ғ�����'WGF���W�׶�GТ��6Ɩ6�ײ����6WD7F�fUF"��B2F%G�R�Т6�74��S׶r�gV��f�W��FV�2�6V�FW"�W7F�g��&WGvVV���2��"�R&�V�FVB׆�FW�B�6�f��B��VF�V�G&�6�F������G��7F�fUF"����@��v&r�&��'��cFW�B�v��FRp��wFW�B�w&��c��fW#�&r�w&��Sp��Т��7�6�74��S�&f�W��FV�2�6V�FW"v�"�R#�Ė6��6�74��S�'r�B��B"����&V�Т��7���&FvRbb&FvR�bb���7�6�74��S׶r�R��R&�V�FVB�gV��FW�Bׇ2f�W��FV�2�6V�FW"�W7F�g��6V�FW"f��B�&��BG��7F�fUF"����B�v&r�v��FRFW�B�&��'��cr�v&r�&��'��FW�B�&��'��cp�����&FvWТ��7���Т��'WGF�����Т���cࠢƇ"6�74��S�&ג�B&�&FW"�w&��"���'WGF����6Ɩ6�׶��v�WGТ6�74��S�'r�gV��f�W��FV�2�6V�FW"v�"�R��2��"�R&�V�FVB׆�FW�B�6�f��B��VF�V�FW�B�&VB�c��fW#�&r�&VB�SG&�6�F����6���'2 ��ń6�&6�R6�74��S�'r�B��B"���B�vF6��6�v��WBr�Т��'WGF�����F�cࠢ�W6W"�&��R��v��7Brbb���Ɩ氢�&Vc�"�WF��&Vv�7FW#�&��Sֆ�7B �6�74��S�&&��6�&r�w&F�V�B�F��"g&���&��'��cF��&��'��sFW�B�v��FR&�V�FVB�'���RFW�B�6V�FW"��fW#��6�G�ӓRG&�6�F�����6�G� ��Ć��R6�74��S�'r�r��rׂ�WF��"�"FW�B�v��FR�"���6�74��S�&f��B�&��BFW�B�6�#�B�vF6��&V6��T��7Br������6�74��S�'FW�Bׇ2FW�B�&��'��#�B�#�B�vF6��V&�'�Ɨ7F��rr�������Ɩ���Т��6�FSࠢ�����6��FV�B��Т�F�b6�74��S�&f�W��֖��r�#����fW'f�Wr��Т�7F�fUF"���v�fW'f�Wrrbb���F�b6�74��S�'76Rג�b#�ƃ6�74��S�'FW�B׆�6ӧFW�B�'��f��B�&��BFW�B�w&�ӓ#��B�vF6��vV�6��Rr���W6W"���R�7ƗB�rr��������ࠢ�F�b6�74��S�&w&�Bw&�B�6��2�"�C�w&�B�6��2�Bv�B#������&VâB�vF6��F�F�&�����w2r��f�VS�&�����w2��V�wF���6��&����V��6���#�v&r�&�VR�Sr��6��6���#�wFW�B�&�VR�Sr�����&VâB�vF6��6��f�&�VBr��f�VS�&�����w2�f��FW"�"��"�7FGW2���v6��f�&�VBr���V�wF���6��6�V6�6�&6�S"�6���#�v&r�w&VV��Sr��6��6���#�wFW�B�w&VV��Sr�����&VâB�vF6��6���WFVBr��f�VS�&�����w2�f��FW"�"��"�7FGW2���v6���WFVBr���V�wF���6��G&����6���#�v&r��&W"�Sr��6��6���#�wFW�B��&W"�Sr�����&VâB�vF6��v�6�Ɨ7FVBr��f�VS�W6W"�v�6�Ɨ7C���V�wF�����6���V'B�6���#�v&r�&VB�Sr��6��6���#�wFW�B�&VB�Sr��������7FB������F�b�W�׷7FB��&V��6�74��S׶&�V�FVB׆�6ӧ&�V�FVB�'���26ӧ�RG�7FB�6���'����7FB�6��6�74��S׶r�R��R6ӧr�b6Ӧ��b�"�6Ӧ�"�"G�7FB�6��6���'�����F�b6�74��S�'FW�B׆�6ӧFW�B�'��f��B�&��BFW�B�w&�ӓ#�7FB�f�VW���F�c��F�b6�74��S�'FW�Bճ��6ӧFW�Bׇ2FW�B�w&��cf��B��VF�V�#�7FB��&V����F�c���F�c���Т��F�cࠢ��&V6V�B&�����w2��Т�F�b6�74��S�&&r�v��FR&�V�FVB�'��6�F�r�6&B�b#��F�b6�74��S�&f�W��W7F�g��&WGvVV��FV�2�6V�FW"�"�R#�ƃ"6�74��S�&f��B�&��BFW�B�w&�ӓ#�B�vF6��&V6V�D&�����w2r�����#��'WGF����6Ɩ6�ײ����6WD7F�fUF"�v&�����w2r��6�74��S�'FW�B�6�FW�B�&��'��c��fW#�FW�B�&��'��sf��B��VF�V�f�W��FV�2�6V�FW"v�#��B�vF6��f�Wt��r���'&�u&�v�B6�74��S�'r�2�R��2�R"����'WGF�����F�c�          <p className="text-xs text-gray-500">{formatDate(booking.checkIn)} &ndash; {formatDate(booking.checkOut)}</p>
                            </div>
                            <span className={`badge text-xs font-medium flex items-center gap-1 ${statusColors[booking.status]}`}>
                              <StatusIcon status={booking.status} />
                              {booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bookings tab */}
              {activeTab === 'bookings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dash.myBookings')}</h2>
                  {dataLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                      <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-700 mb-2">{t('dash.noBookings')}</h3>
                      <p className="text-sm text-gray-500 mb-5">{t('dash.bookingHistory')}</p>
                      <Link href="/listings" className="btn-primary inline-flex">{t('dash.browseProperties')}</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-2xl shadow-card p-5">
                          <div className="flex gap-4">
                            {booking.property?.images?.[0] && (
                              <div className="relative w-24 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <Image src={booking.property.images[0].url} alt="" fill className="object-cover" unoptimized />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 leading-snug">{booking.property?.title}</h3>
                                <span className={`badge text-xs font-medium flex items-center gap-1 flex-shrink-0 ${statusColors[booking.status]}`}>
                                  <StatusIcon status={booking.status} />
                                  {booking.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="w-3 h-3" />
                                  {formatDate(booking.checkIn)} &ndash; {formatDate(booking.checkOut)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {booking.guests.adults} {booking.guests.adults !== 1 ? t('dash.guests') : t('dash.guest')}
                                </span>
                                <span className="font-semibold text-gray-700">{formatPrice(booking.pricing.total)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Host properties tab */}
              {activeTab === 'properties' && user.role === 'host' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{t('dash.myProperties')}</h2>
                    <Link href="/dashboard/list-property" className="btn-primary inline-flex gap-2">
                      <PlusCircle className="w-4 h-4" />
                      {t('dash.addProperty')}
                    </Link>
                  </div>
                  {dataLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : properties.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                      <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-700 mb-2">{t('dash.noProperties')}</h3>
                      <p className="text-sm text-gray-500 mb-5">{t('dash.listFirst')}</p>
                      <Link href="/dashboard/list-property" className="btn-primary inline-flex">{t('dash.addFirstProperty')}</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties.map((property) => (
                        <Link key={property._id} href={`/listings/${property._id}`} className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
                          <div className="relative h-36">
                            {property.images[0] && (
                              <Image src={property.images[0].url} alt="" fill className="object-cover" unoptimized />
                            )}
                            <span className={`absolute top-3 right-3 badge text-xs ${property.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {property.isActive ? t('dash.active') : t('dash.inactive')}
                            </span>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1">{property.title}</h3>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{property.location.city}</span>
                              <span className="font-semibold text-primary-600">
                                {formatPrice(property.pricing.perNight)}{t('dash.perNight')}
                              </span>
                            </div>
                            {property.ratings.count > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{property.ratings.average.toFixed(1)} ({property.ratings.count})</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dash.savedProperties')}</h2>
                  {(user.wishlist?.length || 0) === 0 ? (
                    <div className="bg-white rounded-2xl shadow-card p-12 text-center">
                      <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-700 mb-2">{t('dash.noSaved')}</h3>
                      <p className="text-sm text-gray-500 mb-5">{t('dash.clickHeart')}</p>
                      <Link href="/listings" className="btn-primary inline-flex">{t('dash.exploreProperties')}</Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      {user.wishlist?.length} {t('dash.savedCount')}.
                      <Link href="/listings" className="text-primary-600 ltr:ml-1 rtl:mr-1 hover:underline">{t('dash.browseMore')}</Link>
                    </p>
                  )}
                </div>
              )}

              {/* Profile tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dash.profileSettings')}</h2>
                  <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
                    <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-bold text-xl sm:text-3xl">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 truncate">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`mt-2 badge text-xs inline-block ${user.role === 'host' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role === 'host' ? t('dash.roleHost') : t('dash.roleGuest')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: t('dash.fullName'), value: user.name },
                        { label: t('dash.email'), value: user.email },
                        { label: t('dash.phone'), value: user.phone || '\u2014' },
                        { label: t('dash.memberSince'), value: new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') },
                      ].map((field) => (
                        <div key={field.label} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-semibold text-gray-500 mb-1">{field.label}</p>
                          <p className="text-sm font-medium text-gray-900">{field.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button className="btn-primary flex items-center justify-center gap-2 text-sm sm:text-base">
                        <Settings className="w-4 h-4" />
                        {t('dash.editProfile')}
                      </button>
                      <button className="btn-outline text-sm sm:text-base">{t('dash.changePassword')}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
