import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config/environment';

// Get Supabase credentials from centralized config
const supabaseUrl = appConfig.supabaseUrl;
const supabaseAnonKey = appConfig.supabaseAnonKey;

// Debug logging for environment variables
console.log('🔧 Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
  environment: import.meta.env.MODE || 'unknown',
  isDevelopment: appConfig.isDevelopment,
  isProduction: appConfig.isProduction
});

// Check if environment variables are available and valid
export const hasSupabaseConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey.length > 20
  && supabaseAnonKey !== 'your-anon-key-here'
);

console.log('✅ Supabase config valid:', hasSupabaseConfig);

// Log more detailed info for debugging production issues
if (!hasSupabaseConfig) {
  console.error('❌ Supabase configuration missing:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing',
    urlValid: supabaseUrl ? supabaseUrl.startsWith('https://') : false,
    urlNotPlaceholder: supabaseUrl !== 'https://your-project-id.supabase.co',
    keyValid: supabaseAnonKey ? supabaseAnonKey.length > 20 : false
    keyNotPlaceholder: supabaseAnonKey !== 'your-anon-key-here'
  });
}

// Create Supabase client only if config is available
export const supabase = hasSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Enhanced connection test with better error reporting
export const testSupabaseConnection = async () => {
  if (!supabase) {
    const reason = !hasSupabaseConfig ? 'Invalid configuration' : 'Client not initialized';
    console.log('❌ No supabase client available:', reason);
    return { 
      success: false, 
      error: `Supabase not configured: ${reason}`,
      details: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlValid: supabaseUrl ? supabaseUrl.startsWith('https://') : false,
        keyValid: supabaseAnonKey ? supabaseAnonKey.length > 20 : false
      }
    };
  }
  
  try {
    console.log('🔍 Testing connection to Supabase...', {
      url: supabaseUrl.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    });
    
    // Test with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    // Test auth connection - this is the most basic test
    const { data, error } = await supabase.auth.getSession();
    clearTimeout(timeoutId);
    
    if (error) {
      console.log('❌ Connection test failed:', {
        message: error.message,
        status: error.status,
        details: error
      });
      return { 
        success: false, 
        error: `Auth connection failed: ${error.message}`,
        details: error
      };
    }
    
    console.log('✅ Connection test successful', {
      hasSession: !!data.session,
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: true, 
      error: null,
      details: {
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at,
        user: data.session?.user?.email
      }
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? 
      (err.name === 'AbortError' ? 'Connection timeout' : err.message) : 
      'Network error';
    
    console.log('❌ Connection test error:', {
      message: errorMessage,
      error: err,
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: false, 
      error: errorMessage,
      details: err
    };
  }
};

// Auto-test connection on module load in development
if (appConfig.isDevelopment && hasSupabaseConfig) {
  console.log('🔄 Auto-testing Supabase connection in development...');
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('🎉 Supabase connection verified!');
    } else {
      console.warn('⚠️ Supabase connection test failed:', result.error);
    }
  });
}

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: 'client' | 'admin';
  organization_id?: string;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'failed';
  executions: number;
  success_rate: number;
  last_run?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  metric_name: string;
  metric_value: string;
  date: string;
  created_at: string;
}