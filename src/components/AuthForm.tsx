import React from 'react';
import { useState, useEffect } from 'react';
import { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase, hasSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import { Zap } from 'lucide-react';

export default function AuthForm() {
  const [connectionStatus, setConnectionStatus] = useState<{
    testing: boolean;
    result: { success: boolean; error: string | null; details?: any } | null;
  }>({ testing: false, result: null });

  // Clear any preview mode artifacts on auth form load
  React.useEffect(() => {
    console.log('🔐 AuthForm mounted - clearing any preview artifacts');
    sessionStorage.removeItem('preview-mode-bypass');
    sessionStorage.removeItem('demo-user');
    localStorage.removeItem('preview-session');
  }, []);

  // Test connection when component mounts
  useEffect(() => {
    if (hasSupabaseConfig && supabase) {
      setConnectionStatus({ testing: true, result: null });
      testSupabaseConnection().then(result => {
        setConnectionStatus({ testing: false, result });
      });
    }
  }, []);

  const handleTestConnection = async () => {
    setConnectionStatus({ testing: true, result: null });
    const result = await testSupabaseConnection();
    setConnectionStatus({ testing: false, result });
  };

  // Show error if Supabase is not configured
  if (!hasSupabaseConfig || !supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-3xl font-bold text-white">
              Configuration Required
            </h1>
            <p className="mt-2 text-sm text-purple-300">
              Please configure Supabase credentials to enable authentication
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-purple-500/20">
            <div className="text-center">
              <p className="text-purple-300 mb-4">
                Add your Supabase credentials to the .env file to enable authentication.
              </p>
              <div className="text-xs text-purple-400 mb-4">
                <p>Required environment variables in .env file:</p>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• VITE_SUPABASE_URL</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-white transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white">
            Welcome to ZK.AI
          </h1>
          <p className="mt-2 text-sm text-purple-300">
            Access your client portal and manage your AI workflows
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-slate-800/30 backdrop-blur-xl py-4 px-6 rounded-xl border border-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus.testing ? 'bg-yellow-400 animate-pulse' :
                connectionStatus.result?.success ? 'bg-green-400' : 'bg-red-400'
              }`} />
              <span className="text-sm text-purple-300">
                {connectionStatus.testing ? 'Testing connection...' :
                 connectionStatus.result?.success ? 'Connected to Supabase' :
                 connectionStatus.result ? 'Connection failed' : 'Not tested'}
              </span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus.testing}
              className="text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50"
            >
              Test
            </button>
          </div>
          {connectionStatus.result && !connectionStatus.result.success && (
            <div className="mt-2 text-xs text-red-300">
              {connectionStatus.result.error}
            </div>
          )}
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-purple-500/20">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7c3aed',
                    brandAccent: '#6d28d9',
                    inputBackground: 'rgba(51, 65, 85, 0.5)',
                    inputText: 'white',
                    inputPlaceholder: 'rgba(196, 181, 253, 0.6)',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
            onlyThirdPartyProviders={false}
          />
        </div>
        
        <div className="text-center">
          <p className="text-xs text-purple-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}