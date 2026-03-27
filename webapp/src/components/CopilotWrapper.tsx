'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with localStorage/window
const AICopilot = dynamic(() => import('@/components/AICopilot'), {
  ssr: false,
});

export default function CopilotWrapper() {
  return <AICopilot />;
}
