import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prereq - AI-Powered Meeting Prep',
  description: 'Your AI-powered meeting prep assistant. Get personalized briefs on anyone before your meetings, right from LinkedIn.',
  keywords: ['meeting prep', 'AI assistant', 'LinkedIn', 'networking', 'business intelligence'],
  authors: [{ name: 'Prereq Team' }],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Prereq - AI-Powered Meeting Prep',
    description: 'Your AI-powered meeting prep assistant. Get personalized briefs on anyone before your meetings.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Prereq',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prereq - AI-Powered Meeting Prep',
    description: 'Your AI-powered meeting prep assistant. Get personalized briefs on anyone before your meetings.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/regular/style.css"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/bold/style.css"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://unpkg.com/@phosphor-icons/web@2.0.3/src/fill/style.css"
            crossOrigin="anonymous"
          />
        </head>
        <body>
          {children}
          <Script
            src="https://unpkg.com/@phosphor-icons/web@2.0.3"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
