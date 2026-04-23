// ============================================
// localStorage Helpers
// NOTE: APIキーは localStorage に保存しません。
//       キーはサーバーサイドエンドポイント(/api/config)から
//       毎回取得し、セッション変数にも保持しません。
// ============================================

/** localStorage から JSON を安全に読み込む共通ヘルパー */
function safeParseJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

// ---- Statistics ----

export function getStatistics() {
  const raw = safeParseJSON('statistics', {});
  return {
    totalDistance: Number(raw.totalDistance) || 0,
    totalSteps: Number(raw.totalSteps) || 0,
    totalCalories: Number(raw.totalCalories) || 0,
    totalSessions: Number(raw.totalSessions) || 0,
  };
}

export function saveStatistics(stats) {
  stats.lastUpdated = Date.now();
  localStorage.setItem('statistics', JSON.stringify(stats));
}

export function updateStatisticsFromSession(session) {
  const stats = getStatistics();
  stats.totalDistance += Number(session.distanceTraveled) || 0;
  stats.totalSteps += Number(session.steps) || 0;
  stats.totalCalories += Number(session.calories) || 0;
  stats.totalSessions += 1;
  saveStatistics(stats);
}

// ---- Conquest Stamps ----

export function getConquestStamps() {
  const raw = safeParseJSON('conquestStamps', {});
  const chains = Array.isArray(raw.chains)
    ? raw.chains.filter((c) => c && typeof c.name === 'string')
    : [];
  return { chains, totalUnique: chains.length };
}

export function saveConquestStamps(stamps) {
  localStorage.setItem('conquestStamps', JSON.stringify(stamps));
}

export function addConquestStamp(chainName) {
  const stamps = getConquestStamps();
  const existing = stamps.chains.find((c) => c.name === chainName);
  if (existing) {
    existing.visitCount += 1;
  } else {
    stamps.chains.push({
      name: chainName,
      firstVisit: Date.now(),
      visitCount: 1,
    });
    stamps.totalUnique = stamps.chains.length;
  }
  saveConquestStamps(stamps);
  return stamps;
}

// ---- Visited History ----

const VISITED_HISTORY_MAX = 20;

export function getVisitedHistory() {
  return safeParseJSON('visitedHistory', []);
}

export function addVisitedHistory(placeId) {
  const history = getVisitedHistory();
  const filtered = history.filter((id) => id !== placeId);
  filtered.unshift(placeId);
  const trimmed = filtered.slice(0, VISITED_HISTORY_MAX);
  localStorage.setItem('visitedHistory', JSON.stringify(trimmed));
}

// ---- Preferences ----

export function loadPreferences() {
  const prefs = safeParseJSON('preferences', {});
  const minutes = parseInt(prefs.defaultWalkingMinutes, 10);
  const walkingMinutes = minutes >= 5 && minutes <= 40 ? minutes : 15;
  const validGenres = ['all', 'convenience', 'family', 'izakaya', 'ramen', 'cafe', 'burger'];
  const selectedGenre = validGenres.includes(prefs.defaultGenre) ? prefs.defaultGenre : 'all';
  return { walkingMinutes, selectedGenre };
}

export function savePreferences(walkingMinutes, selectedGenre) {
  localStorage.setItem(
    'preferences',
    JSON.stringify({ defaultWalkingMinutes: walkingMinutes, defaultGenre: selectedGenre })
  );
}
