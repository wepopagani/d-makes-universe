import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ProcessTimeline from "@/components/ProcessTimeline";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface Material {
  name: string;
  features: string;
  applications: string;
}

interface Application {
  name: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  features?: string[];
  materials?: Material[];
  applications?: Application[];
  process?: ProcessStep[];
}

const Services = () => {
  const { t } = useTranslation();

  // Effect to handle scrolling to specific service sections
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const services: Service[] = [
    {
      id: "fdm",
      title: t('services.fdm.title'),
      description: t('services.fdm.description'),
      image: "/stampa 3d logo.png",
      features: Array.isArray(t('services.fdm.features', { returnObjects: true })) 
        ? t('services.fdm.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.fdm.materials', { returnObjects: true }))
        ? t('services.fdm.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "cff",
      title: t('services.cff.title'),
      description: t('services.cff.description'),
      image: "/stampa 3d logo.png",
      features: Array.isArray(t('services.cff.features', { returnObjects: true })) 
        ? t('services.cff.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.cff.materials', { returnObjects: true }))
        ? t('services.cff.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "sla",
      title: t('services.sla.title'),
      description: t('services.sla.description'),
      image: "/stampa 3d resina logo.png",
      features: Array.isArray(t('services.sla.features', { returnObjects: true }))
        ? t('services.sla.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.sla.materials', { returnObjects: true }))
        ? t('services.sla.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "polyjet",
      title: t('services.polyjet.title'),
      description: t('services.polyjet.description'),
      image: "/stampa 3d resina logo.png",
      features: Array.isArray(t('services.polyjet.features', { returnObjects: true }))
        ? t('services.polyjet.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.polyjet.materials', { returnObjects: true }))
        ? t('services.polyjet.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "taglio-laser",
      title: t('services.laser.title'),
      description: t('services.laser.description'),
      image: "/taglio laser logo.png",
      features: Array.isArray(t('services.laser.features', { returnObjects: true }))
        ? t('services.laser.features', { returnObjects: true }) as string[]
        : [],
      applications: Array.isArray(t('services.laser.applications', { returnObjects: true }))
        ? t('services.laser.applications', { returnObjects: true }) as Application[]
        : []
    },
    {
      id: "riparazione-stampanti-3d",
      title: t('services.largePrint.title'),
      description: t('services.largePrint.description'),
      image: "/riparazione logo.png",
      features: Array.isArray(t('services.largePrint.features', { returnObjects: true }))
        ? t('services.largePrint.features', { returnObjects: true }) as string[]
        : [],
      applications: Array.isArray(t('services.largePrint.applications', { returnObjects: true }))
        ? t('services.largePrint.applications', { returnObjects: true }) as Application[]
        : []
    },
    {
      id: "scansione",
      title: t('services.scanning.title'),
      description: t('services.scanning.description'),
      image: "/scan logo.png",
      features: Array.isArray(t('services.scanning.features', { returnObjects: true }))
        ? t('services.scanning.features', { returnObjects: true }) as string[]
        : [],
      applications: Array.isArray(t('services.scanning.applications', { returnObjects: true }))
        ? t('services.scanning.applications', { returnObjects: true }) as Application[]
        : []
    },
    {
      id: "prototipazione",
      title: t('services.prototyping.title'),
      description: t('services.prototyping.description'),
      image: "/prototipo logo.png",
      features: Array.isArray(t('services.prototyping.features', { returnObjects: true }))
        ? t('services.prototyping.features', { returnObjects: true }) as string[]
        : [],
      process: Array.isArray(t('services.prototyping.process', { returnObjects: true }))
        ? t('services.prototyping.process', { returnObjects: true }) as ProcessStep[]
        : []
    },
    {
      id: "lsam",
      title: t('services.lsam.title'),
      description: t('services.lsam.description'),
      image: "/stampa 3d logo.png",
      features: Array.isArray(t('services.lsam.features', { returnObjects: true }))
        ? t('services.lsam.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.lsam.materials', { returnObjects: true }))
        ? t('services.lsam.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "mjf",
      title: t('services.mjf.title'),
      description: t('services.mjf.description'),
      image: "/stampa 3d logo.png",
      features: Array.isArray(t('services.mjf.features', { returnObjects: true }))
        ? t('services.mjf.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.mjf.materials', { returnObjects: true }))
        ? t('services.mjf.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "slm",
      title: t('services.slm.title'),
      description: t('services.slm.description'),
      image: "/stampa slm.png",
      features: Array.isArray(t('services.slm.features', { returnObjects: true }))
        ? t('services.slm.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.slm.materials', { returnObjects: true }))
        ? t('services.slm.materials', { returnObjects: true }) as Material[]
        : []
    },
    {
      id: "sls",
      title: t('services.sls.title'),
      description: t('services.sls.description'),
      image: "/stampa sls.png",
      features: Array.isArray(t('services.sls.features', { returnObjects: true }))
        ? t('services.sls.features', { returnObjects: true }) as string[]
        : [],
      materials: Array.isArray(t('services.sls.materials', { returnObjects: true }))
        ? t('services.sls.materials', { returnObjects: true }) as Material[]
        : []
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-blue text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="heading-1 mb-6">{t('services.heroTitle')}</h1>
              <p className="text-xl text-gray-300">
                {t('services.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div 
                  key={service.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 scale-70"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-brand-gray mb-5 line-clamp-3">{service.description}</p>
                    <Button asChild variant="outline" size="sm">
                      <a href={`#${service.id}`}>{t('common.discoverMore')}</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Individual Services */}
        {services.map((service, index) => (
          <section key={service.id} id={service.id} className={`py-16 md:py-20 ${index % 2 === 0 ? '' : 'bg-white'}`} style={index % 2 === 0 ? {backgroundColor: '#E4DDD4'} : {}}>
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}>
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                
                <div className={index % 2 === 0 ? "order-1 lg:order-2" : "order-1"}>
                  <h2 className="heading-2 mb-6">{service.title}</h2>
                  <p className="body-text mb-8">{service.description}</p>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">{t('services.characteristics')}</h3>
                    <ul className="space-y-3">
                      {service.features && service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <svg className="h-5 w-5 text-brand-accent mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-brand-gray">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Conditional button based on service type */}
                  {service.id === 'fdm' || service.id === 'sla' ? (
                    <Button asChild>
                      <Link to="/calculator">{t('services.requestQuote')}</Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link to="/#contact">{t('services.requestQuote')}</Link>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Materials or Applications based on service type */}
              <div className="mt-16">
                {service.materials && service.materials.length > 0 && (
                  <>
                    <h3 className="text-2xl font-semibold mb-8 text-center">{t('services.availableMaterials')}</h3>
                    <div className="flex justify-center">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                        {service.materials.map((material, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="text-xl font-semibold mb-2">{material.name}</h4>
                            <p className="text-brand-gray mb-3"><span className="font-medium">{t('services.characteristics')}:</span> {material.features}</p>
                            <p className="text-brand-gray"><span className="font-medium">{t('services.applications')}:</span> {material.applications}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {service.applications && service.applications.length > 0 && (
                  <>
                    <h3 className="text-2xl font-semibold mb-8 text-center">{t('services.applications')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {service.applications.map((app, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <h4 className="text-xl font-semibold mb-2">{app.name}</h4>
                          <p className="text-brand-gray">{app.description}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
              </div>
            </div>
          </section>
        ))}

        {/* Process Section - Shown after SLS service */}
        <section className="py-16 md:py-20" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <h3 className="text-2xl font-semibold mb-8 text-center">{t('services.ourProcess')}</h3>
            <ProcessTimeline steps={
              Array.isArray(t('services.prototyping.process', { returnObjects: true }))
                ? t('services.prototyping.process', { returnObjects: true }) as ProcessStep[]
                : []
            } />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">
                {t('services.readyToRealize')}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('services.contactToday')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/calculator">{t('services.calculateQuote')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                  <Link to="/#contact">{t('nav.contact')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
