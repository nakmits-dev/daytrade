# デイトレード日記

デイトレードの取引記録と分析を簡単に管理できるWebアプリケーションです。

## 主な機能

- 📊 日次の取引記録
- 📈 月間・年間の損益分析
- ✅ トレードルールの遵守率追跡
- 📱 スマートフォン対応
- 🔄 PWA対応（オフライン利用可能）

## 技術スタック

- React + TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS
- Chart.js
- Vite

## 開発環境のセットアップ

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/daytrade-journal.git
cd daytrade-journal
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数の設定
- `.env.example`をコピーして`.env`を作成
- Firebaseの設定値を入力

4. 開発サーバーの起動
```bash
npm run dev
```

## デプロイ

1. ビルド
```bash
npm run build
```

2. デプロイ（Netlify推奨）
```bash
netlify deploy
```

## ライセンス

MIT License