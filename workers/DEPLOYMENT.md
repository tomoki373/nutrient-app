# Cloudflare Workers デプロイガイド

## 前提条件

1. Cloudflare アカウントの作成
2. USDA API キーの取得 ([FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html))

## 初回デプロイ

### 1. Cloudflare にログイン

```bash
npx wrangler login
```

ブラウザが開き、Cloudflare アカウントで認証を行います。

### 2. Secrets を設定

本番環境用の API キーを設定:

```bash
npx wrangler secret put USDA_API_KEY
```

プロンプトが表示されたら、USDA API キーを入力します。

### 3. 許可するオリジンを設定 (オプション)

本番環境で特定のドメインのみアクセスを許可する場合:

```bash
npx wrangler secret put ALLOWED_ORIGINS
```

カンマ区切りで複数のオリジンを指定できます:
```
https://yourdomain.com,https://app.yourdomain.com
```

### 4. デプロイ

```bash
npm run deploy
```

デプロイが成功すると、Workers の URL が表示されます:
```
https://nutrient-app-api.your-subdomain.workers.dev
```

## 環境別デプロイ

### 開発環境

```bash
npx wrangler deploy --env development
```

### 本番環境

```bash
npx wrangler deploy --env production
```

## デプロイ後の確認

### ヘルスチェック

```bash
curl https://nutrient-app-api.your-subdomain.workers.dev/
```

### API テスト

```bash
# 検索
curl "https://nutrient-app-api.your-subdomain.workers.dev/usda/search?query=apple&pageSize=5"

# 詳細
curl "https://nutrient-app-api.your-subdomain.workers.dev/usda/2117388"
```

## カスタムドメインの設定

1. Cloudflare ダッシュボードにログイン
2. Workers & Pages > 該当の Worker を選択
3. Settings > Triggers > Custom Domains
4. "Add Custom Domain" をクリック
5. ドメインを入力 (例: `api.yourdomain.com`)

## ログの確認

### リアルタイムログ

```bash
npx wrangler tail
```

### ダッシュボードで確認

Cloudflare ダッシュボード > Workers & Pages > 該当の Worker > Logs

## トラブルシューティング

### デプロイエラー: "USDA_API_KEY not found"

Secrets が設定されていません:

```bash
npx wrangler secret put USDA_API_KEY
```

### CORS エラー

本番環境で CORS エラーが発生する場合:

1. `ALLOWED_ORIGINS` Secrets が正しく設定されているか確認
2. リクエスト元のオリジンが含まれているか確認

```bash
npx wrangler secret put ALLOWED_ORIGINS
# 例: https://yourdomain.com,https://app.yourdomain.com
```

### デプロイ権限エラー

Cloudflare アカウントに Worker の作成権限があるか確認:

```bash
npx wrangler login
```

## コスト

- **Workers Free プラン**: 100,000 リクエスト/日まで無料
- **Workers Paid プラン**: $5/月 + 超過分従量課金

詳細: [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## ロールバック

前のバージョンに戻す場合:

1. Cloudflare ダッシュボード > Workers & Pages > 該当の Worker
2. Deployments タブ
3. 戻したいデプロイの "Rollback" をクリック
