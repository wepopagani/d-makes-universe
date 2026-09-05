import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { ShopPhoneLinks } from '@/components/ShopPhoneLinks';
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// Dichiarazione gtag per Google Ads tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
const gtag = typeof window !== 'undefined' ? window.gtag : undefined;

const About = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate('/');
    // Aspetta che la navigazione sia completata, poi fa lo scroll
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Effect to handle page load scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-blue text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
                {t('about.eyebrow')}
              </p>
              <h1 className="heading-1 mb-6">{t('about.title')}</h1>
              <p className="text-xl text-gray-300">
                {t('about.heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                  {t('about.ourStory')}
                </div>
                <h2 className="heading-2 mb-6">{t('about.fromDreamToReality')}</h2>
                <p className="body-text mb-6">
                  {t('about.storyParagraph1')}
                </p>
                <p className="body-text mb-6">
                  {t('about.storyParagraph2')}
                </p>
                <p className="body-text">
                  {t('about.storyParagraph3')}
                </p>
              </div>
              <div className="relative">
                <div className="bg-brand-accent/10 absolute -left-6 -top-6 w-32 h-32 rounded-lg"></div>
                <img
                  src="/images/brochure/workshop.jpg"
                  alt="Laboratorio 3DMAKES — dall'idea al componente finito"
                  className="rounded-lg w-full h-auto object-cover shadow-lg relative z-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                {t('about.ourValues')}
              </div>
              <h2 className="heading-2 mb-6">{t('about.whatGuidesUs')}</h2>
              <p className="body-text">
                {t('about.valuesDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-4">01</p>
                <h3 className="text-xl font-semibold mb-3">{t('about.values.reliable')}</h3>
                <p className="text-brand-gray">
                  {t('about.values.reliableDescription')}
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-4">02</p>
                <h3 className="text-xl font-semibold mb-3">{t('about.values.flexible')}</h3>
                <p className="text-brand-gray">
                  {t('about.values.flexibleDescription')}
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-4">03</p>
                <h3 className="text-xl font-semibold mb-3">{t('about.values.close')}</h3>
                <p className="text-brand-gray">
                  {t('about.values.closeDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Come Raggiungerci */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                {t('about.whereWeAre')}
              </div>
              <h2 className="heading-2 mb-6">{t('about.howToReachUs')}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Mappa */}
              <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
                <iframe 
                  src="https://maps.google.com/maps?q=Via+Cantonale+15,+6918+Figino,+Switzerland&hl=it&z=15&output=embed"
                  width="100%" 
                  height="400" 
                  style={{border: 0}} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mappa di 3DMAKES - Via Cantonale 15, 6918 Figino, Ticino"
                ></iframe>
              </div>
              
              {/* Indicazioni */}
              <div>
                <div className="bg-white p-8 rounded-lg shadow-sm h-full border border-gray-100">
                  <h3 className="text-xl font-semibold mb-6">{t('about.ourAddress')}</h3>
                  
                  <div className="flex items-start mb-6">
                    <div className="h-10 w-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-brand-gray mb-1">
                        <span className="font-medium">{t('contact.info.address')}:</span>
                      </p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=Via+Cantonale+15%2C+6918+Figino%2C+Svizzera"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-accent hover:text-brand-blue transition-colors"
                      >
                        Via Cantonale 15<br />
                        6918 Figino, Svizzera
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="h-10 w-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-brand-gray mb-1">
                        <span className="font-medium">{t('contact.info.phone')}:</span>
                      </p>
                      <ShopPhoneLinks
                        stacked
                        linkClassName="text-brand-accent hover:text-brand-blue transition-colors font-medium"
                        nameClassName="font-medium"
                        onTelClick={() => {
                          if (gtag) {
                            gtag('event', 'conversion', {
                              'send_to': 'AW-758841456/phone_call',
                              'value': 50.0,
                              'currency': 'CHF'
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="h-10 w-10 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mr-4 mt-1 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-brand-gray mb-1">
                        <span className="font-medium">Email:</span>
                      </p>
                      <a 
                        href="mailto:info@3dmakes.ch" 
                        className="text-brand-accent hover:text-brand-blue transition-colors font-medium"
                      >
                        info@3dmakes.ch
                      </a>
                    </div>
                  </div>
                  

                  
                  <div className="mt-8">
                    <Button onClick={handleContactClick} className="w-full">
                      {t('contact.title')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
