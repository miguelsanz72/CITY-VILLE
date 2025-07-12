module.exports = {
  plugins: [
    // Import CSS files
    require('postcss-import')({
      path: ['src/styles', 'node_modules']
    }),
    
    // Nested CSS rules
    require('postcss-nested'),
    
    // CSS custom properties (variables)
    require('postcss-custom-properties')({
      preserve: false,
      importFrom: [
        'src/styles/variables.css',
        'src/styles/themes/default.css'
      ]
    }),
    
    // CSS custom media queries
    require('postcss-custom-media')({
      preserve: false,
      importFrom: [
        'src/styles/media-queries.css'
      ]
    }),
    
    // CSS custom selectors
    require('postcss-custom-selectors')({
      preserve: false
    }),
    
    // Modern CSS features
    require('postcss-preset-env')({
      stage: 2,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'custom-selectors': true,
        'media-query-ranges': true,
        'logical-properties-and-values': true,
        'prefers-color-scheme-query': true,
        'gap-properties': true,
        'overflow-shorthand': true,
        'place-properties': true,
        'color-functional-notation': true,
        'hexadecimal-alpha-notation': true,
        'lab-function': true,
        'oklab-function': true,
        'color-mix': true
      },
      browsers: [
        'last 2 Chrome versions',
        'last 2 Firefox versions',
        'last 2 Safari versions',
        'last 2 Edge versions',
        'not dead',
        '> 0.5%'
      ],
      autoprefixer: {
        flexbox: 'no-2009',
        grid: 'autoplace'
      }
    }),
    
    // Tailwind CSS (if using)
    process.env.USE_TAILWIND === 'true' && require('tailwindcss'),
    
    // CSS Modules
    require('postcss-modules')({
      generateScopedName: process.env.NODE_ENV === 'production'
        ? '[hash:base64:8]'
        : '[name]__[local]--[hash:base64:5]',
      hashPrefix: 'cityville',
      exportGlobals: true
    }),
    
    // Flexbox bugs fixes
    require('postcss-flexbugs-fixes'),
    
    // Normalize CSS
    require('postcss-normalize')({
      forceImport: true
    }),
    
    // CSS optimization for production
    process.env.NODE_ENV === 'production' && require('cssnano')({
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true
          },
          normalizeWhitespace: true,
          colormin: true,
          convertValues: true,
          discardDuplicates: true,
          discardEmpty: true,
          discardOverridden: true,
          discardUnused: true,
          mergeIdents: true,
          mergeLonghand: true,
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true,
          minifyParams: true,
          minifySelectors: true,
          normalizeCharset: true,
          normalizeDisplayValues: true,
          normalizePositions: true,
          normalizeRepeatStyle: true,
          normalizeString: true,
          normalizeTimingFunctions: true,
          normalizeUnicode: true,
          normalizeUrl: true,
          orderedValues: true,
          reduceIdents: true,
          reduceInitial: true,
          reduceTransforms: true,
          svgo: true,
          uniqueSelectors: true
        }
      ]
    }),
    
    // Critical CSS extraction
    process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
      content: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: {
        standard: [
          /^react-/,
          /^game-/,
          /^cityville-/,
          /^tooltip/,
          /^modal/,
          /^dropdown/,
          /^loading/,
          /^error/,
          /^success/,
          /^warning/,
          /^info/
        ],
        deep: [
          /data-theme/,
          /data-mode/,
          /\.dark/,
          /\.light/
        ],
        greedy: [
          /^hljs/,
          /^CodeMirror/,
          /^cm-/
        ]
      },
      blocklist: [
        /^debug-/,
        /^test-/
      ]
    }),
    
    // Unused CSS removal
    process.env.NODE_ENV === 'production' && require('postcss-discard-unused')({
      fontFace: true,
      counterStyle: true,
      keyframes: true,
      namespace: true
    }),
    
    // Sort CSS properties
    process.env.NODE_ENV === 'production' && require('postcss-sorting')({
      order: [
        'custom-properties',
        'dollar-variables',
        'declarations',
        'at-rules',
        'rules'
      ],
      'properties-order': 'alphabetical',
      'unspecified-properties-position': 'bottom'
    }),
    
    // CSS stats and reporting
    process.env.ANALYZE_CSS === 'true' && require('postcss-reporter')({
      clearReportedMessages: true,
      throwError: false
    }),
    
    // Game-specific optimizations
    require('postcss-will-change'),
    require('postcss-transform-shortcut'),
    
    // Performance optimizations
    require('postcss-combine-duplicated-selectors')({
      removeDuplicatedProperties: true
    }),
    
    // Browser compatibility
    require('postcss-opacity'),
    require('postcss-pseudoelements'),
    require('postcss-vmin'),
    require('postcss-will-change-transition'),
    
    // Accessibility improvements
    require('postcss-focus-visible'),
    require('postcss-focus-within'),
    
    // Modern layout features
    require('postcss-logical')({
      preserve: true
    }),
    
    // Color enhancements
    require('postcss-color-function'),
    require('postcss-color-gray'),
    require('postcss-color-hex-alpha'),
    require('postcss-color-hsl'),
    require('postcss-color-hwb'),
    require('postcss-color-rebeccapurple'),
    
    // Font optimizations
    require('postcss-font-variant'),
    require('postcss-font-family-system-ui'),
    
    // Image optimizations
    require('postcss-image-set-function'),
    
    // Animation optimizations
    require('postcss-animation'),
    
    // Development helpers
    process.env.NODE_ENV === 'development' && require('postcss-debug')({
      enabled: true
    })
  ].filter(Boolean)
};