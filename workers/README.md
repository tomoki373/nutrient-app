# Nutrient App API - Cloudflare Workers

Cloudflare Workers + Hono を使った USDA FoodData Central API のプロキシ

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

開発用の環境変数ファイルを作成:

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` に USDA API キーを設定:

```
USDA_API_KEY=your_actual_api_key_here
```

USDA API キーは [FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html) で取得できます。

### 3. ローカル開発サーバーの起動

```bash
npm run dev
```

デフォルトでは `http://localhost:8787` で起動します。

## API エンドポイント

### ヘルスチェック

```
GET /
```

API の情報とエンドポイント一覧を返します。

### 食品検索

```
GET /usda/search?query=apple&pageSize=15
```

**クエリパラメータ:**
- `query` (必須): 検索キーワード
- `pageSize` (オプション): 結果の件数 (デフォルト: 10)

### 食品詳細

```
GET /usda/:fdcId
```

**パスパラメータ:**
- `fdcId`: FoodData Central の食品ID

## デプロイ

### 本番環境へのデプロイ前に Secrets を設定

```bash
# USDA API キーを設定
wrangler secret put USDA_API_KEY

# 許可するオリジンを設定 (カンマ区切り)
wrangler secret put ALLOWED_ORIGINS
# 例: https://yourdomain.com,https://app.yourdomain.com
```

### デプロイ

```bash
npm run deploy
```

## 技術スタック

- **Cloudflare Workers**: サーバーレス実行環境
- **Hono**: 軽量で高速な Web フレームワーク
- **TypeScript**: 型安全な開発
- **Wrangler**: Cloudflare Workers の CLI ツール

## CORS 設定

- 開発環境: `localhost` の全ポートを許可
- 本番環境: `ALLOWED_ORIGINS` 環境変数で指定したオリジンのみ許可

## ディレクトリ構成

```
workers/
├── src/
│   ├── index.ts      # メインエントリーポイント、ルーティング
│   ├── usda.ts       # USDA API サービス
│   ├── cors.ts       # CORS 設定
│   └── types.ts      # TypeScript 型定義
├── wrangler.toml     # Cloudflare Workers 設定
├── package.json
├── tsconfig.json
└── README.md
```

## トラブルシューティング

### API キーが設定されていない

エラー: `USDA_API_KEY not configured`

**解決方法:**
1. `.dev.vars` ファイルを確認
2. `USDA_API_KEY` が正しく設定されているか確認
3. `wrangler dev` を再起動

### CORS エラー

**解決方法:**
1. リクエスト元のオリジンが許可されているか確認
2. 開発環境では `localhost` が自動的に許可される
3. 本番環境では `ALLOWED_ORIGINS` Secrets を設定

## ライセンス

ISC
