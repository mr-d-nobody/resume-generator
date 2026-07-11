export const PHOTO_LIMITS = Object.freeze({
  maxBytes: 5 * 1024 * 1024,
  maxSourceDimension: 12000,
  maxSourcePixels: 40_000_000,
  outputDimension: 800,
  outputBytesTarget: 450 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

export function validatePhotoFileMeta({ type, size, width, height }) {
  if (!PHOTO_LIMITS.allowedTypes.includes(type)) return 'Use a JPEG, PNG, or WebP image.';
  if (!Number.isFinite(size) || size <= 0) return 'The selected image is empty.';
  if (size > PHOTO_LIMITS.maxBytes) return 'Profile photos must be 5MB or smaller.';
  if (width !== undefined && height !== undefined) {
    if (width < 32 || height < 32) return 'Profile photos must be at least 32 × 32 pixels.';
    if (width > PHOTO_LIMITS.maxSourceDimension || height > PHOTO_LIMITS.maxSourceDimension || width * height > PHOTO_LIMITS.maxSourcePixels) {
      return 'The image dimensions are too large to process safely.';
    }
  }
  return '';
}

function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The selected file could not be decoded as an image.'));
    };
    image.src = url;
  });
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('Could not resize the selected image.')),
    type,
    quality,
  ));
}

export async function prepareProfilePhoto(file) {
  const metadataError = validatePhotoFileMeta(file || {});
  if (metadataError) throw new Error(metadataError);

  const image = await loadImage(file);
  const dimensionError = validatePhotoFileMeta({ type: file.type, size: file.size, width: image.naturalWidth, height: image.naturalHeight });
  if (dimensionError) throw new Error(dimensionError);

  const scale = Math.min(1, PHOTO_LIMITS.outputDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.84;
  let blob = await canvasBlob(canvas, 'image/jpeg', quality);
  while (blob.size > PHOTO_LIMITS.outputBytesTarget && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasBlob(canvas, 'image/jpeg', quality);
  }
  if (blob.size > PHOTO_LIMITS.outputBytesTarget * 1.5) throw new Error('The resized photo is still too large. Choose a simpler image.');
  return readAsDataUrl(blob);
}
