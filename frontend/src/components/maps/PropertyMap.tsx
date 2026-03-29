'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
  isApproximate?: boolean;
}

const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export default function PropertyMap({ lat, lng, title, className = '', isApproximate = false }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!MAPS_KEY || !mapRef.current) {
      setError(true);
      setLoading(false);
      return;
    }

    // Load Google Maps script if not already loaded
    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initMap = () => {
      if (!mapRef.current || !(window as unknown as Record<string, unknown>).google) return;

      const google = (window as unknown as { google: typeof globalThis.google }).google;
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });

      if (isApproximate) {
        // Show a semi-transparent circle instead of a pin for approximate locations
        new google.maps.Circle({
          center: { lat, lng },
          radius: 500, // 500m radius
          map,
          fillColor: '#6366f1',
          fillOpacity: 0.15,
          strokeColor: '#6366f1',
          strokeOpacity: 0.4,
          strokeWeight: 2,
        });
        map.setZoom(14);
      } else {
        new google.maps.Marker({
          position: { lat, lng },
          map,
          title: title || 'Property Location',
        });
      }

      setLoading(false);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => {
        setError(true);
        setLoading(false);
      };
      document.head.appendChild(script);
    } else if ((window as unknown as Record<string, unknown>).google) {
      initMap();
    } else {
      script.addEventListener('load', initMap);
    }
  }, [lat, lng, title]);

  if (error || !MAPS_KEY) {
    // Fallback: static map-like display with coordinates
    return (
      <div className={`bg-gray-100 rounded-xl flex flex-col items-center justify-center p-6 ${className}`}>
        <MapPin className="w-8 h-8 text-primary-600 mb-2" />
        <p className="text-sm text-gray-500">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
    </div>
  );
}
