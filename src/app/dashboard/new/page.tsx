'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBriefPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard where the brief generator is
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="dashboard-page">
      <div className="brief-loading">
        <div className="brief-loading-spinner"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
