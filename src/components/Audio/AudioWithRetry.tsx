import React, { useRef, useState, useEffect } from 'react';

interface AutoRetryAudioProps {
  src: string;
  className?: string;
  maxRetries?: number;
  retryDelay?: number; // milliseconds
}

const AutoRetryAudio: React.FC<AutoRetryAudioProps> = ({
  src,
  className,
  maxRetries = 3,
  retryDelay = 2000,
  ...rest
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = () => {
    if (retryCount < maxRetries) {
      console.warn(`🔁 Audio lỗi, thử lại lần ${retryCount + 1}/${maxRetries}...`);
      setTimeout(() => {
        if (audioRef.current) {
          // tránh lấy cache lỗi bằng query ngẫu nhiên
          const newSrc = `${src}${src.includes('?') ? '&' : '?'}_retry=${Date.now()}`;
          audioRef.current.src = newSrc;
          audioRef.current.load();
          setRetryCount((n) => n + 1);
        }
      }, retryDelay);
    } else {
      console.error('❌ Audio lỗi nhiều lần, dừng retry.');
    }
  };

  // Reset retry counter khi đổi src
  useEffect(() => {
    setRetryCount(0);
  }, [src]);

  return (
    <audio ref={audioRef} src={src} controls className={className} onError={handleError} preload='auto' {...rest} />
  );
};

export default AutoRetryAudio;
