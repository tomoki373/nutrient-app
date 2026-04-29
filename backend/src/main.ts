import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 環境変数から設定を取得
  const port = process.env.PORT || 3000;
  const corsOrigin = process.env.CORS_ORIGIN || '';
  const nodeEnv = process.env.NODE_ENV || 'development';

  // CORS設定
  if (nodeEnv === 'production' && corsOrigin) {
    // 本番環境: 指定されたオリジンのみ許可
    app.enableCors({
      origin: corsOrigin.split(',').map(o => o.trim()),
      credentials: true,
    });
  } else {
    // 開発環境: localhost全ポート許可
    app.enableCors({
      origin: /^http:\/\/localhost:\d+$/,
      credentials: true,
    });
  }

  await app.listen(port);
  console.log(`Application is running on port ${port} (${nodeEnv})`);
}
bootstrap();
