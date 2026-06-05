import { type ImgHTMLAttributes } from 'react';

import { apiBaseUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

type ImageFormat = 'jpeg' | 'png' | 'webp';

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  fill?: boolean;
  unoptimized?: boolean;
};

function buildOptimizedImageUrl({
  src,
  width,
  height,
  quality,
  format,
}: Pick<ImageProps, 'src' | 'width' | 'height' | 'quality' | 'format'>) {
  const url = new URL('/api/images/optimize', apiBaseUrl);

  url.searchParams.set('src', src);

  if (width) {
    url.searchParams.set('width', String(width));
  }

  if (height) {
    url.searchParams.set('height', String(height));
  }

  if (quality) {
    url.searchParams.set('quality', String(quality));
  }

  if (format) {
    url.searchParams.set('format', format);
  }

  return url.toString();
}

function resolveOptimizableSrc(src: string) {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  if (!src.startsWith('/')) {
    return null;
  }

  const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');

  if (siteUrl) {
    return new URL(src, `${siteUrl}/`).toString();
  }

  if (typeof window !== 'undefined') {
    return new URL(src, window.location.origin).toString();
  }

  return null;
}

export function Image({
  src,
  alt,
  width,
  height,
  quality,
  format = 'webp',
  fill = false,
  unoptimized = false,
  className,
  loading,
  decoding,
  sizes,
  ...props
}: ImageProps) {
  const optimizableSrc = unoptimized ? null : resolveOptimizableSrc(src);
  const resolvedSrc = !optimizableSrc
    ? src
    : buildOptimizedImageUrl({
        src: optimizableSrc,
        width,
        height,
        quality,
        format,
      });

  return (
    <img
      {...props}
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={loading ?? 'lazy'}
      decoding={decoding ?? 'async'}
      sizes={sizes}
      className={cn(fill && 'absolute inset-0 size-full object-cover', className)}
    />
  );
}