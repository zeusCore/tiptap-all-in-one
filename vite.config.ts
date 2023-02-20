import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      // 打包的入口文件
      entry: path.resolve(__dirname, 'src/index.tsx'),
      name: 'App',
      fileName: (format) => `tiptap-all-in-one.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  server: {
    port: 5177,
  },
})
