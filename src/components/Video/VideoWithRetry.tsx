import React, { useRef, useState, useEffect } from 'react';

interface AutoRetryVideoProps {
  src: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  fallbackSrc?: string;
  controls?: boolean;
  autoPlay?: boolean;
  playsInline?: boolean;
  muted?: boolean;
  loop?: boolean;
}

const AutoRetryVideo: React.FC<AutoRetryVideoProps> = ({
  src,
  className,
  maxRetries = 3,
  retryDelay = 2000,
  fallbackSrc,
  controls = true,
  autoPlay = false,
  playsInline = false,
  muted = false,
  loop = false,
  ...rest
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    if (retryCount < maxRetries) {
      console.warn(`📼 Video lỗi, thử lại lần ${retryCount + 1}/${maxRetries}...`);
      setTimeout(() => {
        if (videoRef.current) {
          const newSrc = `${src}${src.includes('?') ? '&' : '?'}_retry=${Date.now()}`;
          videoRef.current.src = newSrc;
          videoRef.current.load();
          setRetryCount((n) => n + 1);
        }
      }, retryDelay);
    } else if (fallbackSrc) {
      console.warn('⚠️ Retry thất bại, chuyển sang fallback video.');
      if (videoRef.current) {
        videoRef.current.src = fallbackSrc;
        videoRef.current.load();
      }
    } else {
      console.error('❌ Video lỗi nhiều lần, không còn fallback.');
    }
  };

  // Reset retry khi đổi src
  useEffect(() => {
    setRetryCount(0);
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      onError={handleError}
      preload='auto'
      playsInline={playsInline}
      {...rest}
    />
  );
};

export default AutoRetryVideo;
