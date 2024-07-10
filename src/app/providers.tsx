// src/app/providers.tsx

'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Props for the Providers component.
 */
interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers component that wraps the application with necessary providers.
 * @param {ProvidersProps} props - The props for the Providers component.
 * @returns {JSX.Element} The rendered Providers component.
 */
export default function Providers({ children }: ProvidersProps): JSX.Element {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
