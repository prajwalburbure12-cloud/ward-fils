import type { Metadata } from 'next';
import {
  Plus_Jakarta_Sans,
  Noto_Sans_Kannada,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../src/components/LanguageProvider.tsx';
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

const CANONICAL_SITE_URL = 'https://nammaward65hubli.in/';
const SEO_TITLE = 'Namma Ward 65 Hubli | Public Portal';
const SEO_DESCRIPTION =
  'Namma Ward 65 Hubli – Public information, civic services and development updates for Ward No. 65, Hubli, led by Prakash Burbure and Sunita Burbure.';

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_SITE_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: [
    'Namma Ward 65 Hubli',
    'Ward 65 Hubli',
    'HDMC Ward 65',
    'Ward No 65 Hubli',
    'Hubli Ward 65',
    'Ward 65 Public Portal',
    'Namma Ward 65',
    'Hubli Dharwad Municipal Corporation',
    'Prakash Burbure',
    'Sunita Burbure',
    'Dajiban Peth Hubli',
    'Dajibanpeth Hubli',
    'Prakash Burbure Hubli',
    'Sunita Burbure Hubli',
  ],
  alternates: {
    canonical: CANONICAL_SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    url: CANONICAL_SITE_URL,
    siteName: 'Namma Ward 65 Hubli',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '192x192' }],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Namma Ward 65 Hubli | Public Portal',
      alternateName: [
        'Namma Ward 65 Hubli',
        'Ward 65 Hubli',
        'Ward 65 Public Portal',
        'nammaward65hubli',
      ],
      url: CANONICAL_SITE_URL,
      inLanguage: ['en', 'kn'],
    },
    {
      '@type': 'GovernmentOrganization',
      name: 'HDMC Ward 65 – Hubli Dharwad Municipal Corporation',
      alternateName: [
        'Namma Ward 65 Hubli',
        'Ward No 65 Hubli',
        'Hubli Ward 65',
      ],
      url: CANONICAL_SITE_URL,
      logo: `${CANONICAL_SITE_URL}favicon.png`,
      areaServed: {
        '@type': 'Place',
        name: 'Dajiban Peth Hubli, Ward No. 65, Hubballi',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Dajiban Peth, Ward No. 65',
        addressLocality: 'Hubballi',
        addressRegion: 'Karnataka',
        postalCode: '580020',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'Person',
      name: 'Sunita Burbure',
      alternateName: [
        'Smt. Sunita Prakash Burabure',
        'Sunita Burbure Hubli',
        'sunitaburbure',
      ],
      jobTitle: 'Corporator – Ward No. 65 (HDMC)',
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Namma Ward 65 Hubli',
      },
    },
    {
      '@type': 'Person',
      name: 'Prakash Burbure',
      alternateName: ['Prakash Burbure Hubli', 'prakashburbure'],
      jobTitle: 'Ward Operations Head',
      worksFor: {
        '@type': 'GovernmentOrganization',
        name: 'Namma Ward 65 Hubli',
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
