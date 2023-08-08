// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
    plugins: [vue(),
    AutoImport({
        resolvers: [ElementPlusResolver()],
    }),
    Components({
        resolvers: [ElementPlusResolver()],
    }),
    ],
    define: {
        'process.env.NODE_ENV': '\'development\'',
    },
    build: {
        lib: {
            entry: resolve(__dirname, 'src', "index.js"),
            formats: ['cjs'],
            fileName: 'index',
        },
        commonjsOptions: {
            defaultIsModuleExports: true,
        },
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src', "index.js"),
            },
            output: {
                dir: './',
                name: 'index',
                format: 'commonjs',
                esModule: 'if-default-prop',
                manualChunks: undefined,
                assetFileNames: (info) => {
                    if (info.name === 'style.css') {
                        return 'index.css';
                    }
                }
            },
            external: ['siyuan'],
        },
        //构建后是否生成 source map 文件
        sourcemap: false,
    },
})