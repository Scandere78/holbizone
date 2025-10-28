'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import { logger } from '@/lib/logger';
import { useRouter } from 'next/navigation';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  const router = useRouter();

  const handleError = (error: Error, info: { componentStack?: string | null }) => {
    logger.error({
      context: 'GlobalErrorBoundary',
      action: 'React Error Boundary caught error',
      error,
      details: {
        componentStack: info.componentStack,
      },
    });
  };

  const handleReset = () => {
    router.push('/');
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
}