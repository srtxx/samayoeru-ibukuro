import { useEffect, useRef } from 'react';

export default function Toast({ toast }) {
  const timerRef = useRef(null);

  // toast が visible になったら自動で非表示にするタイマーをセット
  // (App.jsx 側でもタイマー管理するが、CSS クラスはここで付与)
  const className = [
    'toast',
    toast.visible ? 'visible' : '',
    toast.type === 'warning' ? 'warning' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} role="alert" aria-live="polite">
      {toast.title && <div className="toast-title">{toast.title}</div>}
      {toast.message && <div className="toast-message">{toast.message}</div>}
    </div>
  );
}
