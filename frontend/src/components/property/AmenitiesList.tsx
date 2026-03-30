import { AmenityType } from '@/types';
import { getAmenityLabel, getAmenityIcon } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface AmenitiesListProps {
  amenities: AmenityType[];
  showAll?: boolean;
}

export default function AmenitiesList({ amenities, showAll = false }: AmenitiesListProps) {
  const { language } = useLanguage();
  const display = showAll ? amenities : amenities.slice(0, 10);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {display.map((amenity) => (
        <div
          key={amenity}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          <span className="text-xl">{getAmenityIcon(amenity)}</span>
          <span className="text-sm font-medium text-gray-700">{getAmenityLabel(amenity, language)}</span>
        </div>
      ))}
    </div>
  );
}
