module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '18',
          browsers: [
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Safari versions',
            'last 2 Edge versions',
            'not dead',
            '> 0.5%'
          ]
        },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
        loose: true,
        bugfixes: true,
        shippedProposals: true
      }
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        development: process.env.NODE_ENV === 'development',
        importSource: 'react'
      }
    ],
    [
      '@babel/preset-typescript',
      {
        isTSX: true,
        allExtensions: true,
        allowNamespaces: true,
        allowDeclareFields: true,
        onlyRemoveTypeImports: true
      }
    ]
  ],
  plugins: [
    // Proposal plugins
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-proposal-json-strings',
    
    // Transform plugins
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-async-to-generator',
    '@babel/plugin-transform-arrow-functions',
    '@babel/plugin-transform-block-scoping',
    '@babel/plugin-transform-classes',
    '@babel/plugin-transform-destructuring',
    '@babel/plugin-transform-for-of',
    '@babel/plugin-transform-parameters',
    '@babel/plugin-transform-shorthand-properties',
    '@babel/plugin-transform-spread',
    '@babel/plugin-transform-template-literals',
    
    // React specific plugins
    'babel-plugin-react-remove-properties',
    
    // Development plugins
    process.env.NODE_ENV === 'development' && 'react-refresh/babel',
    
    // Production optimizations
    process.env.NODE_ENV === 'production' && [
      'babel-plugin-transform-react-remove-prop-types',
      {
        mode: 'remove',
        removeImport: true,
        additionalLibraries: ['react-immutable-proptypes']
      }
    ],
    
    // Game-specific optimizations
    process.env.NODE_ENV === 'production' && [
      'babel-plugin-transform-remove-console',
      {
        exclude: ['error', 'warn']
      }
    ],
    
    // Bundle size optimizations
    process.env.NODE_ENV === 'production' && [
      'babel-plugin-transform-imports',
      {
        'lodash': {
          transform: 'lodash/${member}',
          preventFullImport: true
        },
        'date-fns': {
          transform: 'date-fns/${member}',
          preventFullImport: true
        },
        '@mui/material': {
          transform: '@mui/material/${member}',
          preventFullImport: true
        },
        '@mui/icons-material': {
          transform: '@mui/icons-material/${member}',
          preventFullImport: true
        }
      }
    ],
    
    // Styled components
    [
      'babel-plugin-styled-components',
      {
        ssr: true,
        displayName: process.env.NODE_ENV === 'development',
        fileName: process.env.NODE_ENV === 'development',
        minify: process.env.NODE_ENV === 'production',
        transpileTemplateLiterals: process.env.NODE_ENV === 'production',
        pure: process.env.NODE_ENV === 'production'
      }
    ],
    
    // Emotion
    [
      '@emotion/babel-plugin',
      {
        sourceMap: process.env.NODE_ENV === 'development',
        autoLabel: process.env.NODE_ENV === 'development' ? 'dev-only' : 'never',
        labelFormat: '[local]',
        cssPropOptimization: process.env.NODE_ENV === 'production'
      }
    ],
    
    // GraphQL
    [
      'babel-plugin-relay',
      {
        schema: './schema.graphql',
        artifactDirectory: './src/__generated__'
      }
    ],
    
    // Macros
    'babel-plugin-macros',
    
    // Module resolver
    [
      'babel-plugin-module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@pages': './src/pages',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@store': './src/store',
          '@types': './src/types',
          '@assets': './src/assets',
          '@styles': './src/styles',
          '@config': './src/config',
          '@services': './src/services',
          '@game': './src/game',
          '@ecs': './src/ecs',
          '@cityville/config': './packages/config/src',
          '@cityville/ecs-core': './packages/ecs-core/src',
          '@cityville/proto': './packages/proto/src',
          '@cityville/ui-react': './packages/ui-react/src'
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
      }
    ]
  ].filter(Boolean),
  
  env: {
    development: {
      plugins: [
        // Development-only plugins
        'react-refresh/babel'
      ]
    },
    production: {
      plugins: [
        // Production-only plugins
        [
          'babel-plugin-transform-react-remove-prop-types',
          {
            mode: 'remove',
            removeImport: true,
            additionalLibraries: ['react-immutable-proptypes']
          }
        ],
        [
          'babel-plugin-transform-remove-console',
          {
            exclude: ['error', 'warn']
          }
        ]
      ]
    },
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            },
            modules: 'commonjs'
          }
        ],
        [
          '@babel/preset-react',
          {
            runtime: 'automatic'
          }
        ],
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        'babel-plugin-dynamic-import-node'
      ]
    }
  },
  
  // Source maps
  sourceMaps: process.env.NODE_ENV === 'development',
  
  // Compact output in production
  compact: process.env.NODE_ENV === 'production',
  
  // Comments
  comments: process.env.NODE_ENV === 'development',
  
  // Minification
  minified: process.env.NODE_ENV === 'production',
  
  // Ignore patterns
  ignore: [
    'node_modules/**',
    '**/*.test.js',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/*.spec.js',
    '**/*.spec.ts',
    '**/*.spec.tsx',
    '**/*.stories.js',
    '**/*.stories.ts',
    '**/*.stories.tsx',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**'
  ],
  
  // Only transform specific file extensions
  only: [
    './src/**/*.js',
    './src/**/*.jsx',
    './src/**/*.ts',
    './src/**/*.tsx',
    './apps/**/*.js',
    './apps/**/*.jsx',
    './apps/**/*.ts',
    './apps/**/*.tsx',
    './packages/**/*.js',
    './packages/**/*.jsx',
    './packages/**/*.ts',
    './packages/**/*.tsx'
  ],
  
  // Assumptions for better performance
  assumptions: {
    constantReexports: true,
    constantSuper: true,
    enumerableModuleMeta: true,
    ignoreFunctionLength: true,
    ignoreToPrimitiveHint: true,
    iterableIsArray: true,
    mutableTemplateObject: true,
    noClassCalls: true,
    noDocumentAll: true,
    noNewArrows: true,
    objectRestNoSymbols: true,
    privateFieldsAsProperties: true,
    pureGetters: true,
    setClassMethods: true,
    setComputedProperties: true,
    setPublicClassFields: true,
    setSpreadProperties: true,
    skipForOfIteratorClosing: true,
    superIsCallableConstructor: true
  }
};