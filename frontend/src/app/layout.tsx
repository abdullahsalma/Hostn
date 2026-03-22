import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Hostn – Find Your Perfect Getaway',
  description:
    'Discover and book unique chalets, villas, apartments, farms, and more. Your perfect stay is just a search away.',
  keywords: 'vacation rental, chalet, villa, apartment, booking, getaway, hostn',
  openGraph: {
    title: 'Hostn – Find Your Perfect Getaway',
    description: 'Discover unique stays across the region',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e1e2e',
                color: '#fff',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
