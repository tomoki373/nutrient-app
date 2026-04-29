import './style.css';

// 環境変数からAPI URLを取得（本番/開発で自動切り替え）
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface USDANutrient {
  name: string;
  value: number;
  unit: string;
}

interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  nutrients: USDANutrient[];
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
}

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <h1>栄養素検索アプリ</h1>
    <p class="subtitle">USDA FoodData Central から食品の栄養情報を検索</p>
  </header>

  <div class="container">
    <div class="search-section">
      <h2>食品を検索</h2>
      <div class="search-box">
        <input
          type="text"
          id="usda-search"
          placeholder="食品名を英語で入力 (例: apple, carrot, broccoli, chicken)"
        />
      </div>
      <div id="usda-results" class="results"></div>
    </div>
  </div>

  <footer>
    <p>Data provided by <a href="https://fdc.nal.usda.gov/" target="_blank">USDA FoodData Central</a></p>
  </footer>
`;

const usdaSearchInput = document.getElementById('usda-search') as HTMLInputElement;
const usdaResults = document.getElementById('usda-results') as HTMLDivElement;

let usdaSearchTimeout: number;

function debounce(func: () => void, delay: number, timeoutId: number | undefined): number {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  return window.setTimeout(func, delay);
}

async function searchUSDA(query: string) {
  if (!query.trim()) {
    usdaResults.innerHTML = '<div class="no-results">食品名を英語で入力してください</div>';
    return;
  }

  usdaResults.innerHTML = '<div class="loading">USDA データベースを検索中...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/usda/search?query=${encodeURIComponent(query)}&pageSize=15`);
    if (!response.ok) throw new Error('USDA API検索に失敗しました');

    const data: USDASearchResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      usdaResults.innerHTML = '<div class="no-results">該当する食品が見つかりませんでした</div>';
      return;
    }

    usdaResults.innerHTML = `
      <div class="results-header">
        <span>${data.totalHits.toLocaleString()} 件中 ${data.foods.length} 件を表示</span>
      </div>
      ${data.foods
        .map(
          (food) => `
            <div class="result-item">
              <h3>${food.description}</h3>
              <div class="food-meta">
                <span class="data-type">${food.dataType}</span>
                ${food.brandOwner ? `<span class="brand">${food.brandOwner}</span>` : ''}
              </div>
              ${
                food.nutrients && food.nutrients.length > 0
                  ? `
                    <div class="nutrients-table">
                      <table>
                        <thead>
                          <tr>
                            <th>栄養素</th>
                            <th>量</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${food.nutrients
                            .map(
                              (n) => `
                                <tr>
                                  <td>${n.name}</td>
                                  <td>${n.value} ${n.unit}</td>
                                </tr>
                              `
                            )
                            .join('')}
                        </tbody>
                      </table>
                    </div>
                  `
                  : '<p class="no-nutrients">栄養素情報なし</p>'
              }
            </div>
          `
        )
        .join('')}
    `;
  } catch (error) {
    usdaResults.innerHTML = `<div class="error">エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}</div>`;
  }
}

usdaSearchInput.addEventListener('input', () => {
  usdaSearchTimeout = debounce(() => searchUSDA(usdaSearchInput.value), 500, usdaSearchTimeout);
});

usdaResults.innerHTML = '<div class="no-results">食品名を英語で入力してください</div>';
