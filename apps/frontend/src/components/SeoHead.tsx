type SeoHeadProps = {
  title: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
};

import { Helmet } from 'react-helmet-async';

const defaultDescription = 'BEDR demo application';

export function SeoHead({ title, description, robots, canonicalPath }: SeoHeadProps) {
  const metaDescription = description ?? defaultDescription;
  const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
  const canonicalUrl = siteUrl && canonicalPath ? `${siteUrl}${canonicalPath}` : undefined;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={metaDescription} />
      {robots ? <meta name="robots" content={robots} /> : null}
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
}
