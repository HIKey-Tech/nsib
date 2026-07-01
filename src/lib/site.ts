import type { Metadata } from 'next';

// Single source of truth for site-wide SEO. Override the domain per environment
// with NEXT_PUBLIC_SITE_URL; falls back to the production domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nsib.gov.ng').replace(/\/$/, '');

export const SITE_NAME = 'Nigerian Safety Investigation Bureau';
export const SITE_SHORT_NAME = 'NSIB';
export const SITE_DESCRIPTION =
  'The Nigerian Safety Investigation Bureau (NSIB) is Nigeria’s independent federal agency for investigating aviation, maritime and railway accidents — fact-finding, not fault-finding, to prevent future occurrences.';

// Verified public contact details (source: /contact-us).
const CONTACT = {
  telephone: '+234-807-709-0900',
  email: 'info@nsib.gov.ng',
  streetAddress: 'Nnamdi Azikiwe International Airport',
  addressLocality: 'Abuja',
  addressRegion: 'Federal Capital Territory',
  addressCountry: 'NG',
};

/** GovernmentOrganization + WebSite JSON-LD for the root layout. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'GovernmentOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_SHORT_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/images/nsib-logo.png`,
        description: SITE_DESCRIPTION,
        foundingDate: '2022',
        areaServed: { '@type': 'Country', name: 'Nigeria' },
        address: {
          '@type': 'PostalAddress',
          streetAddress: CONTACT.streetAddress,
          addressLocality: CONTACT.addressLocality,
          addressRegion: CONTACT.addressRegion,
          addressCountry: CONTACT.addressCountry,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: CONTACT.telephone,
          email: CONTACT.email,
          contactType: 'customer service',
          areaServed: 'NG',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** Per-page metadata helper. `path` is the canonical route, resolved against metadataBase. */
export function pageMeta(opts: { title: string; description: string; path: string }): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
      url: opts.path,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${opts.title} | ${SITE_NAME}`,
      description: opts.description,
    },
  };
}
