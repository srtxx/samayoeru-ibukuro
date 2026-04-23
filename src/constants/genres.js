// ジャンル定義
export const GENRES = [
  { id: 'all',         label: 'すべて',           emoji: '' },
  { id: 'convenience', label: 'コンビニ',          emoji: '🏪' },
  { id: 'family',      label: 'ファミレス',         emoji: '🍽️' },
  { id: 'izakaya',     label: '居酒屋',            emoji: '🍺' },
  { id: 'ramen',       label: 'ラーメン',           emoji: '🍜' },
  { id: 'cafe',        label: 'カフェ',            emoji: '☕' },
  { id: 'burger',      label: 'バーガー',           emoji: '🍔' },
];

export const genreKeywords = {
  all: '',
  convenience: 'コンビニ',
  family: 'ファミリーレストラン',
  izakaya: '居酒屋',
  ramen: 'ラーメン',
  cafe: 'カフェ',
  burger: 'バーガー',
};

export const genreTypes = {
  all: 'restaurant',
  convenience: 'convenience_store',
  family: 'restaurant',
  izakaya: 'bar',
  ramen: 'restaurant',
  cafe: 'cafe',
  burger: 'restaurant',
};

export const VALID_GENRES = GENRES.map((g) => g.id);
