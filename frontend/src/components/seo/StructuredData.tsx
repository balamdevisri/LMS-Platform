import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Course';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export const OrganizationSchema: React.FC = () => {
  const data = {
    name: 'Kaizen Q',
    url: 'https://www.kaizenq.in',
    logo: 'https://res.cloudinary.com/kggovcsf/image/upload/v1787058675/Kaizen_Q_Symbol_Logo1.png',
    description: 'Kaizen Q — Modern Global Learning Platform for AI, Technology & Career Skills.',
    sameAs: [
      // Add official verified social URLs here
    ],
  };

  return <StructuredData type="Organization" data={data} />;
};

interface CourseSchemaProps {
  name: string;
  description: string;
  providerName?: string;
  url?: string;
}

export const CourseSchema: React.FC<CourseSchemaProps> = ({ 
  name, 
  description, 
  providerName = 'Kaizen Q',
  url 
}) => {
  const data = {
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: providerName,
      sameAs: 'https://www.kaizenq.in'
    },
    ...(url && { url }),
  };

  return <StructuredData type="Course" data={data} />;
};
