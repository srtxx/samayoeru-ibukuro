import { useRef, useCallback } from 'react';
import { darkModeStyles } from '../constants/mapStyles';

/**
 * Google Maps SDK のローダーとマップインスタンス管理フック。
 * マップは React の管理外（imperative）で動かすため useRef で保持する。
 */
export function useGoogleMaps() {
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  /** Maps JavaScript SDK をロードする（既にロード済みなら何もしない） */
  const loadSDK = useCallback((apiKey, onLoad, onError) => {
    if (document.getElementById('google-maps-script')) {
      // 既にスクリプトタグが存在する場合
      if (window.google?.maps) {
        onLoad?.();
      } else {
        // スクリプト読み込み中 — コールバックを上書き
        window.onMapsLoaded = onLoad;
      }
      return;
    }

    window.onMapsLoaded = () => {
      onLoad?.();
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=onMapsLoaded`;
    script.async = true;
    script.defer = true;
    script.onerror = () => onError?.();
    document.head.appendChild(script);
  }, []);

  /** マップを初期化または再センタリングする */
  const initMap = useCallback((containerEl, center) => {
    if (!window.google?.maps || !containerEl) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(15);
    } else {
      mapInstanceRef.current = new window.google.maps.Map(containerEl, {
        center,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: darkModeStyles,
      });
    }
  }, []);

  /** ルートポリラインを描画する */
  const drawRoute = useCallback((encodedPolyline) => {
    if (!window.google?.maps || !mapInstanceRef.current) return;

    // 既存ポリラインを削除
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (!encodedPolyline) return;

    const path = window.google.maps.geometry.encoding.decodePath(encodedPolyline);
    routePolylineRef.current = new window.google.maps.Polyline({
      path,
      strokeColor: '#BA7517',
      strokeWeight: 5,
      strokeOpacity: 0.8,
      map: mapInstanceRef.current,
    });
  }, []);

  /** ユーザーマーカーと目的地マーカーを配置する */
  const placeMarkers = useCallback((userPos, destPos) => {
    if (!window.google?.maps || !mapInstanceRef.current) return;

    // 既存マーカーを削除
    if (userMarkerRef.current) { userMarkerRef.current.setMap(null); userMarkerRef.current = null; }
    if (destMarkerRef.current) { destMarkerRef.current.setMap(null); destMarkerRef.current = null; }

    userMarkerRef.current = new window.google.maps.Marker({
      position: userPos,
      map: mapInstanceRef.current,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      },
      zIndex: 10,
    });

    destMarkerRef.current = new window.google.maps.Marker({
      position: destPos,
      map: mapInstanceRef.current,
      label: { text: '🍜', fontSize: '24px' },
    });
  }, []);

  /** ユーザーマーカーの位置を更新する */
  const updateUserMarker = useCallback((pos) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition(pos);
    }
  }, []);

  /** ポリラインを地図から削除する */
  const clearRoute = useCallback(() => {
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }
  }, []);

  return {
    loadSDK,
    initMap,
    drawRoute,
    placeMarkers,
    updateUserMarker,
    clearRoute,
  };
}
