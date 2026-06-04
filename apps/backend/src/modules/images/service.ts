import { config } from '@backend/core/config';

import { type ImageFormatValue, type ImageOptimizationQuery } from './model';

const maxImagePixels = 4096 * 4096;

export class ImageOptimizationError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ImageOptimizationError';
  }
}

export class ImagesService {
  async optimize(query: ImageOptimizationQuery) {
    const sourceUrl = this.validateSourceUrl(query.src);
    const response = await fetch(sourceUrl, {
      headers: {
        accept: 'image/*',
      },
    }).catch(() => {
      throw new ImageOptimizationError('Could not download the requested image.', 502);
    });

    if (!response.ok) {
      throw new ImageOptimizationError('Could not download the requested image.', 502);
    }

    const sourceContentType = response.headers.get('content-type') ?? '';

    if (!sourceContentType.startsWith('image/')) {
      throw new ImageOptimizationError('The requested resource is not an image.', 400);
    }

    const sourceBytes = new Uint8Array(await response.arrayBuffer());
    const image = new Bun.Image(sourceBytes, {
      maxPixels: maxImagePixels,
      autoOrient: true,
    });

    const pipeline = this.applyResize(image, query);
    const output = await this.applyFormat(pipeline, query.format, query.quality).blob();

    return new Response(output, {
      headers: {
        'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  }

  private validateSourceUrl(value: string) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(value);
    } catch {
      throw new ImageOptimizationError('Provide a valid absolute image URL.', 400);
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new ImageOptimizationError('Only http and https image URLs are supported.', 400);
    }

    if (
      config.imageAllowedHosts.length > 0 &&
      !config.imageAllowedHosts.includes(parsedUrl.hostname)
    ) {
      throw new ImageOptimizationError('This image host is not allowed.', 403);
    }

    return parsedUrl.toString();
  }

  private applyResize(image: Bun.Image, query: ImageOptimizationQuery) {
    if (!query.width && !query.height) {
      return image;
    }

    return image.resize(query.width ?? 0, query.height ?? 0, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  private applyFormat(image: Bun.Image, format: ImageFormatValue | undefined, quality: number | undefined) {
    switch (format ?? 'webp') {
      case 'jpeg':
        return image.jpeg({ quality: quality ?? 80, progressive: true });
      case 'png':
        return image.png({ compressionLevel: 6 });
      case 'webp':
      default:
        return image.webp({ quality: quality ?? 80 });
    }
  }
}