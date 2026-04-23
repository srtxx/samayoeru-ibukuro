import { useEffect, useRef } from 'react';
import { formatDistance } from '../utils/calc';

export default function WalkingScreen({
  session,
  onQuit,
  onReroll,
  onManualArrival,
  mapControls,
}) {
  const mapContainerRef = useRef(null);

  // マップの初期化・ルート描画はセッションが変わるたびに行う
  useEffect(() => {
    if (!session.destination || !session.startLocation) return;
    if (!window.google?.maps) return;

    mapControls.initMap(mapContainerRef.current, session.startLocation);
    mapControls.drawRoute(session.route?.encodedPolyline);
    mapControls.placeMarkers(session.startLocation, session.destination.location);
  }, [session.destination]); // eslint-disable-line react-hooks/exhaustive-deps

  // 現在地マーカーの更新
  useEffect(() => {
    if (!session.currentLocation) return;
    mapControls.updateUserMarker(session.currentLocation);
  }, [session.currentLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = Math.round(session.progressPercentage);
  const remaining = session.route
    ? Math.max(0, session.route.distance - session.distanceTraveled)
    : 0;

  return (
    <div className="screen walking-screen">
      <div className="map-container">
        <button className="map-back-btn" onClick={onQuit} aria-label="トップに戻る">
          <span style={{ fontSize: '16px' }}>←</span> トップに戻る
        </button>
        <div id="map" className="map-el" ref={mapContainerRef} />
      </div>

      <div className="walking-panel">
        {/* ステータスバナー */}
        <div className="walking-status-banner">
          <div className="walking-status-pulse" />
          <span className="walking-status-text">🚶 目的地へ向かっています</span>
        </div>

        {/* 目的地情報 */}
        <div className="destination-info">
          <div className="destination-name">
            {session.destination?.name ?? '---'}
          </div>
          <div className="destination-address">
            {session.destination?.address ?? '---'}
          </div>
          <div className="destination-remaining">
            残り {formatDistance(remaining)}
          </div>
        </div>

        {/* 進捗バー */}
        <div className="walking-progress">
          <div className="progress-label">
            <span className="progress-text">到着まで</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* メトリクス */}
        <div className="walking-metrics">
          <div className="metric-card">
            <div className="metric-label">歩数</div>
            <div>
              <span className="metric-value">{session.steps.toLocaleString()}</span>
              <span className="metric-unit">歩</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">距離</div>
            <div>
              <span className="metric-value">
                {(session.distanceTraveled / 1000).toFixed(1)}
              </span>
              <span className="metric-unit">km</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">カロリー</div>
            <div>
              <span className="metric-value">{session.calories}</span>
              <span className="metric-unit">kcal</span>
            </div>
          </div>
        </div>

        {/* アクション */}
        <div className="walking-actions">
          <button className="arrival-manual-button" onClick={onManualArrival}>
            🏁 目的地に到着した
          </button>
          <div className="walking-actions-row">
            <button
              className="button button-outline reroll-button"
              onClick={onReroll}
            >
              🎲 別の店舗を探す
            </button>
            <button className="quit-button" onClick={onQuit}>
              ✕ 探索を中止する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
