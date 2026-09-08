import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      // Ensure JSX is processed in both .js and .jsx files
      include: [/\.jsx$/, /\.js$/],
    }),
    svgr(),
  ],
  esbuild: {
    // Remove explicit loader for .js files to avoid conflicts with react plugin
    // The react plugin handles JSX transformation
    logOverride: {
      'expression-expected': 'silent', // Suppress the specific error for debugging
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'OpenIMISFeCore',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'es' : 'cjs'}.js`,
    },
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom',
        'redux',
        'redux-thunk',
        'redux-api-middleware',
        'react-redux',
        'react-intl',
        'react-helmet',
        'react-multi-date-picker',
        'prop-types',
        'react-date-object/calendars/gregorian',
        'react-date-object/locales/gregorian_en',
        'nepali-date-converter',
        'moment',
        'dayjs',
        'lodash',
        'lodash/debounce',
        'lodash-uuid',
        'classnames',
        'clsx',
        'react-router',
        'react-router-dom',
        'history',
        /^@mui\/material/,
        /^@mui\/icons-material/,
        /^@mui\/x-date-pickers/,
        /^@emotion\/react/,
        /^@emotion\/styled/,
        /^@emotion\/cache/,
        /^@sentry\/react/,
        '@date-io/core',
        '@date-io/moment',
        'zxcvbn',
        /^@babel-.*/,
        /^@openimis/
      ],
      output: {
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});