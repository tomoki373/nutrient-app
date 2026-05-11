import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { UsdaService } from './usda';
import { getAllowedOrigins } from './cors';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', async (c, next) => {
  const allowedOrigins = getAllowedOrigins(c.env);

  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow all localhost origins in development
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return origin;
      }
      // Check against allowed origins
      if (allowedOrigins.includes(origin)) {
        return origin;
      }
      // Fallback to first allowed origin
      return allowedOrigins[0] || origin;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  });

  return corsMiddleware(c, next);
});

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Nutrient App API - Powered by Cloudflare Workers + Hono',
    version: '1.0.0',
    endpoints: {
      search: 'GET /usda/search?query=apple&pageSize=15',
      details: 'GET /usda/:fdcId',
    },
  });
});

// USDA search endpoint
app.get('/usda/search', async (c) => {
  try {
    const query = c.req.query('query');
    const pageSize = c.req.query('pageSize') || '10';

    if (!query) {
      return c.json({ foods: [], totalHits: 0, currentPage: 1, totalPages: 0 });
    }

    // Validate API key
    if (!c.env.USDA_API_KEY) {
      return c.json({ error: 'USDA_API_KEY not configured' }, 500);
    }

    const usdaService = new UsdaService(c.env.USDA_API_KEY);
    const result = await usdaService.searchFoods(query, parseInt(pageSize, 10));

    // Format each food item
    const formattedFoods = result.foods.map((food) =>
      usdaService.formatNutrients(food)
    );

    return c.json({
      ...result,
      foods: formattedFoods,
    });
  } catch (error) {
    console.error('Search error:', error);
    return c.json(
      {
        error: 'Failed to search foods',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// USDA food details endpoint
app.get('/usda/:fdcId', async (c) => {
  try {
    const fdcId = c.req.param('fdcId');

    if (!fdcId || isNaN(parseInt(fdcId, 10))) {
      return c.json({ error: 'Invalid fdcId' }, 400);
    }

    // Validate API key
    if (!c.env.USDA_API_KEY) {
      return c.json({ error: 'USDA_API_KEY not configured' }, 500);
    }

    const usdaService = new UsdaService(c.env.USDA_API_KEY);
    const food = await usdaService.getFoodDetails(parseInt(fdcId, 10));

    return c.json(usdaService.formatNutrients(food));
  } catch (error) {
    console.error('Details error:', error);
    return c.json(
      {
        error: 'Failed to get food details',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json(
    {
      error: 'Internal server error',
      message: err.message,
    },
    500
  );
});

export default app;
