import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description, 
  name = "Jesus Is With Us Ministries", 
  type = "website", 
  image = "/assets/churchimage.webp",
  url = "" 
}) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://jesusiswithuschurch.vercel.app';
  const fullUrl = `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Canonical Link */}
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={name} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
}
