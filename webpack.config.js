const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const isAnalyze = process.env.ANALYZE === 'true';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  
  entry: {
    main: './src/index.tsx',
    // Separate vendor bundle for better caching
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lodash'
    ]
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment 
      ? '[name].js' 
      : '[name].[contenthash:8].js',
    chunkFilename: isDevelopment 
      ? '[name].chunk.js' 
      : '[name].[contenthash:8].chunk.js',
    publicPath: '/',
    clean: true,
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]'
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@game': path.resolve(__dirname, 'src/game'),
      '@ecs': path.resolve(__dirname, 'src/ecs'),
      '@cityville/config': path.resolve(__dirname, 'packages/config/src'),
      '@cityville/ecs-core': path.resolve(__dirname, 'packages/ecs-core/src'),
      '@cityville/proto': path.resolve(__dirname, 'packages/proto/src'),
      '@cityville/ui-react': path.resolve(__dirname, 'packages/ui-react/src')
    },
    fallback: {
      // Node.js polyfills for browser
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      assert: require.resolve('assert'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      fs: false,
      net: false,
      tls: false
    }
  },
  
  module: {
    rules: [
      // TypeScript and JavaScript
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              cacheCompression: false,
              envName: isDevelopment ? 'development' : 'production'
            }
          }
        ]
      },
      
      // CSS and SCSS
      {
        test: /\.(css|scss|sass)$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: true,
                localIdentName: isDevelopment 
                  ? '[name]__[local]--[hash:base64:5]' 
                  : '[hash:base64:8]'
              },
              sourceMap: isDevelopment
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDevelopment
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: isDevelopment,
              sassOptions: {
                includePaths: [path.resolve(__dirname, 'src/styles')]
              }
            }
          }
        ]
      },
      
      // Images
      {
        test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]'
        }
      },
      
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash:8][ext]'
        }
      },
      
      // Audio
      {
        test: /\.(mp3|wav|ogg|m4a)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'audio/[name].[contenthash:8][ext]'
        }
      },
      
      // Videos
      {
        test: /\.(mp4|webm|ogv)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'videos/[name].[contenthash:8][ext]'
        }
      },
      
      // 3D Models and Game Assets
      {
        test: /\.(gltf|glb|fbx|obj|dae)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'models/[name].[contenthash:8][ext]'
        }
      },
      
      // Textures
      {
        test: /\.(hdr|exr|ktx|basis)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'textures/[name].[contenthash:8][ext]'
        }
      },
      
      // Shaders
      {
        test: /\.(glsl|vert|frag|vs|fs)$/i,
        type: 'asset/source'
      },
      
      // JSON and other data files
      {
        test: /\.(json|xml|csv)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'data/[name].[contenthash:8][ext]'
        }
      }
    ]
  },
  
  plugins: [
    // Clean dist folder
    new CleanWebpackPlugin(),
    
    // HTML template
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
      minify: isProduction ? {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      } : false
    }),
    
    // Extract CSS in production
    isProduction && new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css'
    }),
    
    // Copy static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    }),
    
    // Environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || '/'),
      __DEV__: isDevelopment,
      __PROD__: isProduction
    }),
    
    // Provide polyfills
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser'
    }),
    
    // ESLint
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      exclude: 'node_modules',
      emitWarning: isDevelopment,
      emitError: isProduction,
      failOnError: isProduction
    }),
    
    // TypeScript type checking
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json')
      },
      eslint: {
        files: './src/**/*.{ts,tsx,js,jsx}'
      }
    }),
    
    // React Fast Refresh in development
    isDevelopment && new ReactRefreshWebpackPlugin(),
    
    // Compression in production
    isProduction && new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    }),
    
    // Service Worker for PWA
    isProduction && new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5 minutes
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
            }
          }
        }
      ]
    }),
    
    // Bundle analyzer
    isAnalyze && new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ].filter(Boolean),
  
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
            drop_console: true,
            drop_debugger: true
          },
          mangle: {
            safari10: true
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true
          }
        },
        parallel: true
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },
        game: {
          test: /[\\/]src[\\/]game[\\/]/,
          name: 'game',
          chunks: 'all',
          priority: 15
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    
    runtimeChunk: {
      name: 'runtime'
    },
    
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  },
  
  devtool: isDevelopment 
    ? 'eval-cheap-module-source-map' 
    : isProduction 
      ? 'source-map' 
      : false,
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:2567',
        ws: true,
        changeOrigin: true
      }
    }
  },
  
  performance: {
    maxAssetSize: 512000,
    maxEntrypointSize: 512000,
    hints: isProduction ? 'warning' : false
  },
  
  stats: {
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  },
  
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  
  experiments: {
    topLevelAwait: true,
    asyncWebAssembly: true
  }
};