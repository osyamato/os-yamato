import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// ✅ vueDevTools を削除（完全無効化のため）
 
export default defineConfig({
  plugins: [
    vue(),
    // ❌ vueDevTools({ overlay: false }), ← 削除済
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    global: {},
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: '18.181.173.44',
    }
  },

  optimizeDeps: {
    include: ['three/examples/jsm/controls/OrbitControls']
  }
})

