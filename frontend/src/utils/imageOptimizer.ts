/**
 * Image URL Optimization Utility for KaizenQ
 * 
 * Automatically transforms Cloudinary and external CDN URLs to use
 * modern WebP/AVIF formats (f_auto) and compression (q_auto).
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
}

/**
 * Injects modern format & compression params into Cloudinary and Unsplash image URLs.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Cloudinary URLs
  if (trimmed.includes('cloudinary.com')) {
    // Avoid double transformation injection
    if (trimmed.includes('/upload/f_auto') || trimmed.includes('/upload/q_auto')) {
      return trimmed;
    }

    const { width, height, quality = 'auto', format = 'auto' } = options;
    const transforms: string[] = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push('c_limit');

    const transformString = transforms.join(',');

    if (trimmed.includes('/upload/')) {
      return trimmed.replace('/upload/', `/upload/${transformString}/`);
    }
    return trimmed;
  }

  // 2. Unsplash URLs
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('fm', 'webp');
      if (!parsed.searchParams.has('q')) {
        parsed.searchParams.set('q', String(options.quality || 80));
      }
      if (options.width && !parsed.searchParams.has('w')) {
        parsed.searchParams.set('w', String(options.width));
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  // 3. Local assets or other CDNs - return untouched
  return trimmed;
}
