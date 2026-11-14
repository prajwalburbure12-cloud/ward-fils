import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Kannada,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../src/components/LanguageProvider.tsx';
import { SiteShell } from '../src/components/SiteShell.tsx';
import { getEnvSiteUrl } from '../src/lib/site-url.ts';

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

const siteUrl = getEnvSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Ward No. 65 – Public Service & Development Portal',
  description:
    'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
  keywords: [
    'Ward 65 Hubli',
    'nammaward65hubli',
    'prakashburbure',
    'sunitaburbure',
    'Namma Ward 65 Hubli',
    'Ward No. 65 Hubballi',
    'Prakash Burbure',
    'Sunita Prakash Burabure',
    'Sunita Burbure',
    'HDMC Ward 65',
    'Hubballi-Dharwad Municipal Corporation',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ward No. 65 – Public Service & Development Portal',
    description:
      'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
    siteName: 'Ward 65 Hubli – nammaward65hubli',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ward No. 65 – Public Service & Development Portal',
    description:
      'Official public service, civic grievance redressal, and ward development portal for HDMC Ward No. 65, Hubballi, Karnataka.',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Ward 65 Hubli',
      alternateName: [
        'nammaward65hubli',
        'Namma Ward 65 Hubli',
        'Ward No. 65 – Public Service & Development Portal',
      ],
      url: siteUrl,
      inLanguage: ['en', 'kn'],
    },
    {
      '@type': 'GovernmentOrganization',
      name: 'Ward 65 Hubli – Hubballi-Dharwad Municipal Corporation',
      alternateName: ['nammaward65hubli', 'HDMC Ward No. 65'],
      url: siteUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Hubballi',
        addressRegion: 'Karnataka',
        postalCode: '580020',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'Person',
      name: 'Smt. Sunita Prakash Burabure',
      alternateName: ['sunitaburbure', 'Sunita Burbure'],
      jobTitle: 'Corporator – Ward No. 65 (HDMC)',
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Ward 65 Hubli',
      },
    },
    {
      '@type': 'Person',
      name: 'Prakash Burbure',
      alternateName: ['prakashburbure'],
      jobTitle: 'Ward Operations Head',
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Ward 65 Hubli',
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LanguageProvider>
          <SiteShell>{children}</SiteShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
