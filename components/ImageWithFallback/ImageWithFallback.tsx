'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * A wrapper around Next.js Image component that handles errors by showing a fallback image
 * Enhanced for Next.js 15 compatibility
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "https://placehold.co/600x400.png?text=Image+not+found",
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize state after mount to avoid hydration mismatch
  useEffect(() => {
    setImgSrc(typeof src === 'string' ? src : fallbackSrc);
    setMounted(true);
  }, [src, fallbackSrc]);

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div 
        className="relative bg-gray-100" 
        style={{ width: props.width || '100%', height: props.height || '100%' }}
      />
    );
  }

  return (
    <div className="relative">
      {imgSrc && (
        <Image
          {...props}
          src={imgSrc}
          alt={alt}
          onError={() => {
            setImgSrc(fallbackSrc);
            setHasError(true);
          }}
        />
      )}
      {hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-50 text-red-600 text-xs p-1 text-center">
          Error loading image from original URL
        </div>
      )}
    </div>
  );
} 