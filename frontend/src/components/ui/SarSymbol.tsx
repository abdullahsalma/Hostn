'use client';

import Image from 'next/image';

interface SarSymbolProps {
  className?: string;
  /** Height in pixels — defaults to matching surrounding text via 1em */
  size?: number;
}

export default function SarSymbol({ className = '', size }: SarSymbolProps) {
  return (
    <Image
      src="/sar_symbol.svg"
      alt="SAR"
      width={size || 16}
      height={size || 16}
      className={`inline-block ${size ? '' : 'h-[1em] w-auto'} ${className}`}
      unoptimized
    />
  );
}
