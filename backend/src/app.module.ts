import { Module } from '@nestjs/common';
import { UsdaModule } from './usda/usda.module';

@Module({
  imports: [UsdaModule],
})
export class AppModule {}
