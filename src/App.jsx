import { useState, useEffect, useRef, useCallback } from 'react';

import TopScreen from './screens/TopScreen';
import LoadingScreen from './screens/LoadingScreen';
import WalkingScreen from './screens/WalkingScreen';
import ArrivalScreen from './screens/ArrivalScreen';
import Toast from './components/Toast';
import ErrorModal from './components/ErrorModal';
import OfflineBanner from './components/OfflineBanner';

import { useGoogleMaps } from './hooks/useGoogleMaps';
import { useGeolocation } from './hooks/useGeolocation';
import {
  getStatistics,
  getConquestStamps,
  addConquestStamp,
  updateStatisticsFromSession,
  getVisitedHistory,
  addVisitedHistory,
  loadPreferences,
  savePreferences,
} from './hooks/useStorage';
import { genreKeywords, genreTypes } from './constants/genres';
import { isChainStore } from './constants/chains';
import {
  calculateSearchRadius,
  calculateSteps,
  calculateCalories,
  calculateProgress,
  haversineDistance,
  checkArrival,
  generateShareCard,
} from './utils/calc';

// ============================================
// Initial State
// ============================================
const INITIAL_SESSION = {
  startLocation: null,
  currentLocation: null,
  destination: null,
  route: null,
  distanceTraveled: 0,
  lastPosition: null,
  steps: 0,
  calories: 0,
  progressPercentage: 0,
  status: 'inactive',
};

