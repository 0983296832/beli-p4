const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = fileName?.toLowerCase().slice(fileName.lastIndexOf('.'));
  return imageExtensions.includes(ext);
};

const isVideoFile = (fileName: string): boolean => {
  const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  const ext = fileName?.toLowerCase().slice(fileName.lastIndexOf('.'));
  return videoExtensions.includes(ext);
};

const downloadFileFromBlob = (response: any, filename: string) => {
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

function getFileTypeFromMime(mimeType: string): string {
  if (!mimeType || typeof mimeType !== 'string') return 'unknown';

  const typeMap: Record<string, string> = {
    // Images
    image: 'image',
    // Videos
    video: 'video',
    // Audios
    audio: 'audio',
    // PDF
    'application/pdf': 'pdf',
    // Word
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
    // Excel
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
    // PowerPoint
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'ppt',
    // Archives
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    // Text
    'text/plain': 'text'
  };

  // Check exact match first
  if (typeMap[mimeType]) return typeMap[mimeType];

  // Check type prefix (image/*, video/*, audio/*)
  const prefix: string = mimeType.split('/')[0];
  if (['image', 'video', 'audio'].includes(prefix)) return prefix;

  return 'unknown';
}

function getFileExtensionFromName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') return '';

  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) return '';

  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

export { isImageFile, isVideoFile, downloadFileFromBlob, getFileTypeFromMime, getFileExtensionFromName };
