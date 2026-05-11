/**
 * USDA API Types
 * Based on FoodData Central API v1
 * https://fdc.nal.usda.gov/api-guide.html
 */

// Search endpoint nutrient format
export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

// Details endpoint nutrient format
export interface USDADetailNutrient {
  nutrient: {
    id: number;
    number: string;
    name: string;
    rank: number;
    unitName: string;
  };
  amount: number;
}

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  foodNutrients: (USDANutrient | USDADetailNutrient)[];
}

export interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Formatted response types for client
 */
export interface FormattedNutrient {
  name: string;
  value: number;
  unit: string;
}

export interface FormattedFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  nutrients: FormattedNutrient[];
}

export interface FormattedSearchResponse {
  foods: FormattedFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Cloudflare Workers Environment
 */
export interface Env {
  USDA_API_KEY: string;
  ALLOWED_ORIGINS?: string;
}
