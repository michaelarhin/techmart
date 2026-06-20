/**
 * Compresses a chosen image and returns BOTH a Blob (for Storage upload) and a
 * data URL (used as an instant preview and as a fallback if Storage is offline).
 */
export const compressImage = (
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<{ blob: Blob; dataUrl: string }> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That image could not be loaded.'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Image processing is not supported here.'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        canvas.toBlob(
          (blob) => resolve({ blob: blob ?? dataUrlToBlob(dataUrl), dataUrl }),
          'image/jpeg',
          quality
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

const dataUrlToBlob = (dataUrl: string): Blob => {
  const [meta, b64] = dataUrl.split(',');
  const mime = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
};

/** Convenience wrapper that returns just the compressed data URL. */
export const fileToCompressedDataUrl = async (file: File, maxDim = 1280, quality = 0.82): Promise<string> => {
  const { dataUrl } = await compressImage(file, maxDim, quality);
  return dataUrl;
};
