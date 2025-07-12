module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // JSON files
  '*.json': [
    'prettier --write',
    'git add'
  ],

  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
    'git add'
  ],

  // Markdown files
  '*.md': [
    'prettier --write',
    'git add'
  ],

  // CSS and SCSS files
  '*.{css,scss,sass}': [
    'prettier --write',
    'git add'
  ],

  // Go files
  '*.go': [
    'gofmt -w',
    'go vet',
    'git add'
  ],

  // Package.json files
  'package.json': [
    'sort-package-json',
    'prettier --write',
    'git add'
  ],

  // Docker files
  '{Dockerfile*,*.dockerfile}': [
    'hadolint',
    'git add'
  ],

  // Shell scripts
  '*.{sh,bash}': [
    'shellcheck',
    'shfmt -w',
    'git add'
  ],

  // SQL files
  '*.sql': [
    'prettier --write',
    'git add'
  ],

  // Protocol buffer files
  '*.proto': [
    'buf format -w',
    'git add'
  ],

  // Terraform files
  '*.{tf,tfvars}': [
    'terraform fmt',
    'git add'
  ],

  // Kubernetes YAML files
  '*.{k8s,kube}.{yml,yaml}': [
    'kubeval',
    'prettier --write',
    'git add'
  ],

  // Helm templates
  'charts/**/templates/*.{yml,yaml}': [
    'helm lint',
    'prettier --write',
    'git add'
  ],

  // GitHub Actions workflows
  '.github/workflows/*.{yml,yaml}': [
    'actionlint',
    'prettier --write',
    'git add'
  ],

  // Docker Compose files
  'docker-compose*.{yml,yaml}': [
    'docker-compose config -q',
    'prettier --write',
    'git add'
  ],

  // Environment files
  '.env*': [
    'dotenv-linter',
    'git add'
  ],

  // Configuration files
  '*.{toml,ini}': [
    'prettier --write',
    'git add'
  ],

  // XML files
  '*.xml': [
    'xmllint --format',
    'prettier --write',
    'git add'
  ],

  // HTML files
  '*.html': [
    'prettier --write',
    'git add'
  ],

  // Test files - run tests for changed test files
  '*.{test,spec}.{ts,tsx,js,jsx}': [
    'jest --findRelatedTests --passWithNoTests',
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // E2E test files
  '*.e2e.{ts,js}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // Migration files
  'migrations/*.{ts,js,sql}': [
    'prettier --write',
    'git add'
  ],

  // Seed files
  'seeds/*.{ts,js}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // GraphQL files
  '*.{graphql,gql}': [
    'prettier --write',
    'git add'
  ],

  // OpenAPI/Swagger files
  '*.{openapi,swagger}.{yml,yaml,json}': [
    'swagger-codegen validate',
    'prettier --write',
    'git add'
  ],

  // Prisma schema files
  '*.prisma': [
    'prisma format',
    'git add'
  ],

  // Lock files - don't format, just add
  '{package-lock.json,yarn.lock,pnpm-lock.yaml}': [
    'git add'
  ],

  // Generated files - skip formatting
  '*.{generated,gen}.{ts,js}': [
    'git add'
  ],

  // Binary files - just add
  '*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}': [
    'git add'
  ],

  // Certificate files
  '*.{pem,crt,key,p12,pfx}': [
    'git add'
  ],

  // Archive files
  '*.{zip,tar,gz,rar,7z}': [
    'git add'
  ]
};