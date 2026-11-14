import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getEnvSiteUrl, resolveRequestSiteUrl } from '../src/lib/site-url.ts';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
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

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
