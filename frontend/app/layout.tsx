import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'SK Asif Hossain | CSE-AIML Developer',
  description: 'Full Stack Developer & AI/ML Enthusiast. BTech Final Year Student specializing in modern web technologies and artificial intelligence.',
  keywords: ['SK Asif Hossain', 'Full Stack Developer', 'AI ML', 'CSE', 'Portfolio', 'Next.js', 'React'],
  authors: [{ name: 'SK Asif Hossain' }],
  openGraph: {
    title: 'SK Asif Hossain | CSE-AIML Developer',
    description: 'Full Stack Developer & AI/ML Enthusiast',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="bg-deep-dark text-slate-200 antialiased">
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111827',
                color: '#E2E8F0',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '12px',
                fontFamily: 'Sora, sans-serif',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
