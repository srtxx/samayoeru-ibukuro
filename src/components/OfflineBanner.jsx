export default function OfflineBanner({ visible }) {
  return (
    <div className={`offline-banner${visible ? ' visible' : ''}`} role="alert">
      📡 オフラインです。一部機能が制限されます。
    </div>
  );
}
