// 环境配置检查工具
export interface EnvironmentConfig {
  supabase: {
    url: string
    anonKey: string
  }
  cloudflare: {
    accountId: string
    streamToken: string
  }
  app: {
    env: 'development' | 'production' | 'staging'
    nodeEnv: string
  }
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    cloudflare: {
      accountId: import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID || '',
      streamToken: import.meta.env.VITE_CLOUDFLARE_STREAM_TOKEN || '',
    },
    app: {
      env: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'production' | 'staging',
      nodeEnv: import.meta.env.NODE_ENV || 'development',
    },
  }
}

export const validateEnvironmentConfig = (): { isValid: boolean; errors: string[] } => {
  const config = getEnvironmentConfig()
  const errors: string[] = []

  // 检查 Supabase 配置
  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required')
  }
  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required')
  }

  // 在生产环境检查 Cloudflare 配置
  if (config.app.env === 'production') {
    if (!config.cloudflare.accountId) {
      errors.push('VITE_CLOUDFLARE_ACCOUNT_ID is required in production')
    }
    if (!config.cloudflare.streamToken) {
      errors.push('VITE_CLOUDFLARE_STREAM_TOKEN is required in production')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const isDevelopment = (): boolean => {
  const config = getEnvironmentConfig()
  return config.app.env === 'development'
}

export const isProduction = (): boolean => {
  const config = getEnvironmentConfig()
  return config.app.env === 'production'
}

export const logEnvironmentInfo = (): void => {
  const config = getEnvironmentConfig()
  const validation = validateEnvironmentConfig()

  console.group('🌍 Environment Configuration')
  console.log('Environment:', config.app.env)
  console.log('Node Environment:', config.app.nodeEnv)
  console.log('Supabase URL:', config.supabase.url)
  console.log('Supabase Key:', config.supabase.anonKey ? '✅ Configured' : '❌ Missing')
  console.log('Cloudflare Account ID:', config.cloudflare.accountId ? '✅ Configured' : '❌ Missing')
  console.log('Cloudflare Stream Token:', config.cloudflare.streamToken ? '✅ Configured' : '❌ Missing')

  if (!validation.isValid) {
    console.group('⚠️ Configuration Errors')
    validation.errors.forEach(error => console.error(error))
    console.groupEnd()
  } else {
    console.log('✅ All required configuration is valid')
  }
  console.groupEnd()

  // 在开发环境下显示详细信息
  if (isDevelopment() && !validation.isValid) {
    console.warn('Some configuration is missing but app can still run in development mode')
  }
}

// 开发模式下自动打印环境信息
if (isDevelopment()) {
  logEnvironmentInfo()
}