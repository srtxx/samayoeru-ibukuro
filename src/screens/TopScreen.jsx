import { calculateSearchRadius } from '../utils/calc';
import { Footprints, Store, Coins, Compass } from 'lucide-react';

export default function TopScreen({
  walkingMinutes,
  setWalkingMinutes,
  selectedGenre,
  storeTypes,
  setStoreTypes,
  priceLevels,
  setPriceLevels,
  onStart,
  isOffline,
  onSavePreferences,
}) {
  function handleSlider(e) {
    const val = parseInt(e.target.value);
    setWalkingMinutes(val);
    onSavePreferences(val, selectedGenre, storeTypes, priceLevels);
  }

  function handleStoreTypeToggle(type) {
    const newTypes = { ...storeTypes, [type]: !storeTypes[type] };
    setStoreTypes(newTypes);
    onSavePreferences(walkingMinutes, selectedGenre, newTypes, priceLevels);
  }

  function handlePriceLevelToggle(level) {
    const newLevels = { ...priceLevels, [level]: !priceLevels[level] };
    setPriceLevels(newLevels);
    onSavePreferences(walkingMinutes, selectedGenre, storeTypes, newLevels);
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
          <div className="section-title"><Footprints size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> 歩行時間</div>
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

        {/* Store Type Filter */}
        <div className="filter-section">
          <div className="section-title"><Store size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> 経営形態</div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={storeTypes.chain} onChange={() => handleStoreTypeToggle('chain')} />
              <span>グルメ（チェーン店）</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={storeTypes.individual} onChange={() => handleStoreTypeToggle('individual')} />
              <span>個人経営</span>
            </label>
          </div>
        </div>

        {/* Price Level Filter */}
        <div className="filter-section">
          <div className="section-title"><Coins size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/> 価格帯</div>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" checked={priceLevels.cheap} onChange={() => handlePriceLevelToggle('cheap')} />
              <span>安い (〜1000円)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={priceLevels.moderate} onChange={() => handlePriceLevelToggle('moderate')} />
              <span>普通 (1000〜3000円)</span>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={priceLevels.expensive} onChange={() => handlePriceLevelToggle('expensive')} />
              <span>高い (3000円〜)</span>
            </label>
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
            <span className="start-button-icon"><Compass size={22} /></span>
            目的地をランダムに決めて出発
          </button>
        </div>
      </div>
    </div>
  );
}
