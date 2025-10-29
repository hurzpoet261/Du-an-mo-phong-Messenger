import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // CẤU HÌNH PROXY NẰM Ở ĐÂY
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng '/api'
      '/api': {
        // Sẽ được chuyển tiếp đến server backend của bạn
        target: 'http://localhost:5001', // <-- !! QUAN TRỌNG !!
        changeOrigin: true,
        secure: false, // (Không bắt buộc, nhưng hữu ích nếu backend là https)
      }
    }
  }
})