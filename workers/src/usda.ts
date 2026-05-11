import type {
  Env,
  USDAFood,
  USDASearchResponse,
  FormattedFood,
  USDANutrient,
  USDADetailNutrient,
} from './types';

/**
 * USDA API Service
 * Handles communication with FoodData Central API
 */
export class UsdaService {
  private readonly API_BASE = 'https://api.nal.usda.gov/fdc/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search foods in USDA database
   */
  async searchFoods(query: string, pageSize = 10): Promise<USDASearchResponse> {
    const url = `${this.API_BASE}/foods/search?api_key=${this.apiKey}&query=${encodeURIComponent(query)}&pageSize=${pageSize}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get detailed food information by FDC ID
   */
  async getFoodDetails(fdcId: number): Promise<USDAFood> {
    const url = `${this.API_BASE}/food/${fdcId}?api_key=${this.apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check if nutrient is from search endpoint (has nutrientName)
   */
  private isSearchNutrient(
    nutrient: USDANutrient | USDADetailNutrient
  ): nutrient is USDANutrient {
    return 'nutrientName' in nutrient;
  }

  /**
   * Format nutrients for easier display
   * Filters to show only important nutrients
   * Handles both search and details endpoint formats
   */
  formatNutrients(food: USDAFood): FormattedFood {
    const importantNutrients = [
      'Energy',
      'Protein',
      'Total lipid (fat)',
      'Carbohydrate, by difference',
      'Fiber, total dietary',
      'Sugars, total including NLEA',
      'Total Sugars', // Alternative name in details endpoint
      'Calcium, Ca',
      'Iron, Fe',
      'Potassium, K',
      'Sodium, Na',
      'Vitamin A, RAE',
      'Vitamin C, total ascorbic acid',
      'Vitamin D (D2 + D3)',
    ];

    const nutrients = food.foodNutrients
      .map((n) => {
        // Handle search endpoint format
        if (this.isSearchNutrient(n)) {
          return {
            name: n.nutrientName,
            value: n.value,
            unit: n.unitName,
            originalName: n.nutrientName,
          };
        }
        // Handle details endpoint format
        else {
          return {
            name: n.nutrient.name,
            value: n.amount,
            unit: n.nutrient.unitName,
            originalName: n.nutrient.name,
          };
        }
      })
      .filter((n) =>
        importantNutrients.some((name) =>
          n.originalName?.includes(name.split(',')[0])
        )
      )
      .map((n) => ({
        name: n.name,
        value: n.value,
        unit: n.unit,
      }))
      .slice(0, 15);

    return {
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      brandOwner: food.brandOwner,
      nutrients,
    };
  }
}
