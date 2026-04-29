import { defineConfig } from "vite";

export default defineConfig({
  preview: {
    // Render など外部ドメインからアクセスしたときの Host を許可する
    allowedHosts: ["nutrient-app-2.onrender.com", "localhost"],
  },
});

