import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages (https://<username>.github.io/KicksLine/) でもローカルでもそのまま動くよう相対ベースパスを設定
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
