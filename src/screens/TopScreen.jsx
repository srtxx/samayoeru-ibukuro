import { GENRES } from '../constants/genres';
import { calculateSearchRadius } from '../utils/calc';

export default function TopScreen({
  walkingMinutes,
  setWalkingMinutes,
  selectedGenre,
  setSelectedGenre,
  statistics,
  stamps,
  onStart,
  isOffline,
  onSavePreferences,
}) {
  function handleSlider(e) {
    const val = parseInt(e.target.value);
    setWalkingMinutes(val);
    onSavePreferences(val, selectedGenre);
  }

  function handleGenre(genreId) {
    setSelectedGenre(genreId);
    onSavePreferences(walkingMinutes, genreId);
  }

  const radius = calculateSearchRadius(walkingMinutes);

  return (
    <div className="screen top-screen">
      <div className="top-header">
        <h1 className="top-title">彷徨える胃袋</h1>
        <p className="top-tagline">今日も、あてなく歩こう。</p>
      </div>

      <div className="top-content">
        {/* Walking Time Slider */}
        <div className="slider-section">
          <div className="section-title">🚶 歩行時間</div>
          <div className="slider-display">
            <div>
              <span className="slider-time">{walkingMinutes}</span>
              <span className="slider-time-unit">分</span>
            </div>
            <span className="slider-distance">約 {radius.toLocaleString()} m</span>
          </div>
          <input
            type="range"
            id="walking-slider"
            min="5"
            max="40"
            value={walkingMinutes}
            step="1"
            onChange={handleSlider}
          />
        </div>

        {/* Genre Filter */}
        <div className="genre-section">
          <div className="section-title">🍽️ ジャンル</div>
          <div className="genre-chips">
            {GENRES.map((g) => (
              <span
                key={g.id}
                className={`chip${selectedGenre === g.id ? ' selected' : ''}`}
                onClick={() => handleGenre(g.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleGenre(g.id)}
              >
                {g.emoji ? `${g.emoji} ` : ''}{g.label}
              </span>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <div className="section-title">📊 累計記録</div>
          <div className="stats-grid">
            <div className="metric-card">
              <div className="metric-label">総距離</div>
              <div>
                <span className="metric-value">
                  {(statistics.totalDistance / 1000).toFixed(1)}
                </span>
                <span className="metric-unit">km</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">総歩数</div>
              <div>
                <span className="metric-value">
                  {statistics.totalSteps.toLocaleString()}
                </span>
                <span className="metric-unit">歩</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">消費kcal</div>
              <div>
                <span className="metric-value">
                  {statistics.totalCalories.toLocaleString()}
                </span>
                <span className="metric-unit">kcal</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">制覇店数</div>
              <div>
                <span className="metric-value">{stamps.totalUnique}</span>
                <span className="metric-unit">店</span>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="start-section">
          <button
            id="start-btn"
            className="button start-button"
            onClick={onStart}
            disabled={isOffline}
          >
            <span className="start-button-icon">🧭</span>
            目的地をランダムに決めて出発
          </button>
        </div>
      </div>
    </div>
  );
}