export default function App() {
  // ---- Screen ----
  const [screen, setScreen] = useState('loading_init'); // 'setup'|'top'|'loading'|'walking'|'arrival'

  // ---- Preferences ----
  const [walkingMinutes, setWalkingMinutes] = useState(15);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [storeTypes, setStoreTypes] = useState({ chain: true, individual: true });
  const [priceLevels, setPriceLevels] = useState({ cheap: true, moderate: true, expensive: true });

  // ---- Walking session (mutable ref for geolocation callbacks) ----
  const sessionRef = useRef({ ...INITIAL_SESSION });
  const [sessionSnapshot, setSessionSnapshot] = useState({ ...INITIAL_SESSION });

  // ---- Statistics / Stamps ----
  const [statistics, setStatistics] = useState({ totalDistance: 0, totalSteps: 0, totalCalories: 0, totalSessions: 0 });
  const [stamps, setStamps] = useState({ chains: [], totalUnique: 0 });

  // ---- Loading status ----
  const [loadingStatus, setLoadingStatus] = useState('現在地を取得中...');
  const [loadingSubstatus, setLoadingSubstatus] = useState('少々お待ちください');

  // ---- Share card ----
  const [shareCardUrl, setShareCardUrl] = useState('');

  // ---- Toast ----
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'error' });
  const toastTimerRef = useRef(null);

  // ---- Error Modal ----
  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  // ---- Offline ----
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // ---- Hooks ----
  const mapControls = useGoogleMaps();
  const geo = useGeolocation();

  // ============================================
  // Initialization
  // ============================================
  useEffect(() => {
    // セキュリティ: 旧バージョンで localStorage に保存されたAPIキーを削除
    localStorage.removeItem('apiKey');

    const prefs = loadPreferences();
    setWalkingMinutes(prefs.walkingMinutes);
    setSelectedGenre(prefs.selectedGenre);
    setStoreTypes(prefs.storeTypes);
    setPriceLevels(prefs.priceLevels);

    // オフライン検知
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    // サーバーからAPIキーを取得
    fetchServerApiKey();

    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchServerApiKey() {
    try {
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error('config fetch failed: ' + res.status);
      const data = await res.json();
      if (data.apiKey) {
        loadMapsSDK(data.apiKey);
        return;
      }
      throw new Error('apiKey not found in response');
    } catch (e) {
      console.error('Could not fetch API key from server:', e);
      showErrorModal(
        'APIキー取得エラー',
        'サーバーからAPIキーを取得できませんでした。\nVercelの環境変数 GOOGLE_MAPS_API_KEY が設定されているか確認してください。'
      );
      // エラーモーダルを閉じた後にトップ画面を表示（地図なしで使えるものを表示）
      setScreen('top');
    }
  }

  function loadMapsSDK(apiKey) {
    mapControls.loadSDK(
      apiKey,
      () => {
        // SDK ロード完了 → top へ
        refreshStatistics();
        setScreen('top');
      },
      () => {
        showErrorModal(
          'Google Maps 読み込みエラー',
          'Google Maps APIの読み込みに失敗しました。管理者にお問い合わせください。'
        );
        setScreen('top');
      }
    );
  }

  function refreshStatistics() {
    setStatistics(getStatistics());
    setStamps(getConquestStamps());
  }



  // ============================================
  // Top Screen
  // ============================================
  function handleSavePreferences(minutes, genre, sTypes, pLevels) {
    savePreferences(minutes, genre, sTypes, pLevels);
  }

  // ============================================
  // Adventure Flow
  // ============================================
  function startAdventure() {
    if (!navigator.geolocation) {
      showErrorModal('位置情報非対応', 'このブラウザは位置情報をサポートしていません。');
      return;
    }

    setScreen('loading');
    setLoadingStatus('現在地を取得中...');
    setLoadingSubstatus('高精度位置情報を使用しています');

    geo.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        sessionRef.current = {
          ...INITIAL_SESSION,
          startLocation: loc,
          currentLocation: loc,
        };
        searchChainStores(loc);
      },
      (error) => handleLocationError(error)
    );
  }

  async function searchChainStores(location) {
    const radius = calculateSearchRadius(walkingMinutes);
    const type = genreTypes[selectedGenre] || 'restaurant';
    const keyword = genreKeywords[selectedGenre] || '';

    setLoadingStatus('グルメを検索中...');
    setLoadingSubstatus(`半径 ${radius.toLocaleString()}m を探索`);

    const params = new URLSearchParams({ lat: location.lat, lng: location.lng, radius, type });
    if (keyword) params.set('keyword', keyword);

    try {
      const res = await fetch('/api/places?' + params.toString());
      if (!res.ok) throw new Error('places fetch failed: ' + res.status);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        // 価格帯とチェーン店/個人経営によるフィルタリング
        let filteredStores = data.results.filter(p => {
          // 営業中フィルタ: open_now が明示的に false の店舗は除外（情報なしは許可）
          if (p.opening_hours?.open_now === false) return false;

          // 価格帯フィルタ
          const level = p.price_level;
          let passPrice = false;
          if (priceLevels.cheap && priceLevels.moderate && priceLevels.expensive) passPrice = true;
          else if (level === undefined || level === 0) passPrice = true; // 不明や無料は常に許可
          else if (level === 1 && priceLevels.cheap) passPrice = true;
          else if (level === 2 && priceLevels.moderate) passPrice = true;
          else if (level >= 3 && priceLevels.expensive) passPrice = true;
          if (!passPrice) return false;

          // 経営形態フィルタ
          const isChain = isChainStore(p);
          let passType = false;
          if (storeTypes.chain && storeTypes.individual) passType = true;
          else if (storeTypes.chain && isChain) passType = true;
          else if (storeTypes.individual && !isChain) passType = true;
          if (!passType) return false;

          return true;
        });

        // 訪問済みを除外 (Issue #4: もう行ったお店は出さない)
        const visitedHistory = getVisitedHistory();
        filteredStores = filteredStores.filter((p) => !visitedHistory.includes(p.place_id));

        if (filteredStores.length === 0) {
          showErrorModal(
            'グルメが見つかりませんでした',
            '指定した条件の未訪問店舗が見つかりませんでした。検索範囲を広げるか、条件を変更してみてください。'
          );
          setScreen('top');
          return;
        }

        // 距離計算
        const storesWithDist = filteredStores.map((store) => {
          const storeLat = store.geometry.location.lat;
          const storeLng = store.geometry.location.lng;
          const straightDist = haversineDistance(location.lat, location.lng, storeLat, storeLng);
          return { store, dist: straightDist };
        });

        // 指定した距離の範囲内で絞り込み
        const storesInRange = storesWithDist.filter(s => s.dist <= radius);
        const validStores = storesInRange.length > 0 ? storesInRange : storesWithDist;

        // 最も遠い順にソート (Issue #4: 遠い順にソート)
        validStores.sort((a, b) => b.dist - a.dist);

        // ベスト3の中でランダムに呼び出す (Issue #4)
        const topCandidates = validStores.slice(0, Math.min(3, validStores.length));
        const dest = topCandidates[Math.floor(Math.random() * topCandidates.length)].store;

        sessionRef.current.destination = {
          placeId: dest.place_id,
          name: dest.name,
          address: dest.vicinity || '',
          location: {
            lat: dest.geometry.location.lat,
            lng: dest.geometry.location.lng,
          },
        };

        addVisitedHistory(dest.place_id);
        await calculateRoute(location, sessionRef.current.destination.location);
      } else if (data.status === 'ZERO_RESULTS') {
        showErrorModal(
          'グルメが見つかりませんでした',
          '検索範囲を広げるか、ジャンルフィルターを変更してみてください。'
        );
        setScreen('top');
      } else {
        handleAPIError(data.status || 'UNKNOWN_ERROR', 'Places');
      }
    } catch (err) {
      console.error('Places proxy error:', err);
      showErrorModal('検索エラー', '店舗の検索に失敗しました。通信環境を確認してください。');
      setScreen('top');
    }
  }

  async function calculateRoute(origin, destination) {
    const destName = sessionRef.current.destination?.name ?? '';
    setLoadingStatus('ルートを計算中...');
    setLoadingSubstatus(`${destName} への道を探しています`);

    const params = new URLSearchParams({
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      dest_lat: destination.lat,
      dest_lng: destination.lng,
    });

    try {
      const res = await fetch('/api/directions?' + params.toString());
      if (!res.ok) throw new Error('directions fetch failed: ' + res.status);
      const data = await res.json();

      if (data.status === 'OK' && Array.isArray(data.routes) && data.routes.length > 0) {
        const leg = data.routes[0].legs[0];
        sessionRef.current.route = {
          distance: leg.distance.value,
          duration: leg.duration.value,
          encodedPolyline: data.routes[0].overview_polyline.points,
        };
        startWalking();
      } else {
        handleAPIError(data.status || 'UNKNOWN_ERROR', 'Directions');
      }
    } catch (err) {
      console.error('Directions proxy error:', err);
      showErrorModal('ルートエラー', 'ルートの取得に失敗しました。通信環境を確認してください。');
      setScreen('top');
    }
  }

  // ============================================
  // Walking Screen
  // ============================================
  function startWalking() {
    const s = sessionRef.current;
    s.distanceTraveled = 0;
    s.lastPosition = { ...s.startLocation, timestamp: Date.now() };
    s.steps = 0;
    s.calories = 0;
    s.progressPercentage = 0;
    s.status = 'active';

    setSessionSnapshot({ ...s });
    setScreen('walking');

    // 位置情報ウォッチ開始
    geo.startWatching(onPositionUpdate, onPositionError);
  }

  const onPositionUpdate = useCallback((position) => {
    const newLat = position.coords.latitude;
    const newLng = position.coords.longitude;
    const s = sessionRef.current;

    if (s.lastPosition) {
      const accuracy = position.coords.accuracy || 10;
      if (accuracy > 50) return;

      if (position.coords.speed !== null && position.coords.speed < 0.2) return;

      const moved = haversineDistance(
        s.lastPosition.lat,
        s.lastPosition.lng,
        newLat,
        newLng
      );
      const elapsedSec = (position.timestamp - s.lastPosition.timestamp) / 1000;

      if (elapsedSec > 0 && moved / elapsedSec > 3.5) {
        s.lastPosition = { lat: newLat, lng: newLng, timestamp: position.timestamp };
        return;
      }

      if (moved > 4) {
        s.distanceTraveled += moved;
        s.lastPosition = { lat: newLat, lng: newLng, timestamp: position.timestamp };
      }
    }

    s.currentLocation = { lat: newLat, lng: newLng };
    s.steps = calculateSteps(s.distanceTraveled);
    s.calories = calculateCalories(s.distanceTraveled);
    s.progressPercentage = calculateProgress(s.distanceTraveled, s.route?.distance ?? 1);

    // マーカー更新 (imperative)
    mapControls.updateUserMarker({ lat: newLat, lng: newLng });

    // React state 更新
    setSessionSnapshot({ ...s });

    // 到着判定
    if (
      s.destination &&
      checkArrival(newLat, newLng, s.destination.location.lat, s.destination.location.lng)
    ) {
      handleArrival();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function onPositionError(error) {
    console.error('Position tracking error:', error);
    showToast('位置情報エラー', '位置情報の更新に失敗しました。最後の位置を使用しています。', 'warning');
  }

  function stopTracking() {
    geo.stopWatching();
    mapControls.clearRoute();
  }

  function handleReroll() {
    if (!confirm('別の店に引き直しますか？')) return;

    stopTracking();
    updateStatisticsFromSession(sessionRef.current);
    sessionRef.current.status = 'rerolled';

    const loc = sessionRef.current.currentLocation || sessionRef.current.startLocation;
    sessionRef.current = {
      ...INITIAL_SESSION,
      startLocation: loc,
      currentLocation: loc,
    };

    setScreen('loading');
    searchChainStores(loc);
  }

  function handleQuit() {
    if (!confirm('冒険をやめてトップに戻りますか？')) return;

    stopTracking();
    updateStatisticsFromSession(sessionRef.current);
    sessionRef.current.status = 'inactive';

    refreshStatistics();
    setScreen('top');
  }

  // ============================================
  // Arrival Screen
  // ============================================
  function handleArrival() {
    geo.stopWatching();
    const s = sessionRef.current;
    s.status = 'completed';

    updateStatisticsFromSession(s);
    const updatedStamps = addConquestStamp(s.destination.name);

    // シェアカード生成
    const cardUrl = generateShareCard({
      restaurantName: s.destination.name,
      distance: (s.distanceTraveled / 1000).toFixed(1),
      steps: s.steps.toLocaleString(),
      calories: s.calories,
    });

    setShareCardUrl(cardUrl);
    setStamps({ ...updatedStamps });
    setSessionSnapshot({ ...s });
    refreshStatistics();
    setScreen('arrival');
  }

  function handleShareToX() {
    const s = sessionRef.current;
    const text =
      `${s.destination.name}まで` +
      `${(s.distanceTraveled / 1000).toFixed(1)}km歩きました！\n` +
      `${s.steps.toLocaleString()}歩 / ${s.calories}kcal\n` +
      `#彷徨える胃袋 #今日のチェーン旅`;

    if (!confirm(`以下の内容をXでシェアします:\n\n${text}\n\nシェアしますか？`)) return;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420,noopener,noreferrer');
  }

  function handleRetry() {
    refreshStatistics();
    setScreen('top');
  }

  // ============================================
  // Toast
  // ============================================
  function showToast(title, message, type = 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, title, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  }

  // ============================================
  // Error Modal
  // ============================================
  function showErrorModal(title, message) {
    setErrorModal({ visible: true, title, message });
  }

  function closeErrorModal() {
    setErrorModal((prev) => ({ ...prev, visible: false }));
  }

  // ============================================
  // Error Handlers
  // ============================================
  function handleLocationError(error) {
    let title, message;
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        title = '位置情報の許可が必要です';
        message = 'このアプリは現在地を使用して近くのグルメを探します。ブラウザの設定で位置情報を許可してください。';
        break;
      case 2: // POSITION_UNAVAILABLE
        title = '位置情報を取得できません';
        message = '現在地の取得に失敗しました。電波状況の良い場所でお試しください。';
        break;
      case 3: // TIMEOUT
        title = '位置情報の取得がタイムアウトしました';
        message = 'もう一度お試しください。';
        break;
      default:
        title = '位置情報エラー';
        message = '不明なエラーが発生しました。';
    }
    showErrorModal(title, message);
    setScreen('top');
  }

  function handleAPIError(status, apiName) {
    const messages = {
      ZERO_RESULTS: 'ルートが見つかりませんでした。',
      OVER_QUERY_LIMIT: 'APIの利用制限に達しました。しばらく待ってからお試しください。',
      REQUEST_DENIED: 'APIリクエストが拒否されました。サーバー設定を確認してください。',
      UNKNOWN_ERROR: 'エラーが発生しました。',
    };
    const msg = messages[status] || messages.UNKNOWN_ERROR;
    showErrorModal(`${apiName} エラー`, msg + '\nもう一度お試しください。');
    setScreen('top');
  }

  // ============================================
  // Render
  // ============================================
  if (screen === 'loading_init') {
    return (
      <LoadingScreen status="アプリを起動中..." substatus="少々お待ちください" />
    );
  }

  return (
    <>
      <OfflineBanner visible={isOffline} />

      {screen === 'top' && (
        <TopScreen
          walkingMinutes={walkingMinutes}
          setWalkingMinutes={setWalkingMinutes}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          storeTypes={storeTypes}
          setStoreTypes={setStoreTypes}
          priceLevels={priceLevels}
          setPriceLevels={setPriceLevels}
          statistics={statistics}
          stamps={stamps}
          onStart={startAdventure}
          isOffline={isOffline}
          onSavePreferences={handleSavePreferences}
        />
      )}

      {screen === 'loading' && (
        <LoadingScreen status={loadingStatus} substatus={loadingSubstatus} />
      )}

      {screen === 'walking' && (
        <WalkingScreen
          session={sessionSnapshot}
          onQuit={handleQuit}
          onReroll={handleReroll}
          onManualArrival={handleArrival}
          mapControls={mapControls}
        />
      )}

      {screen === 'arrival' && (
        <ArrivalScreen
          session={sessionSnapshot}
          stamps={stamps}
          shareCardUrl={shareCardUrl}
          onShare={handleShareToX}
          onRetry={handleRetry}
        />
      )}

      <Toast toast={toast} />
      <ErrorModal modal={errorModal} onClose={closeErrorModal} />
    </>
  );
}
