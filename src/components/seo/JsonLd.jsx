export function JsonLd({ schema }) {
  const safeJson = JSON.stringify(schema).replace(/</g, '\\u003c');
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson }} />
  );
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://jesusiswithuschurch.vercel.app';

export const churchSchema = {
  "@context": "https://schema.org",
  "@type": ["Church", "Organization"],
  "name": "Jesus Is With Us Ministries",
  "alternateName": "Jesus Is With Us Church",
  "url": SITE_URL,
  "logo": `${SITE_URL}/favicon.svg`,
  "image": `${SITE_URL}/assets/churchimage.webp`,
  "description": "We are a vibrant Christian community in Salem, dedicated to worship, fellowship, and spreading the Gospel.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "M3FC+8C9, Kollapatty",
    "addressLocality": "Salem",
    "addressRegion": "Tamil Nadu",
    "postalCode": "636030",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "11.6643", 
    "longitude": "78.1460"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "06:00",
      "closes": "13:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Sunday",
      "opens": "18:30",
      "closes": "20:30"
    }
  ],
  "sameAs": [
    "https://www.youtube.com/@jesusiswithusministries7844/",
    "https://www.instagram.com/jiwcministries",
    "https://www.facebook.com/share/1BqSmZKf3S/",
    "https://sharechat.com/profile/1894693559"
  ]
};

export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.url}`
    }))
  };
};

export const generateEventSchema = (event) => {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description,
    "startDate": `${event.date}T${event.time || "00:00"}:00`,
    "location": {
      "@type": "Place",
      "name": event.location || "Jesus Is With Us Church",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "M3FC+8C9, Kollapatty",
        "addressLocality": "Salem",
        "addressRegion": "Tamil Nadu",
        "postalCode": "636030",
        "addressCountry": "IN"
      }
    },
    "image": event.image_url ? [event.image_url] : [`${SITE_URL}/assets/churchimage.webp`]
  };
};
