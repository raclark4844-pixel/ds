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

export function pageHead({ title, description, path }: { title: string; description: string; path: string }) {
  const url = `${SITE_URL}${path}`;
  const og = `${SITE_URL}/og.png`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { name: "author", content: SITE_NAME },
      ...(isPlaceholder(CITY_LINE) ? [] : [{ name: "geo.placename", content: CITY_LINE }]),
      ...(REGION_ABBR ? [{ name: "geo.region", content: `US-${REGION_ABBR}` }] : []),
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: og },
      { property: "og:image:alt", content: `${SITE_NAME} digital technology and growth solutions` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
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
          "Demore Technology Solutions builds custom websites, ecommerce, AI-assisted digital marketing, lead-generation systems, SEO, GEO, AEO, CRO, analytics, conversion tracking, social automation, content workflows, and custom business automation. Based in Mentor, Ohio and serving clients nationwide.",
        knowsAbout: [
          "AI-assisted digital marketing",
          "lead generation",
          "SEO",
          "search engine optimization",
          "AEO",
          "answer engine optimization",
          "GEO",
          "generative engine optimization",
          "CRO",
          "conversion rate optimization",
          "technical SEO",
          "website performance",
          "user experience",
          "custom websites",
          "ecommerce",
          "landing pages",
          "analytics",
          "conversion tracking",
          "social media automation",
          "Google Business Profile automation",
          "review workflows",
          "content automation",
          "business workflow automation",
          "AI assistants",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en-US",
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
          "Nationwide digital technology, website, ecommerce, AI-assisted marketing, lead-generation, search optimization, analytics, content, and automation services.",
        serviceType: [
          "Website development",
          "Ecommerce development",
          "AI-assisted digital marketing",
          "Lead generation",
          "Business automation",
          "Search engine optimization",
          "Answer engine optimization",
          "Generative engine optimization",
          "Conversion rate optimization",
          "Analytics implementation",
          "Conversion tracking",
          "Content and social automation",
        ],
      },
    ],
  };
}

export function serviceJsonLd({ name, description, path, serviceType }: {
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
    areaServed,
    serviceType,
    provider: { "@id": `${SITE_URL}/#organization`, "@type": "Organization", name: SITE_NAME, url: SITE_URL },
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
