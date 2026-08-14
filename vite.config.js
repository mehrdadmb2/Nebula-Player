import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Nebula-Player/'  // ← این خط را اضافه کنید (نام ریپو را دقیقاً بنویسید)
});
