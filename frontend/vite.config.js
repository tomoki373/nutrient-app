import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  preview: {
    // Render など外部ドメインからアクセスしたときの Host を許可する
    allowedHosts: ["nutrient-app-2.onrender.com", "localhost"],
  },
});

