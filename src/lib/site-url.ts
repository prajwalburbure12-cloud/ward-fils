function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function getEnvSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_URL ||
    '';

  const normalized = normalizeOrigin(candidate);
  return normalized || 'http://localhost:3000';
}

export function resolveRequestSiteUrl(
  hostHeader: string | null,
  protoHeader: string | null
): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '';
  if (explicit.trim()) {
    return normalizeOrigin(explicit);
  }

  const host = hostHeader?.split(',')[0]?.trim();
  if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    const proto = protoHeader?.split(',')[0]?.trim() || 'https';
    return `${proto}://${host}`.replace(/\/+$/, '');
  }

  return getEnvSiteUrl();
}
