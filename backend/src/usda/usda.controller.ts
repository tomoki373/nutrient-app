import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsdaService } from './usda.service';

@Controller('usda')
export class UsdaController {
  constructor(private readonly usdaService: UsdaService) {}

  @Get('search')
  async search(
    @Query('query') query: string,
    @Query('pageSize') pageSize?: string,
  ) {
    if (!query) {
      return { foods: [], totalHits: 0 };
    }

    const result = await this.usdaService.searchFoods(
      query,
      pageSize ? parseInt(pageSize, 10) : 10,
    );

    // Format each food item
    return {
      ...result,
      foods: result.foods.map((food) => this.usdaService.formatNutrients(food)),
    };
  }

  @Get(':fdcId')
  async getFoodDetails(@Param('fdcId') fdcId: string) {
    const food = await this.usdaService.getFoodDetails(parseInt(fdcId, 10));
    return this.usdaService.formatNutrients(food);
  }
}
