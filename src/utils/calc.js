// ============================================
// 計算ユーティリティ
// ============================================

export function calculateSearchRadius(minutes) {
  return minutes * 80;
}

export function calculateSteps(distanceMeters) {
  return Math.round(distanceMeters / 0.75);
}

export function calculateCalories(distanceMeters) {
  return Math.round((distanceMeters / 1000) * 58.5);
}

export function calculateProgress(traveled, total) {
  if (total <= 0) return 0;
  return Math.min(100, (traveled / total) * 100);
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function checkArrival(currentLat, currentLng, destLat, destLng) {
  return haversineDistance(currentLat, currentLng, destLat, destLng) < 50;
}

export function formatDistance(meters) {
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + ' km';
  }
  return Math.round(meters) + ' m';
}

// ============================================
// シェアカード生成 (Canvas API)
// ============================================
export function generateShareCard({ restaurantName, distance, steps, calories }) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1A1814';
  ctx.fillRect(0, 0, 1200, 630);

  // Top accent bar
  const gradient = ctx.createLinearGradient(0, 0, 1200, 0);
  gradient.addColorStop(0, '#BA7517');
  gradient.addColorStop(1, '#FAC775');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 8);

  // Bottom accent bar
  ctx.fillRect(0, 622, 1200, 8);

  // Decorative circle
  ctx.beginPath();
  ctx.arc(1100, 100, 200, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(186, 117, 23, 0.06)';
  ctx.fill();

  // App title
  ctx.fillStyle = '#FAC775';
  ctx.font = '600 42px "Zen Antique", serif';
  ctx.fillText('彷徨える胃袋', 60, 90);

  // Subtitle line
  ctx.fillStyle = '#888780';
  ctx.font = '18px "Noto Sans JP", sans-serif';
  ctx.fillText('今日の冒険記録', 60, 125);

  // Separator line
  ctx.strokeStyle = 'rgba(250, 199, 117, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 150);
  ctx.lineTo(1140, 150);
  ctx.stroke();

  // Restaurant name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 36px "Noto Sans JP", sans-serif';
  ctx.fillText('🍜 ' + restaurantName, 60, 210);

  // Metrics labels
  ctx.fillStyle = '#888780';
  ctx.font = '18px "Noto Sans JP", sans-serif';
  ctx.fillText('歩いた距離', 60, 300);
  ctx.fillText('歩数', 440, 300);
  ctx.fillText('消費カロリー', 780, 300);

  // Metrics values
  ctx.fillStyle = '#FAC775';
  ctx.font = '600 72px "Zen Antique", serif';
  ctx.fillText(distance, 60, 390);
  ctx.fillText(steps, 440, 390);
  ctx.fillText(String(calories), 780, 390);

  // Metrics units
  ctx.font = '600 72px "Zen Antique", serif';
  const distW = ctx.measureText(distance).width;
  const stW = ctx.measureText(steps).width;
  const calW = ctx.measureText(String(calories)).width;

  ctx.fillStyle = '#888780';
  ctx.font = '24px "Noto Sans JP", sans-serif';
  ctx.fillText('km', 60 + distW + 8, 390);
  ctx.fillText('歩', 440 + stW + 8, 390);
  ctx.fillText('kcal', 780 + calW + 8, 390);

  // Separator line
  ctx.strokeStyle = 'rgba(250, 199, 117, 0.2)';
  ctx.beginPath();
  ctx.moveTo(60, 440);
  ctx.lineTo(1140, 440);
  ctx.stroke();

  // Hashtags
  ctx.fillStyle = '#BA7517';
  ctx.font = '20px "Noto Sans JP", sans-serif';
  ctx.fillText('#彷徨える胃袋  #今日のチェーン旅', 60, 490);

  // Date
  const now = new Date();
  const dateStr = now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate();
  ctx.fillStyle = '#888780';
  ctx.font = '16px "Noto Sans JP", sans-serif';
  ctx.fillText(dateStr, 60, 580);

  // App branding
  ctx.fillStyle = 'rgba(250, 199, 117, 0.3)';
  ctx.font = '16px "Noto Sans JP", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('samayoeru-ibukuro.app', 1140, 580);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
