# 彷徨える胃袋 — React版

## セットアップ

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## Vercelデプロイ

環境変数 `GOOGLE_MAPS_API_KEY` を Vercel の Settings > Environment Variables に設定してデプロイ。

```bash
vercel deploy
```

## 技術スタック

- **React 18** + **Vite 6**
- **vite-plugin-pwa** (PWA / Service Worker)
- **Vanilla CSS** (既存デザインシステムをそのまま移植)
- **サーバーレス関数** (Vercel Functions): `/api/config`, `/api/places`, `/api/directions`

## ディレクトリ構成

```
src/
├── main.jsx              # エントリーポイント
├── App.jsx               # ルートコンポーネント・状態管理・業務ロジック
├── index.css             # グローバルCSS（デザイントークン）
├── constants/
│   ├── genres.js         # ジャンル定義
│   ├── mapStyles.js      # Google Maps ダークモードスタイル
│   └── chains.js         # グルメチェーン判定ロジック
├── hooks/
│   ├── useStorage.js     # localStorage ヘルパー群
│   ├── useGeolocation.js # Geolocation API ラッパー
│   └── useGoogleMaps.js  # Google Maps SDK ローダー・Imperative操作
├── utils/
│   └── calc.js           # 計算ユーティリティ・シェアカード生成
├── screens/
│   ├── SetupScreen.jsx   # APIキー手動設定
│   ├── TopScreen.jsx     # スライダー・ジャンル・統計・出発
│   ├── LoadingScreen.jsx # ローディング中
│   ├── WalkingScreen.jsx # 地図・メトリクス・アクション
│   └── ArrivalScreen.jsx # 到着・スタンプ・シェア
└── components/
    ├── Toast.jsx
    ├── ErrorModal.jsx
    └── OfflineBanner.jsx
```
