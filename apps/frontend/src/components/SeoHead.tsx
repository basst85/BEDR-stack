type SeoHeadProps = {
  title: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

import { Helmet } from 'react-helmet-async';

const defaultDescription = 'CrossVillage Zeddam met verwarmde woonunits voor het EK Veldrijden 2026.';
const siteName = 'CrossVillage Zeddam';
const defaultMetaImagePath = `${import.meta.env.BASE_URL}logo-crossvillage.jpg`;

export function SeoHead({ title, description, robots, canonicalPath, jsonLd }: SeoHeadProps) {
  const metaDescription = description ?? defaultDescription;
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const siteUrl = configuredSiteUrl ?? browserOrigin;
  const canonicalUrl = siteUrl && canonicalPath ? `${siteUrl}${canonicalPath}` : undefined;
  const metaImageUrl = siteUrl ? new URL(defaultMetaImagePath, `${siteUrl}/`).toString() : undefined;
  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      {robots ? <meta name="robots" content={robots} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {metaImageUrl ? <meta property="og:image" content={metaImageUrl} /> : null}
      {metaImageUrl ? <meta property="og:image:alt" content={siteName} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImageUrl ? <meta name="twitter:image" content={metaImageUrl} /> : null}
      {jsonLdItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}
