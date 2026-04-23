const knownChains = [
  // 牛丼チェーン
  'すき家', '吉野家', '松屋', 'なか卯',
  // コンビニ
  'セブンイレブン', 'セブン-イレブン', 'ファミリーマート', 'ローソン', 'ミニストップ', 'デイリーヤマザキ',
  // カフェ
  'スターバックス', 'ドトール', 'タリーズ', 'コメダ珈琲', 'サンマルクカフェ', 'ベローチェ', 'プロント',
  // バーガー
  'マクドナルド', 'モスバーガー', 'ロッテリア', 'バーガーキング', 'フレッシュネスバーガー', 'ウェンディーズ',
  // ファミレス
  'サイゼリヤ', 'ガスト', 'ジョナサン', 'デニーズ', 'ロイヤルホスト', 'ジョイフル', 'ココス', 'びっくりドンキー', 'バーミヤン',
  // ラーメン
  '天下一品', '一蘭', '日高屋', '幸楽苑', 'リンガーハット', '一風堂', '丸亀製麺',
  // 居酒屋
  '鳥貴族', '魚民', '白木屋', '笑笑', '和民', '鳥メロ', '串カツ田中',
  // その他
  'CoCo壱番屋', 'カレーハウスCoCo壱番屋', 'ケンタッキー', 'KFC',
  '餃子の王将', '大阪王将', 'かつや', '松のや', '天丼てんや',
  'ミスタードーナツ', 'サーティワン', 'ピザーラ', 'ドミノ・ピザ',
  'すし銚子丸', 'くら寿司', 'スシロー', 'はま寿司',
  "COCO'S", 'Starbucks', "McDonald's", 'Subway', 'KFC',
];

function isKnownChain(name) {
  return knownChains.some((chain) => name.includes(chain));
}

function matchesChainPattern(name) {
  const katakanaPattern = /[\u30A0-\u30FF]{3,}/;
  const englishPattern = /[A-Z]{2,}/;
  return katakanaPattern.test(name) || englishPattern.test(name);
}

export function isChainStore(place) {
  const name = place.name;
  return isKnownChain(name) || matchesChainPattern(name);
}
