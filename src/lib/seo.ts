import { CITY, CITY_LINE, COUNTRY, EMAIL, PHONE, REGION_ABBR, SITE_NAME, SITE_URL } from "@/lib/site";
import { isPlaceholder } from "@/lib/publish";

const postalAddress = isPlaceholder(CITY)
  ? { "@type": "PostalAddress", addressCountry: "US" }
  : {
      "@type": "PostalAddress",
      addressLocality: CITY,
      addressRegion: REGION_ABBR,
      addressCountry: "US",
    };

const areaServed = { "@type": "Country", name: COUNTRY };

function contactFields() {
  return {
    ...(isPlaceholder(EMAIL) ? {} : { email: EMAIL }),
    ...(isPlaceholder(PHONE) ? {} : { telephone: PHONE }),
  };
}

export function pageHead({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const url = `${SITE_URL}${path}`;
  const og = `${SITE_URL}/og.png`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow" },
      { name: "author", content: SITE_NAME },
      ...(isPlaceholder(CITY_LINE) ? [] : [{ name: "geo.placename", content: CITY_LINE }]),
      ...(REGION_ABBR ? [{ name: "geo.region", content: `US-${REGION_ABBR}` }] : []),
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: og },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: og },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/logo.png`,
        ...contactFields(),
        address: postalAddress,
        areaServed,
        description:
          "Demore Technology Solutions builds custom websites, online stores, social auto-posting, short-form content, and insurance claim supplements. Based in Mentor, Lake County, Ohio. Serving businesses nationwide. SEO, GEO, AEO, CRO, and UX. Not an insurer. Not a public adjuster unless licensed in that state.",
        knowsAbout: [
          "SEO",
          "AEO",
          "GEO",
          "CRO",
          "custom websites",
          "ecommerce",
          "social media automation",
          "insurance claim supplements",
          "Xactimate",
          "contractor websites",
          "technical performance",
          "UX",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: SITE_NAME,
        url: SITE_URL,
        ...contactFields(),
        address: postalAddress,
        areaServed,
        description:
          "Custom websites, stores, social systems, growth stack, and insurance claim supplements.",
        serviceType: [
          "Website development",
          "Business automation",
          "Search engine optimization",
          "Answer engine optimization",
          "Generative engine optimization",
          "Conversion rate optimization",
          "Content and digital growth",
          "Industry-specific digital solutions",
        ],
      },
    ],
  };
}

export function serviceJsonLd({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string | string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    areaServed: { "@type": "Country", name: COUNTRY },
    serviceType,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function breadcrumbJsonLd(items: readonly { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
