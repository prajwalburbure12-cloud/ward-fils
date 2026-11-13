import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Kannada,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../src/components/LanguageProvider.tsx';
import { AuthProvider } from '../src/components/AuthProvider.tsx';
import { SiteShell } from '../src/components/SiteShell.tsx';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
});

const notoKannada = Noto_Sans_Kannada({
  subsets: ['kannada'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kannada',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Ward No. 65 – Public Service & Development Portal',
  description:
    'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
  openGraph: {
    title: 'Ward No. 65 – Public Service & Development Portal',
    description:
      'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ward No. 65 – Public Service & Development Portal',
    description:
      'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${notoKannada.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="font-sans antialiased">
        <LanguageProvider>
          <AuthProvider>
            <SiteShell>{children}</SiteShell>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
