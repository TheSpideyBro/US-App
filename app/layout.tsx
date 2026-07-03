import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Us — I Miss You',
  description: 'A love journal for when we are apart.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-white">
        <Navbar />
        <div className="max-w-6xl mx-auto">{children}</div>
      </body>
    </html>
  );
}
