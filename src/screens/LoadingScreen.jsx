export default function LoadingScreen({ status, substatus }) {
  return (
    <div className="screen loading-screen">
      <div className="loading-container">
        <div className="loading-spinner" aria-hidden="true" />
        <div className="loading-status">{status}</div>
        <div className="loading-substatus">{substatus}</div>
      </div>
    </div>
  );
}
