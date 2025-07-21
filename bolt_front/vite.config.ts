import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

/**
 * SEC-009: セキュリティヘッダーを追加するプラグイン
 */
function securityHeaders(): Plugin {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        // HSTS (HTTP Strict Transport Security)
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
        
        // X-Content-Type-Options
        res.setHeader('X-Content-Type-Options', 'nosniff');
        
        // X-Frame-Options
        res.setHeader('X-Frame-Options', 'DENY');
        
        // X-XSS-Protection
        res.setHeader('X-XSS-Protection', '1; mode=block');
        
        // Referrer-Policy
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions-Policy (旧Feature-Policy)
        res.setHeader(
          'Permissions-Policy',
          'geolocation=(), microphone=(), camera=(), payment=()'
        );
        
        // Content-Security-Policy
        const csp = [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: https: blob:",
          "connect-src 'self' https://*.supabase.co https://*.supabase.com wss://*.supabase.co ws://localhost:* https://real-estate-app-1-iii4.onrender.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "object-src 'none'",
          "upgrade-insecure-requests"
        ].join('; ');
        
        res.setHeader('Content-Security-Policy', csp);
        
        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    securityHeaders() // SEC-009: セキュリティヘッダープラグイン
  ],
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
    hmr: {
      overlay: false
    },
    // SEC-009: 開発サーバーのHTTPS化（オプション）
    // https: true を有効にすると、自己署名証明書でHTTPSを使用
    // 本番環境では適切な証明書を使用すること
  }
});
