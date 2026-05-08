import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  schema?: object | object[];
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  url, 
  image = 'https://agrigence.in/logo.png', 
  type = 'website',
  schema,
  keywords = 'Agrigence Journal of Agriculture & Allied Sciences, agriculture, farming, agritech, india, mandi bhav, gov schemes, crop advisory'
}) => {
  const currentUrl = (url || (typeof window !== 'undefined' ? window.location.href : 'https://agrigence.in')).replace(/\/$/, '');
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Agrigence",
    "url": "https://agrigence.in",
    "logo": "https://agrigence.in/logo.png",
    "sameAs": [
      "https://facebook.com/agrigence",
      "https://twitter.com/agrigence",
      "https://linkedin.com/company/agrigence"
    ]
  };

  const schemas = Array.isArray(schema) ? [organizationSchema, ...schema] : (schema ? [organizationSchema, schema] : [organizationSchema]);

  return (
    <Helmet>
      <title data-rh="true">{title}</title>
      <meta data-rh="true" name="robots" content="index, follow" />
      <meta data-rh="true" name="description" content={description} />
      <meta data-rh="true" name="keywords" content={keywords} />
      
      <link data-rh="true" rel="canonical" href={currentUrl} />
      
      {/* Open Graph / Facebook */}
      <meta data-rh="true" property="og:type" content={type} />
      <meta data-rh="true" property="og:url" content={currentUrl} />
      <meta data-rh="true" property="og:title" content={title} />
      <meta data-rh="true" property="og:description" content={description} />
      <meta data-rh="true" property="og:image" content={image} />

      {/* Twitter */}
      <meta data-rh="true" name="twitter:card" content="summary_large_image" />
      <meta data-rh="true" name="twitter:url" content={currentUrl} />
      <meta data-rh="true" name="twitter:title" content={title} />
      <meta data-rh="true" name="twitter:description" content={description} />
      <meta data-rh="true" name="twitter:image" content={image} />

      {/* Structured Data */}
      {schemas.map((s, i) => (
        <script key={i} data-rh="true" type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
