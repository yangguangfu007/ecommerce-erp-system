import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [
      vue(),
      // 只在开发环境且明确启用时才加载Vue DevTools
      ...(mode === 'development' && env.VITE_ENABLE_DEVTOOLS === 'true' ? [vueDevTools()] : []),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *;`
        }
      }
    }
  }
})
