import { useEffect, useState } from 'react';

export const useCheckVersion = (interval = 60000, trigger?: () => void) => {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(localStorage.getItem('app_version'));

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch('/version.json?_t=' + Date.now(), {
          cache: 'no-store' // tránh bị cache CDN/browser
        });
        const data = await res.json();
        const newVersion = data.version;

        console.log(
          '%c[VersionCheck]',
          'color: orange; font-weight: bold;',
          'current:',
          currentVersion,
          '→ new:',
          newVersion
        );

        if (!currentVersion) {
          // lần đầu load
          setCurrentVersion(newVersion);
          localStorage.setItem('app_version', newVersion);
        } else if (currentVersion !== newVersion) {
          console.log('%c⚡ New version detected!', 'color: limegreen;');
          setHasNewVersion(true);
          trigger?.();
        } else {
          console.log('%c✅ No new version.', 'color: gray;');
        }
      } catch (err) {
        console.warn('❌ Check version failed', err);
      }
    };

    checkVersion();
    const timer = setInterval(checkVersion, interval);
    return () => clearInterval(timer);
  }, [currentVersion, interval]);

  // 🧹 Khi người dùng tải lại xong, cập nhật lại version
  const acknowledgeUpdate = async () => {
    try {
      const res = await fetch('/version.json?_t=' + Date.now());
      const data = await res.json();
      const latest = data.version;
      localStorage.setItem('app_version', latest);
    } catch (e) {
      console.error('Failed to update version info');
    }
    setHasNewVersion(false);
  };

  const genVersionTag = (ts: string | number | null) => {
    const date = new Date(Number(ts));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    // ép múi giờ Asia/Ho_Chi_Minh
    const time = date
      .toLocaleString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour12: false
      })
      .split(', ')[1];

    const [hh, mi] = time.split(':');
    return `v${yyyy}.${mm}.${dd}.${hh}.${mi}`;
  };

  return { hasNewVersion, acknowledgeUpdate, versionTag: genVersionTag(currentVersion) };
};
