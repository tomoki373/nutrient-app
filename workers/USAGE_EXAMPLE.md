# API 使用例

## フロントエンドでの利用

### React での実装例

```typescript
// types/usda.ts
export interface Nutrient {
  name: string;
  value: number;
  unit: string;
}

export interface Food {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  nutrients: Nutrient[];
}

export interface SearchResponse {
  foods: Food[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

// api/usda.ts
const API_BASE = 'http://localhost:8787'; // 開発環境
// const API_BASE = 'https://nutrient-app-api.your-subdomain.workers.dev'; // 本番環境

export async function searchFoods(
  query: string,
  pageSize = 10
): Promise<SearchResponse> {
  const response = await fetch(
    `${API_BASE}/usda/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getFoodDetails(fdcId: number): Promise<Food> {
  const response = await fetch(`${API_BASE}/usda/${fdcId}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// components/FoodSearch.tsx
import { useState } from 'react';
import { searchFoods } from '../api/usda';
import type { Food } from '../types/usda';

export function FoodSearch() {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await searchFoods(query, 15);
      setFoods(result.foods);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for food..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div>
        {foods.map((food) => (
          <div key={food.fdcId}>
            <h3>{food.description}</h3>
            <p>{food.brandOwner}</p>
            <ul>
              {food.nutrients.map((nutrient, index) => (
                <li key={index}>
                  {nutrient.name}: {nutrient.value} {nutrient.unit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### React Native での実装例

```typescript
// api/usda.ts (同じコード)

// screens/FoodSearchScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text } from 'react-native';
import { searchFoods } from '../api/usda';
import type { Food } from '../types/usda';

export function FoodSearchScreen() {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const result = await searchFoods(query, 15);
      setFoods(result.foods);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search for food..."
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button
        title={loading ? 'Searching...' : 'Search'}
        onPress={handleSearch}
        disabled={loading}
      />

      <FlatList
        data={foods}
        keyExtractor={(item) => item.fdcId.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
            {item.brandOwner && <Text>{item.brandOwner}</Text>}
            {item.nutrients.map((nutrient, index) => (
              <Text key={index}>
                {nutrient.name}: {nutrient.value} {nutrient.unit}
              </Text>
            ))}
          </View>
        )}
      />
    </View>
  );
}
```

### Vanilla JavaScript での実装例

```javascript
// HTML
<input type="text" id="searchInput" placeholder="Search for food..." />
<button id="searchButton">Search</button>
<div id="results"></div>

// JavaScript
const API_BASE = 'http://localhost:8787';

async function searchFoods(query, pageSize = 10) {
  const response = await fetch(
    `${API_BASE}/usda/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  if (!query.trim()) return;

  try {
    const result = await searchFoods(query, 15);
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = result.foods
      .map(food => `
        <div>
          <h3>${food.description}</h3>
          ${food.brandOwner ? `<p>${food.brandOwner}</p>` : ''}
          <ul>
            ${food.nutrients.map(n => `
              <li>${n.name}: ${n.value} ${n.unit}</li>
            `).join('')}
          </ul>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Search error:', error);
  }
});
```

## cURL での利用

### 検索

```bash
curl -X GET "http://localhost:8787/usda/search?query=apple&pageSize=5" \
  -H "Content-Type: application/json"
```

### 詳細取得

```bash
curl -X GET "http://localhost:8787/usda/2117388" \
  -H "Content-Type: application/json"
```

## 環境変数の設定

### React / Next.js

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8787
```

コード内:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;
```

### React Native (Expo)

`app.config.js`:
```javascript
export default {
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:8787',
  },
};
```

コード内:
```typescript
import Constants from 'expo-constants';
const API_BASE = Constants.expoConfig?.extra?.apiUrl;
```

## レスポンス例

### 検索エンドポイント

```json
{
  "totalHits": 26803,
  "currentPage": 1,
  "totalPages": 8935,
  "foods": [
    {
      "fdcId": 2117388,
      "description": "APPLE",
      "dataType": "Branded",
      "brandOwner": "Associated Wholesale Grocers, Inc.",
      "nutrients": [
        {
          "name": "Protein",
          "value": 0,
          "unit": "G"
        },
        {
          "name": "Total lipid (fat)",
          "value": 0,
          "unit": "G"
        },
        {
          "name": "Carbohydrate, by difference",
          "value": 11.7,
          "unit": "G"
        }
      ]
    }
  ]
}
```

### 詳細エンドポイント

```json
{
  "fdcId": 2117388,
  "description": "APPLE",
  "dataType": "Branded",
  "brandOwner": "Associated Wholesale Grocers, Inc.",
  "nutrients": [
    {
      "name": "Protein",
      "value": 0,
      "unit": "g"
    },
    {
      "name": "Total Sugars",
      "value": 11.67,
      "unit": "g"
    },
    {
      "name": "Energy",
      "value": 46,
      "unit": "kcal"
    }
  ]
}
```
