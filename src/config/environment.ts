// Environment configuration helper
export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  appName: string;
  version: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Get configuration from multiple sources with priority:
// 1. Vite environment variables (development) - highest priority
// 2. Global config object (production)
// 3. Fallback values - lowest priority
export function getAppConfig(): AppConfig {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Try to get config from global object (production)
  const globalConfig = (window as any).__APP_CONFIG__ || {};
  
  // Priority: Environment variables > Global config > Fallbacks
  const config: AppConfig = {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 
                globalConfig.SUPABASE_URL || 
                '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 
                    globalConfig.SUPABASE_ANON_KEY || 
                    '',
    appName: globalConfig.APP_NAME || 'ZK.AI Client Portal',
    version: globalConfig.VERSION || '1.0.0',
    isDevelopment,
    isProduction
  };

  // Log configuration source for debugging
  console.log('🔧 Configuration loaded from:', {
    source: import.meta.env.VITE_SUPABASE_URL ? 'Environment Variables' : 
            globalConfig.SUPABASE_URL ? 'Global Config' : 'Fallback',
    hasUrl: !!config.supabaseUrl,
    hasKey: !!config.supabaseAnonKey,
    environment: isDevelopment ? 'development' : 'production'
  });

  // Validate configuration
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    console.warn('⚠️ Missing Supabase configuration:', {
      missingUrl: !config.supabaseUrl,
      missingKey: !config.supabaseAnonKey,
      suggestion: isDevelopment ? 
        'Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY' :
        'Update public/config.js with your Supabase credentials'
    });
  }

  return config;
}

// Export singleton instance
export const appConfig = getAppConfig();