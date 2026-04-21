import { useState, useCallback } from 'react';
import { Skeleton } from '@components/ui/skeleton';
import { NO_IMAGE } from '@lib/ImageHelper';
import { appendQuery } from '@lib/JsHelper';

interface ImageWithRetryProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string; // ảnh fallback cuối cùng
  maxRetry?: number; // số lần thử lại tối đa
  showSkeleton?: boolean; // bật/tắt skeleton
}

export default function ImageWithRetry({
  src: initialSrc = '',
  fallback = NO_IMAGE,
  maxRetry = 3,
  showSkeleton = true,
  className = '',
  ...rest
}: ImageWithRetryProps) {
  const [src, setSrc] = useState(initialSrc);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleError = useCallback(() => {
    if (retry < maxRetry) {
      const newRetry = retry + 1;
      setRetry(newRetry);
      setSrc(appendQuery(initialSrc as string, `?retry=${newRetry}`)); // tránh cache
    } else if (fallback) {
      setSrc(fallback);
    }
  }, [retry, maxRetry, initialSrc, fallback]);

  const handleLoad = () => setLoading(false);

  return (
    <div className={`relative ${className}`}>
      {loading && showSkeleton && <Skeleton className='absolute inset-0 w-full h-full' />}
      <img
        src={src}
        onError={handleError}
        onLoad={handleLoad}
        className={`w-full h-full ${loading ? 'invisible' : 'visible'} ${className}`}
        {...rest}
      />
    </div>
  );
}
