System.config({
  transpiler: 'plugin-babel',
  map: {
    'plugin-babel': 'https://unpkg.com/systemjs-plugin-babel@0.0.25/plugin-babel.js',
    'systemjs-babel-build': 'https://unpkg.com/systemjs-plugin-babel@0.0.25/systemjs-babel-browser.js',
    'react': 'https://unpkg.com/react@17/umd/react.production.min.js',
    'react-dom': 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
    'recharts': 'https://unpkg.com/recharts@2.1.9/umd/Recharts.js',
    'lucide-react': 'https://unpkg.com/lucide-react@0.263.1/dist/umd/lucide-react.min.js',
    'prop-types': 'https://unpkg.com/prop-types@15.8.1/prop-types.min.js',
    'clsx': 'https://unpkg.com/clsx@1.1.1/dist/clsx.min.js',
    'tailwind-merge': 'https://unpkg.com/tailwind-merge@1.14.0/dist/bundle-umd.js'
  },
  meta: {
    '*.js': {
      babelOptions: {
        react: true
      }
    }
  }
});
