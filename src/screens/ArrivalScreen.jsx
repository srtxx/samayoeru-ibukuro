export default function ArrivalScreen({
  session,
  stamps,
  shareCardUrl,
  onShare,
  onRetry,
}) {
  return (
    <div className="screen arrival-screen">
      <div className="arrival-header">
        <div className="arrival-congrats">🎉</div>
        <h1 className="arrival-title">到着おめでとう！</h1>
        <p className="arrival-subtitle">
          {session.destination?.name ?? ''} に到着！
        </p>
      </div>

      <div className="arrival-content">
        {/* Share Card */}
        {shareCardUrl && (
          <div className="share-card-container">
            <img src={shareCardUrl} alt="シェアカード" />
          </div>
        )}

        {/* Conquest Stamps */}
        <div className="stamps-section">
          <div className="stamps-header">
            <div className="section-title">🏅 制覇スタンプ</div>
            <div className="stamps-count">{stamps.totalUnique} 店</div>
          </div>
          <div className="stamps-grid">
            {stamps.chains.map((chain, i) => {
              const isNew =
                chain.name === session.destination?.name && chain.visitCount === 1;
              return (
                <span
                  key={chain.name}
                  className={`stamp${isNew ? ' new' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {chain.name}
                </span>
              );
            })}
          </div>
        </div>

        <div className="arrival-actions">
          <button className="button share-button button-full" onClick={onShare}>
            𝕏 到着結果をシェアする
          </button>
          <button
            className="button button-outline retry-button button-full"
            onClick={onRetry}
          >
            🔁 新しい探索を始める
          </button>
        </div>
      </div>
    </div>
  );
}
