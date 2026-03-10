import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE = "Vertex Global Markets";
const BASE_URL = "https://vertexglobalmarkets.com";

const SEO = ({ title, description, path, type = "website", jsonLd }: SEOProps) => {
  const fullTitle = `${title} | ${SITE}`;
  const url = `${BASE_URL}${path}`;

  const defaultJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url,
    publisher: {
      "@type": "Organization",
      name: SITE,
      url: BASE_URL,
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      <script type="application/ld+json">
        {JSON.stringify(jsonLd ?? defaultJsonLd)}
      </script>
    </Helmet>
  );
};

export default SEO;
