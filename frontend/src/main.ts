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

interface NutrientInfo {
  nutrientName: string;
  recommendedFoods: string[];
}

interface SearchInfo {
  originalQuery: string;
  translatedQuery: string;
  wasTranslated: boolean;
  searchType: 'food' | 'nutrient';
  nutrientInfo?: NutrientInfo;
}

interface USDASearchResponse {
  foods: USDAFood[];
  totalHits: number;
  searchInfo?: SearchInfo;
}

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header>
    <h1>栄養素検索アプリ</h1>
    <p class="subtitle">日本食品標準成分表 + USDA FoodData Central</p>
  </header>

  <div class="container">
    <div class="search-section">
      <h2>食品・栄養素を検索</h2>
      <div class="search-box">
        <input
          type="text"
          id="usda-search"
          placeholder="日本語でも英語でも検索可能 (例: 白米, 鶏むね, apple, chicken breast)"
        />
      </div>
      <div id="usda-results" class="results"></div>
    </div>
  </div>

  <footer>
    <p>Data: <a href="https://www.mext.go.jp/a_menu/syokuhinseibun/" target="_blank">日本食品標準成分表</a> + <a href="https://fdc.nal.usda.gov/" target="_blank">USDA FoodData Central</a></p>
  </footer>

  <div class="ad-section">
    <a href="https://al.dmm.com/?lurl=https%3A%2F%2Fbook.dmm.com%2Fproduct%2F56954%2Fb950gshes00114%2F&af_id=tmmi-002&ch=reward_ranking&ch_id=package_text" rel="sponsored" target="_blank">
      <img src="https://ebook-assets.dmm.com/digital/e-book/b950gshes00114/b950gshes00114pl.jpg" alt="ヒカルの碁 23" />
      <span class="ad-title">ヒカルの碁 23</span>
    </a>
    <p class="ad-price">484円</p>
  </div>
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
    usdaResults.innerHTML = '<div class="no-results">食品名や栄養素を入力してください<br><small>日本食例: 白米, 納豆, 鶏むね肉<br>英語例: apple, chicken breast</small></div>';
    return;
  }

  usdaResults.innerHTML = '<div class="loading">データベースを検索中...</div>';

  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&pageSize=15`);
    if (!response.ok) throw new Error('USDA API検索に失敗しました');

    const data: USDASearchResponse = await response.json();

    if (!data.foods || data.foods.length === 0) {
      usdaResults.innerHTML = '<div class="no-results">該当する食品が見つかりませんでした</div>';
      return;
    }

    const isNutrientSearch = data.searchInfo?.searchType === 'nutrient';
    const nutrientInfo = data.searchInfo?.nutrientInfo;

    const translationInfo = data.searchInfo?.wasTranslated
      ? `<div class="translation-info">${
          isNutrientSearch
            ? `「${data.searchInfo.originalQuery}」(${nutrientInfo?.nutrientName || ''}) を多く含む食品を検索`
            : `「${data.searchInfo.originalQuery}」→「${data.searchInfo.translatedQuery}」で検索しました`
        }</div>`
      : '';

    const recommendedFoodsHtml = isNutrientSearch && nutrientInfo?.recommendedFoods
      ? `<div class="recommended-foods">
          <span class="recommended-label">おすすめ食品:</span>
          ${nutrientInfo.recommendedFoods.map(f => `<span class="food-tag">${f}</span>`).join('')}
        </div>`
      : '';

    usdaResults.innerHTML = `
      <div class="results-header">
        <span>${data.totalHits.toLocaleString()} 件中 ${data.foods.length} 件を表示</span>
        ${translationInfo}
        ${recommendedFoodsHtml}
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

usdaResults.innerHTML = '<div class="no-results">食品名や栄養素を入力してください<br><small>日本食例: 白米, 納豆, 鶏むね肉<br>英語例: apple, chicken breast</small></div>';
