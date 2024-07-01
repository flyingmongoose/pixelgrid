// src/components/LoadingOverlay.tsx
import React from 'react';

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-2xl font-bold text-[#0052FF]">Loading PixelGrid...</div>
    </div>
  );
}
