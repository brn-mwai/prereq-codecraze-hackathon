'use client';

import { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Type declaration for Chrome extension API (used when page runs in Chrome with extension)
declare const chrome: {
  runtime: {
    sendMessage: (extensionId: string, message: object, callback: (response: unknown) => void) => void;
    lastError: { message?: string } | undefined;
  };
} | undefined;

export default function ExtensionAuthPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoaded) return;

    if (!user) {
      // Not logged in, redirect to sign in
      router.push('/sign-in?redirect_url=/auth/extension');
      return;
    }

    // User is logged in, get token and send to extension
    authenticateExtension();
  }, [user, userLoaded]);

  const authenticateExtension = async () => {
    setStatus('authenticating');

    try {
      // Get Clerk session token
      const token = await getToken();

      if (!token) {
        throw new Error('Could not get authentication token');
      }

      // Try to send token to extension
      const extensionId = await detectExtension();

      if (extensionId && typeof chrome !== 'undefined' && chrome?.runtime) {
        // Send token directly to extension
        chrome.runtime.sendMessage(
          extensionId,
          { type: 'PREREQ_AUTH_TOKEN', token },
          () => {
            if (chrome?.runtime?.lastError) {
              console.log('Could not send to extension directly, using postMessage');
              sendTokenViaPostMessage(token);
            } else {
              setStatus('success');
              // Close tab after short delay
              setTimeout(() => window.close(), 1500);
            }
          }
        );
      } else {
        // Fallback: send via postMessage (extension content script will catch it)
        sendTokenViaPostMessage(token);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setStatus('error');
    }
  };

  const detectExtension = async (): Promise<string | null> => {
    // Check if Chrome extension API is available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      return null;
    }

    // Try to detect the extension by its known behavior
    // The extension will respond to a ping
    return new Promise((resolve) => {
      try {
        // Extension ID will be determined at install time
        // For now, try to communicate via postMessage
        resolve(null);
      } catch {
        resolve(null);
      }
    });
  };

  const sendTokenViaPostMessage = (token: string) => {
    // Store token in localStorage for extension to pick up
    localStorage.setItem('prereq_extension_token', token);

    // Also try postMessage for content script
    window.postMessage(
      { type: 'PREREQ_AUTH_TOKEN', token },
      window.location.origin
    );

    setStatus('success');

    // Show success and close
    setTimeout(() => {
      window.close();
    }, 2000);
  };

  const handleRetry = () => {
    setError(null);
    setStatus('loading');
    authenticateExtension();
  };

  return (
    <div className="extension-auth-page">
      <div className="extension-auth-card">
        <div className="extension-auth-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Prereq</span>
        </div>

        {status === 'loading' && (
          <div className="extension-auth-content">
            <div className="spinner"></div>
            <p>Checking authentication...</p>
          </div>
        )}

        {status === 'authenticating' && (
          <div className="extension-auth-content">
            <div className="spinner"></div>
            <p>Connecting to extension...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="extension-auth-content success">
            <div className="success-icon">✓</div>
            <h2>Connected!</h2>
            <p>You can now use Prereq on LinkedIn</p>
            <p className="hint">This tab will close automatically...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="extension-auth-content error">
            <div className="error-icon">!</div>
            <h2>Connection Failed</h2>
            <p>{error || 'Could not connect to extension'}</p>
            <button className="retry-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .extension-auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2ff 0%, #ffffff 100%);
          padding: 24px;
        }

        .extension-auth-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          padding: 48px;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .extension-auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 32px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .extension-auth-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .extension-auth-content p {
          color: #6b7280;
          font-size: 14px;
        }

        .extension-auth-content h2 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .success-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
        }

        .error-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
        }

        .hint {
          font-size: 12px !important;
          color: #9ca3af !important;
        }

        .retry-btn {
          margin-top: 8px;
          padding: 10px 24px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }

        .retry-btn:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
}
