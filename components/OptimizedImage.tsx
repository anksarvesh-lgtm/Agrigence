
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // If true, eager load and high fetch priority
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Next-gen format support (WebP/AVIF via CDN parameters or <picture>)
 * - Lazy loading by default (loading="lazy")
 * - Async decoding (decoding="async")
 * - Responsive sizing (via Unsplash/Picsum params if applicable)
 * - Layout shift prevention (via width/height or aspect-ratio)
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
  aspectRatio,
  ...props
}) => {
  // Check if it's an Unsplash URL to apply automatic optimization parameters
  const isUnsplash = src.includes('unsplash.com');
  const isPicsum = src.includes('picsum.photos');

  let optimizedSrc = src;
  let webpSrcSet = '';
  let srcSet = '';

  if (isUnsplash) {
    // Ensure auto=format and q=80 are present for Unsplash
    const url = new URL(src);
    url.searchParams.set('auto', 'format,compress');
    if (!url.searchParams.has('q')) url.searchParams.set('q', '80');
    optimizedSrc = url.toString();

    // Generate a basic srcset for Unsplash
    const widths = [320, 640, 1024, 1600];
    srcSet = widths
      .map((w) => {
        const u = new URL(optimizedSrc);
        u.searchParams.set('w', w.toString());
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
      
    webpSrcSet = widths
      .map((w) => {
        const u = new URL(optimizedSrc);
        u.searchParams.set('w', w.toString());
        u.searchParams.set('fm', 'webp');
        return `${u.toString()} ${w}w`;
      })
      .join(', ');
  } else if (isPicsum) {
    // Picsum doesn't have complex params like Unsplash but we can still use it
    // For real production apps, you'd use a dedicated Image CDN (Cloudinary, Imgix, etc.)
  } else {
    // For local or other images, we can try to append .webp if possible, or just use the src
    // In a real app, a backend service would generate the webp
    if (src.endsWith('.jpg') || src.endsWith('.png') || src.endsWith('.jpeg')) {
      const basePath = src.substring(0, src.lastIndexOf('.'));
      webpSrcSet = `${basePath}.webp`;
    }
  }

  const styles: React.CSSProperties = {
    aspectRatio: aspectRatio,
    objectFit: 'cover',
    ...props.style,
  };

  return (
    <picture>
      {webpSrcSet && <source srcSet={webpSrcSet} type="image/webp" sizes={srcSet ? props.sizes || '(max-width: 768px) 100vw, 50vw' : undefined} />}
      <img
        src={optimizedSrc}
        alt={alt}
        title={props.title || alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
        srcSet={srcSet}
        sizes={srcSet ? props.sizes || '(max-width: 768px) 100vw, 50vw' : undefined}
        width={width}
        height={height}
        style={styles}
        referrerPolicy="no-referrer"
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
