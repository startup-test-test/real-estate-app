import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // チャンクサイズ警告を800kBに設定
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // vendor依存関係を分離してキャッシュ効率を向上
        manualChunks: {
          // React関連を分離
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Supabaseを分離
          supabase: ['@supabase/supabase-js'],
          // Chart.js関連を分離
          charts: ['chart.js', 'react-chartjs-2', 'chartjs-plugin-zoom'],
          // Lucide アイコンを分離
          icons: ['lucide-react']
        }
      }
    },
    // ソースマップを無効化して本番ビルドサイズを削減
    sourcemap: false,
    // minifyを有効化
    minify: 'terser',
    terserOptions: {
      compress: {
        // 本番環境でconsole.logを削除
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // 開発時のパフォーマンス向上
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false
    },
    // APIプロキシ設定
    proxy: {
      '/api/ml': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'https://property-develop.onrender.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
