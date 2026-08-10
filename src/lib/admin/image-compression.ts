const COMPRESSIBLE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_UPLOAD_IMAGE_DIMENSION = 2400;
export const UPLOAD_IMAGE_QUALITY = 0.82;

/**
 * Compress raster uploads in the browser before they reach Storage.
 * SVG and GIF are intentionally left untouched because converting them can
 * remove vector scalability or animation. Any browser/canvas failure falls
 * back to the original File so the CMS upload flow remains usable.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type.toLowerCase())) return file;
  if (typeof window === 'undefined' || typeof document === 'undefined') return file;

  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = document.createElement('img');
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('Image could not be decoded.'));
      element.src = sourceUrl;
    });

    const scale = Math.min(
      1,
      MAX_UPLOAD_IMAGE_DIMENSION / image.naturalWidth,
      MAX_UPLOAD_IMAGE_DIMENSION / image.naturalHeight,
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return file;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', UPLOAD_IMAGE_QUALITY);
    });
    if (!blob) return file;

    // A small/simple source can be more efficient in its original format.
    // Keep it in that case, but always use WebP when dimensions were reduced.
    if (blob.size >= file.size && scale === 1) return file;

    const basename = file.name.replace(/\.[^/.]+$/, '') || 'image';
    return new File([blob], `${basename}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
