import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import FullReload from 'vite-plugin-full-reload'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), FullReload('src/**/*')],
    server: {
        port: 3000,
    }
})
