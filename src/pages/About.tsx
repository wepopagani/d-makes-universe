import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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

  // Team members data
  const team = [
    {
      name: t('about.team.marco.name'),
      role: t('about.team.marco.role'),
      bio: t('about.team.marco.bio'),
      image: "utente1.png"
    },
    {
      name: t('about.team.matteo.name'),
      role: t('about.team.matteo.role'),
      bio: t('about.team.matteo.bio'),
      image: "utente2.png"
    },
    {
      name: t('about.team.manuel.name'),
      role: t('about.team.manuel.role'),
      bio: t('about.team.manuel.bio'),
      image: "utente3.png"
    },
    {
      name: t('about.team.alessandro.name'),
      role: t('about.team.alessandro.role'),
      bio: t('about.team.alessandro.bio'),
      image: "utente1.png"
    },
    {
      name: t('about.team.alessandro2.name'),
      role: t('about.team.alessandro2.role'),
      bio: t('about.team.alessandro2.bio'),
      image: "utente2.png"
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
                  src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Our workshop"
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
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('about.values.innovation')}</h3>
                <p className="text-brand-gray">
                  {t('about.values.innovationDescription')}
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('about.values.quality')}</h3>
                <p className="text-brand-gray">
                  {t('about.values.qualityDescription')}
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">{t('about.sustainabilityTitle')}</h3>
                <p className="text-brand-gray">
                  {t('about.sustainabilityDescription')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                {t('about.ourTeam')}
              </div>
              <h2 className="heading-2 mb-6">{t('about.meetOurExperts')}</h2>
              <p className="body-text">
                {t('about.teamDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="h-64 overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-brand-accent font-medium text-sm mb-3">{member.role}</p>
                    <p className="text-brand-gray">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Come Raggiungerci */}
        <section className="py-16 md:py-24" style={{backgroundColor: '#E4DDD4'}}>
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
                                      <p className="text-brand-gray">Via Cantonale 15</p>
                <p className="text-brand-gray">6918 Lugano, Svizzera</p>
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
                      <a 
                        href="tel:+41762660396" 
                        className="text-brand-accent hover:text-brand-blue transition-colors font-medium"
                        onClick={() => {
                          if (gtag) {
                            gtag('event', 'conversion', {
                              'send_to': 'AW-758841456/phone_call',
                              'value': 50.0,
                              'currency': 'CHF'
                            });
                          }
                        }}
                      >
                        +41 76 266 03 96
                      </a>
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
