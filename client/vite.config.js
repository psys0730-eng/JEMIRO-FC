import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 개발 서버 포트 (서버와 구분)
    proxy: {
      // '/api'로 시작하는 요청은 자동으로 백엔드(5000번)로 전달
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
