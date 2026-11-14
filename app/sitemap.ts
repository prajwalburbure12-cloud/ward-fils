import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getEnvSiteUrl, resolveRequestSiteUrl } from '../src/lib/site-url.ts';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let baseUrl = getEnvSiteUrl();
  try {
    const hdrs = await headers();
    baseUrl = resolveRequestSiteUrl(
      hdrs.get('x-forwarded-host') || hdrs.get('host'),
      hdrs.get('x-forwarded-proto')
    );
  } catch {
    baseUrl = getEnvSiteUrl();
  }

  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/track`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
