import { useEffect, useState } from 'react';

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export function useDevice() {
  const [device, setDevice] = useState<DeviceType>('desktop');

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent;

    if (/Mobi|iPhone|Android/i.test(ua)) {
      setDevice('mobile');
    } else if (/iPad|Tablet/i.test(ua)) {
      setDevice('tablet');
    } else {
      setDevice('desktop');
    }
  }, []);

  return {
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
    device
  };
}
