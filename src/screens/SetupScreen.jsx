import { useState } from 'react';

export default function SetupScreen({ onProceed, showToast }) {
  const [apiKey, setApiKey] = useState('');

  function handleSubmit() {
    const key = apiKey.trim();
    if (!key) {
      showToast('入力エラー', 'APIキーを入力してください。');
      return;
    }
    onProceed(key);
  }

  return (
    <div className="screen setup-screen">
      <div className="setup-container">
        <div className="setup-icon">🗺️</div>
        <h1 className="setup-title">彷徨える胃袋</h1>
        <p className="setup-subtitle">Google Maps APIキーを設定してください</p>

        <div className="setup-input-group">
          <label className="setup-input-label" htmlFor="api-key-input">
            Google Maps API Key
          </label>
          <input
            id="api-key-input"
            className="setup-input"
            type="text"
            placeholder="AIza..."
            autoComplete="off"
            spellCheck="false"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="button button-full" onClick={handleSubmit}>
          APIキーを保存して開始
        </button>

        <p className="setup-info">
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Cloud Console
          </a>
          でAPIキーを取得し、Maps JavaScript API・Directions API を有効化してください。
        </p>
      </div>
    </div>
  );
}
