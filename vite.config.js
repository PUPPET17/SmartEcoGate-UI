import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import createVitePlugins from './vite/plugins';

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV, VITE_APP_BACKEND_URL, VITE_APP_BASE_API } = env;

  return {
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: createVitePlugins(env, command === 'build'),
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    },
    server: {
      port: 80,
      host: true,
      open: true,
      proxy: {
        // 开发环境代理
        [VITE_APP_BASE_API]: {
          target: 'http://localhost:8085', // 开发环境后端地址
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp(`^${VITE_APP_BASE_API}`), ''),
        },
      },
    },
    build: {
      // 生产环境配置
      outDir: 'dist',
      assetsDir: 'static',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: true,
        },
      },
    },
    // 生产环境代理配置
    preview: {
      port: 80,
      host: true,
      proxy: {
        // 生产环境代理
        [VITE_APP_BASE_API]: {
          target: VITE_APP_BACKEND_URL, // 使用环境变量中的后端地址
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp(`^${VITE_APP_BASE_API}`), ''),
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove();
                }
              },
            },
          },
        ],
      },
    },
  };
});