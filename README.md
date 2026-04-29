# 栄養素検索アプリ

野菜と栄養素を相互に検索できるWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Vite + TypeScript (Vanilla)
- **バックエンド**: NestJS 10 + Drizzle ORM
- **データベース**: PostgreSQL 16
- **開発環境**: Docker Compose

## 機能

1. **栄養素から野菜を検索**: 栄養素名を入力すると、その栄養素を含む野菜のリストが表示されます
2. **野菜から栄養素を検索**: 野菜名を入力すると、その野菜に含まれる栄養素のリストが表示されます

## 起動方法

### 前提条件

- Docker & Docker Compose がインストールされていること
- Node.js 20+ がインストールされていること

### 1. リポジトリのクローン

```bash
cd /Users/tomoki/Desktop/nutrient-app
```

### 2. データベースとバックエンドの起動

```bash
# Docker Composeでデータベースとバックエンドを起動
docker-compose up -d

# データベースが起動するまで少し待つ
sleep 10

# データベースのマイグレーション
cd backend
npm run db:push

# シードデータの投入
npm run db:seed

cd ..
```

### 3. フロントエンドの起動

```bash
cd frontend
npm run dev
```

### 4. アプリケーションにアクセス

ブラウザで以下のURLにアクセスします:

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:3000

## API エンドポイント

### 野菜

- `GET /vegetables` - 全野菜の取得
- `GET /vegetables?search={query}` - 野菜名で検索
- `GET /vegetables/:id` - 特定の野菜と含まれる栄養素を取得

### 栄養素

- `GET /nutrients` - 全栄養素の取得
- `GET /nutrients?search={query}` - 栄養素名で検索(含まれる野菜も返す)
- `GET /nutrients/:id` - 特定の栄養素と含まれる野菜を取得

## 開発

### バックエンドのみ起動

```bash
cd backend
npm run dev
```

### データベースのリセット

```bash
# コンテナを停止・削除
docker-compose down -v

# 再度起動
docker-compose up -d
sleep 10

# マイグレーションとシード
cd backend
npm run db:push
npm run db:seed
```

### TypeScript のビルド

```bash
# バックエンド
cd backend
npm run build

# フロントエンド
cd frontend
npm run build
```

## プロジェクト構成

```
nutrient-app/
├── backend/              # NestJS バックエンド
│   ├── src/
│   │   ├── db/          # Drizzle ORM設定・スキーマ・シード
│   │   ├── vegetables/  # 野菜モジュール
│   │   ├── nutrients/   # 栄養素モジュール
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/            # Vite フロントエンド
│   ├── src/
│   │   ├── main.ts     # メインロジック
│   │   └── style.css   # スタイル
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## 初期データ

アプリには以下の初期データが投入されています:

### 野菜 (10種類)
- にんじん、ほうれん草、トマト、ブロッコリー、かぼちゃ、ピーマン、キャベツ、じゃがいも、玉ねぎ、アスパラガス

### 栄養素 (10種類)
- ビタミンA、ビタミンC、ビタミンK、鉄分、カリウム、食物繊維、カルシウム、葉酸、ベータカロテン、リコピン

## トラブルシューティング

### ポートが既に使用されている

```bash
# PostgreSQL (5432), バックエンド (3000), フロントエンド (5173) が使われていないか確認
lsof -i :5432
lsof -i :3000
lsof -i :5173
```

### データベース接続エラー

```bash
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs postgres
docker-compose logs backend
```

### フロントエンドがバックエンドに接続できない

`frontend/src/main.ts` の `API_BASE_URL` が正しいか確認してください。
