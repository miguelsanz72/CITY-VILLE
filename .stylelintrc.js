module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-css-modules',
    'stylelint-config-prettier',
    'stylelint-config-rational-order'
  ],
  
  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-config-rational-order/plugin',
    'stylelint-declaration-block-no-ignored-properties',
    'stylelint-high-performance-animation',
    'stylelint-no-unsupported-browser-features',
    'stylelint-a11y'
  ],
  
  rules: {
    // Possible errors
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'string-no-newline': true,
    'unit-no-unknown': true,
    'property-no-unknown': true,
    'keyframe-declaration-no-important': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'block-no-empty': true,
    'selector-pseudo-class-no-unknown': true,
    'selector-pseudo-element-no-unknown': true,
    'selector-type-no-unknown': true,
    'media-feature-name-no-unknown': true,
    'at-rule-no-unknown': null,
    'comment-no-empty': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,
    'no-empty-source': true,
    'no-extra-semicolons': true,
    'no-invalid-double-slash-comments': true,
    
    // Limit language features
    'color-named': 'never',
    'color-no-hex': null,
    'declaration-no-important': null,
    'declaration-property-value-blacklist': null,
    'declaration-property-value-whitelist': null,
    'function-blacklist': null,
    'function-url-scheme-blacklist': null,
    'function-url-scheme-whitelist': null,
    'function-whitelist': null,
    'media-feature-name-blacklist': null,
    'media-feature-name-value-whitelist': null,
    'media-feature-name-whitelist': null,
    'property-blacklist': null,
    'property-whitelist': null,
    'selector-attribute-operator-blacklist': null,
    'selector-attribute-operator-whitelist': null,
    'selector-combinator-blacklist': null,
    'selector-combinator-whitelist': null,
    'selector-pseudo-class-blacklist': null,
    'selector-pseudo-class-whitelist': null,
    'selector-pseudo-element-blacklist': null,
    'selector-pseudo-element-whitelist': null,
    'unit-blacklist': null,
    'unit-whitelist': null,
    
    // Stylistic issues
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'font-family-name-quotes': 'always-where-recommended',
    'font-weight-notation': 'numeric',
    'function-comma-newline-after': 'always-multi-line',
    'function-comma-newline-before': 'never-multi-line',
    'function-comma-space-after': 'always-single-line',
    'function-comma-space-before': 'never',
    'function-max-empty-lines': 0,
    'function-name-case': 'lower',
    'function-parentheses-newline-inside': 'always-multi-line',
    'function-parentheses-space-inside': 'never-single-line',
    'function-url-quotes': 'always',
    'function-whitespace-after': 'always',
    'number-leading-zero': 'always',
    'number-no-trailing-zeros': true,
    'string-quotes': 'single',
    'length-zero-no-unit': true,
    'unit-case': 'lower',
    'value-keyword-case': 'lower',
    'value-list-comma-newline-after': 'always-multi-line',
    'value-list-comma-newline-before': 'never-multi-line',
    'value-list-comma-space-after': 'always-single-line',
    'value-list-comma-space-before': 'never',
    'value-list-max-empty-lines': 0,
    'custom-property-empty-line-before': 'always',
    'property-case': 'lower',
    'declaration-bang-space-after': 'never',
    'declaration-bang-space-before': 'always',
    'declaration-colon-newline-after': 'always-multi-line',
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    'declaration-empty-line-before': 'always',
    'declaration-block-semicolon-newline-after': 'always-multi-line',
    'declaration-block-semicolon-newline-before': 'never-multi-line',
    'declaration-block-semicolon-space-after': 'always-single-line',
    'declaration-block-semicolon-space-before': 'never',
    'declaration-block-trailing-semicolon': 'always',
    'block-closing-brace-empty-line-before': 'never',
    'block-closing-brace-newline-after': 'always',
    'block-closing-brace-newline-before': 'always-multi-line',
    'block-closing-brace-space-before': 'always-single-line',
    'block-opening-brace-newline-after': 'always-multi-line',
    'block-opening-brace-space-after': 'always-single-line',
    'block-opening-brace-space-before': 'always',
    'selector-attribute-brackets-space-inside': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-operator-space-before': 'never',
    'selector-attribute-quotes': 'always',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'selector-descendant-combinator-no-non-space': true,
    'selector-pseudo-class-case': 'lower',
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'selector-pseudo-element-case': 'lower',
    'selector-pseudo-element-colon-notation': 'double',
    'selector-type-case': 'lower',
    'selector-list-comma-newline-after': 'always',
    'selector-list-comma-newline-before': 'never-multi-line',
    'selector-list-comma-space-after': 'always-single-line',
    'selector-list-comma-space-before': 'never',
    'rule-empty-line-before': 'always-multi-line',
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'media-feature-name-case': 'lower',
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-range-operator-space-before': 'always',
    'media-query-list-comma-newline-after': 'always-multi-line',
    'media-query-list-comma-newline-before': 'never-multi-line',
    'media-query-list-comma-space-after': 'always-single-line',
    'media-query-list-comma-space-before': 'never',
    'at-rule-empty-line-before': 'always',
    'at-rule-name-case': 'lower',
    'at-rule-name-space-after': 'always-single-line',
    'at-rule-semicolon-newline-after': 'always',
    'at-rule-semicolon-space-before': 'never',
    'comment-empty-line-before': 'always',
    'comment-whitespace-inside': 'always',
    'indentation': 2,
    'linebreaks': 'unix',
    'max-empty-lines': 1,
    'max-line-length': 100,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,
    'no-empty-first-line': true,
    
    // SCSS specific rules
    'scss/at-extend-no-missing-placeholder': true,
    'scss/at-function-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/at-import-no-partial-leading-underscore': true,
    'scss/at-import-partial-extension-blacklist': ['scss'],
    'scss/at-mixin-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/at-rule-no-unknown': true,
    'scss/dollar-variable-colon-space-after': 'always',
    'scss/dollar-variable-colon-space-before': 'never',
    'scss/dollar-variable-pattern': '^[_]?[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/percent-placeholder-pattern': '^[a-z]+([a-z0-9-]+[a-z0-9]+)?$',
    'scss/selector-no-redundant-nesting-selector': true,
    
    // Order rules
    'order/order': [
      'custom-properties',
      'dollar-variables',
      {
        type: 'at-rule',
        name: 'extend'
      },
      {
        type: 'at-rule',
        name: 'include',
        hasBlock: false
      },
      'declarations',
      {
        type: 'at-rule',
        name: 'include',
        hasBlock: true
      },
      'rules'
    ],
    
    // Performance rules
    'plugin/no-low-performance-animation-properties': true,
    
    // Browser compatibility
    'plugin/no-unsupported-browser-features': [
      true,
      {
        browsers: [
          'last 2 Chrome versions',
          'last 2 Firefox versions',
          'last 2 Safari versions',
          'last 2 Edge versions'
        ],
        ignore: [
          'css-appearance',
          'css-resize',
          'css-masks',
          'css-clip-path',
          'css-backdrop-filter'
        ]
      }
    ],
    
    // Accessibility rules
    'a11y/content-property-no-static-value': true,
    'a11y/font-size-is-readable': true,
    'a11y/line-height-is-vertical-rhythmed': true,
    'a11y/media-prefers-reduced-motion': true,
    'a11y/no-outline-none': true,
    'a11y/selector-pseudo-class-focus': true,
    
    // Game-specific rules
    'max-nesting-depth': 4,
    'selector-max-compound-selectors': 4,
    'selector-max-id': 0,
    'selector-max-specificity': '0,4,0',
    'selector-max-universal': 1,
    'selector-no-qualifying-type': true,
    
    // CSS Modules specific
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['export', 'import', 'global', 'local', 'external']
      }
    ],
    
    // Custom game properties
    'custom-property-pattern': '^(cityville|game|ui|theme)-[a-z0-9-]+$',
    
    // Animation performance
    'declaration-property-value-blacklist': {
      '/^animation/': ['/ease/'],
      '/^transition/': ['/ease/']
    }
  },
  
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    {
      files: ['**/*.module.{css,scss}'],
      rules: {
        'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$'
      }
    },
    {
      files: ['**/themes/**/*.{css,scss}'],
      rules: {
        'custom-property-pattern': '^theme-[a-z0-9-]+$'
      }
    },
    {
      files: ['**/components/**/*.{css,scss}'],
      rules: {
        'selector-class-pattern': '^[a-z][a-zA-Z0-9]+(__[a-z][a-zA-Z0-9]+)?(--[a-z][a-zA-Z0-9]+)?$'
      }
    }
  ],
  
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    '.next/**/*',
    'coverage/**/*',
    '**/*.min.css',
    '**/vendor/**/*'
  ]
};