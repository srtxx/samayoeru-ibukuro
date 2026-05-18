import { calculateSearchRadius } from '../utils/calc';
import { Footprints, Compass } from 'lucide-react';

export default function TopScreen({
  walkingMinutes,
  setWalkingMinutes,
  onStart,
  isOffline,
  onSavePreferences,
}) {
  function handleSlider(e) {
    const val = parseInt(e.target.value);
    setWalkingMinutes(val);
    onSavePreferences(val);
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
          <div className="section-title">
            <Footprints size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/>
            歩行時間
          </div>
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

        {/* Start Button */}
        <div className="start-section">
          <button
            id="start-btn"
            className="button start-button"
            onClick={onStart}
            disabled={isOffline}
          >
            <span className="start-button-icon"><Compass size={22} /></span>
            目的地をランダムに決めて出発
          </button>
        </div>
      </div>
    </div>
  );
}
