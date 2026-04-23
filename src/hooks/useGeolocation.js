import { useCallback, useRef } from 'react';

/**
 * Geolocation API ラッパーフック。
 * watchId を useRef で保持し、コンポーネントのライフサイクルとは独立して管理する。
 */
export function useGeolocation() {
  const watchIdRef = useRef(null);

  const getCurrentPosition = useCallback((onSuccess, onError) => {
    if (!navigator.geolocation) {
      onError?.({ code: -1, message: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }, []);

  const startWatching = useCallback((onSuccess, onError) => {
    if (!navigator.geolocation) return;
    stopWatching(); // 二重登録防止
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { getCurrentPosition, startWatching, stopWatching };
}
