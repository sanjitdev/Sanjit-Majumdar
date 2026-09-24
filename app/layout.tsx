import './globals.css';

import { headers } from 'next/headers';

import { AnalyticsBeacon } from '../components/client/AnalyticsBeacon';
import { ErrorBeacon } from '../components/client/ErrorBeacon';
import { Nav } from '../components/Nav';

export const metadata = {
  title: {
    default: 'Sanjit Majumdar — Senior Software Engineer',
    template: '%s | Sanjit Majumdar',
  },
  description: 'Senior software engineer. I build, ship, and run the gap.',
  metadataBase: new URL('https://sanjit.dev'),
  openGraph: {
    title: 'Sanjit Majumdar — Senior Software Engineer',
    description: 'Senior software engineer. I build, ship, and run the gap.',
    url: 'https://sanjit.dev',
    siteName: 'Sanjit Majumdar',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPath = (await headers()).get('x-pathname') ?? '/';

  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-fg antialiased font-sans">
        <AnalyticsBeacon />
        <ErrorBeacon />
        <Nav currentPath={currentPath} />
        <main id="main">{children}</main>
        <footer role="contentinfo" aria-label="Site footer" />
      </body>
    </html>
  );
}
