import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    global: {},
  },
  server: {
    host: '0.0.0.0', // 全てのIPから受け付ける
    port: 5173,
    strictPort: true,
    hmr: {
      // ✅ これが原因でうまく繋がらないことがあります
      // host: '18.181.173.44', ← 削除 or 修正
    }
  },
  optimizeDeps: {
    include: ['three/examples/jsm/controls/OrbitControls']
  }
})
