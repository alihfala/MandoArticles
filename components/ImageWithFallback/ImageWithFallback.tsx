'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * A wrapper around Next.js Image component that handles errors by showing a fallback image
 */
export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "https://placehold.co/600x400.png?text=Image+not+found",
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative">
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onError={() => {
          setImgSrc(fallbackSrc);
          setHasError(true);
        }}
      />
      {hasError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-50 text-red-600 text-xs p-1 text-center">
          Error loading image from original URL
        </div>
      )}
    </div>
  );
} 