import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Pin the port so the OAuth redirect origin stays consistent
    // (must match the Redirect URLs configured in Supabase).
    port: 5173,
    strictPort: true,
  },
});
