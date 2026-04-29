import { Module } from '@nestjs/common';
import { UsdaModule } from './usda/usda.module';
import { AppController } from './app.controller';

@Module({
  imports: [UsdaModule],
  controllers: [AppController],
})
export class AppModule {}
