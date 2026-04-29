import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'nutrient-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
