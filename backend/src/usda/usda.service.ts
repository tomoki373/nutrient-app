import { Injectable } from '@nestjs/common';

interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  foodNutrients: USDANutrient[];
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

@Injectable()
export class UsdaService {
  private readonly API_BASE = 'https://api.nal.usda.gov/fdc/v1';
  private readonly API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY';

  async searchFoods(query: string, pageSize = 10): Promise<USDASearchResponse> {
    const url = `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    return response.json();
  }

  async getFoodDetails(fdcId: number): Promise<USDAFood> {
    const url = `${this.API_BASE}/food/${fdcId}?api_key=${this.API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    return response.json();
  }

  // Format nutrients for easier display
  formatNutrients(food: USDAFood) {
    const importantNutrients = [
      'Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference',
      'Fiber, total dietary', 'Sugars, total including NLEA',
      'Calcium, Ca', 'Iron, Fe', 'Potassium, K', 'Sodium, Na',
      'Vitamin A, RAE', 'Vitamin C, total ascorbic acid', 'Vitamin D (D2 + D3)',
    ];

    return {
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      brandOwner: food.brandOwner,
      nutrients: food.foodNutrients
        .filter(n => importantNutrients.some(name => n.nutrientName?.includes(name.split(',')[0])))
        .map(n => ({
          name: n.nutrientName,
          value: n.value,
          unit: n.unitName,
        }))
        .slice(0, 15),
    };
  }
}
