import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        {/* Title & Description */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Page non trouvée
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été supprimée.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/explorer"
            className="block w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
          >
            Explorer
          </Link>
        </div>
      </div>
    </div>
  );
}