import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="auth-logo">
            <Image
              src="/Logo/Logo-full.svg"
              alt="Prereq"
              width={120}
              height={40}
              priority
            />
          </Link>
          <p className="auth-subtitle">Welcome back! Sign in to continue.</p>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: '#1954FA',
              colorText: '#18181b',
              colorTextSecondary: '#71717a',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#18181b',
              borderRadius: '0.5rem',
              fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            elements: {
              rootBox: {
                width: '100%',
              },
              card: {
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '1rem',
                boxShadow: '0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)',
                padding: '1.5rem',
              },
              headerTitle: {
                display: 'none',
              },
              headerSubtitle: {
                display: 'none',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: '0.5rem',
                color: '#3f3f46',
                fontWeight: '500',
              },
              dividerLine: {
                backgroundColor: '#e4e4e7',
              },
              dividerText: {
                color: '#a1a1aa',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
              },
              formFieldLabel: {
                color: '#3f3f46',
                fontSize: '0.875rem',
                fontWeight: '500',
              },
              formFieldInput: {
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4d8',
                borderRadius: '0.5rem',
                color: '#18181b',
                fontSize: '0.9375rem',
              },
              formButtonPrimary: {
                background: 'linear-gradient(to bottom, #2a63fa, #1954FA)',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: 'inset 0 1px 0 0 #4a7dff, 0 1px 3px 0 rgba(0,0,0,0.1)',
                borderBottom: '2px solid #1243c9',
              },
              footerActionLink: {
                color: '#1954FA',
                fontWeight: '500',
              },
              footerActionText: {
                color: '#71717a',
              },
              identityPreviewEditButton: {
                color: '#1954FA',
              },
              formFieldAction: {
                color: '#1954FA',
              },
            },
            layout: {
              socialButtonsPlacement: 'top',
              showOptionalFields: false,
            },
          }}
        />

        <div className="auth-footer">
          <Link href="/" className="auth-back-link">
            <i className="ph ph-arrow-left"></i>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
