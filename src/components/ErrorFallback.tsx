'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 border border-red-200 dark:border-red-900">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">
            Quelque chose s'est mal passé
          </h1>

          {/* Description */}
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            Une erreur inattendue s'est produite. Veuillez réessayer.
          </p>

          {/* Error Message (Dev only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-md mb-6 border border-red-200 dark:border-red-900">
              <p className="text-sm text-red-700 dark:text-red-300 font-mono break-words">
                {error.message}
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}