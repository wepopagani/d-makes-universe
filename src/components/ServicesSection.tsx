import ServiceCard from "./ServiceCard";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t('services.fdm.title'),
      description: t('services.fdm.description'),
      imageUrl: "/stampa 3d logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      link: "/services#fdm"
    },
    {
      title: t('services.sla.title'),
      description: t('services.sla.description'),
      imageUrl: "/stampa 3d resina logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      link: "/services#sla"
    },
    {
      title: t('services.laser.title'),
      description: t('services.laser.description'),
      imageUrl: "/taglio laser logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      link: "/services#taglio-laser"
    },
    {
      title: t('services.largePrint.title'),
      description: t('services.largePrint.description'),
      imageUrl: "/riparazione logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      link: "/services#riparazione-stampanti-3d"
    },
    {
      title: t('services.scanning.title'),
      description: t('services.scanning.description'),
      imageUrl: "/scan logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      link: "/services#scansione"
    },
    {
      title: t('services.prototyping.title'),
      description: t('services.prototyping.description'),
      imageUrl: "/prototipo logo.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      link: "/services#prototipazione"
    },
    {
      title: t('services.slm.title'),
      description: t('services.slm.description'),
      imageUrl: "/stampa slm.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      link: "/services#slm"
    },
    {
      title: t('services.sls.title'),
      description: t('services.sls.description'),
      imageUrl: "/stampa sls.png",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5v12a2 2 0 002 2 2 2 0 002-2V3zM15 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM15 3h-2v12a2 2 0 002 2 2 2 0 002-2V3z" />
        </svg>
      ),
      link: "/services#sls"
    }
  ];
  
  return (
    <>
      {/* Banner Cosa Offriamo */}
      <section className="bg-white py-2">
        <div className="container-custom">
          <div className="flex justify-center">
            <img 
              src="/COSA OFFRIAMO.png" 
              alt="Cosa Offriamo"
              className="w-full h-auto max-w-4xl"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/1000x400/ffffff/333333?text=Cosa+Offriamo";
              }}
            />
          </div>
        </div>
      </section>

      {/* Sezione Servizi */}
      <section id="services" className="pt-8 pb-12 md:pb-24" style={{backgroundColor: '#E5DDD3'}}>
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="heading-2 mb-6">
            {t('services.subtitle')}
          </h2>
          <p className="body-text">
            {t('services.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.slice(0, 6).map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
        
        {/* Riquadri SLM e SLS centrati */}
        <div className="flex justify-center items-center mt-8">
          <div className="flex gap-8 justify-center max-w-4xl mx-auto">
            {services.slice(6).map((service, index) => (
              <div key={index + 6} className="w-full max-w-sm flex-shrink-0">
                <ServiceCard {...service} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to="/services" className="inline-flex items-center text-brand-accent font-medium hover:text-brand-blue transition-colors">
            {t('services.seeAll')}
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
    </>
  );
};

export default ServicesSection;
