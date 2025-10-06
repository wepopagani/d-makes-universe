import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CallToAction from "@/components/CallToAction";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const Mission = () => {
  const { t } = useTranslation();
  
  // Effect to handle page load scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const missionPoints = [
    {
      title: t('mission.knowledge.title'),
      description: t('mission.knowledge.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      title: t('mission.innovation.title'),
      description: t('mission.innovation.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    },
    {
      title: t('mission.sustainability.title'),
      description: t('mission.sustainability.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: t('mission.community.title'),
      description: t('mission.community.description'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
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
              <h1 className="heading-1 mb-6">{t('mission.title')}</h1>
              <p className="text-xl text-gray-300">
                {t('mission.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="bg-brand-blue/10 absolute -left-6 -top-6 w-32 h-32 rounded-lg"></div>
                  <div className="bg-brand-accent/10 absolute -right-6 -bottom-6 w-32 h-32 rounded-lg"></div>
                  <img
                    src="/CIBOO.png"
                    alt="Our mission"
                    className="rounded-lg w-full h-auto object-cover shadow-lg relative z-10"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/800x600/ffffff/333333?text=CIBOO";
                    }}
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                  {t('mission.ourGoal')}
                </div>
                <h2 className="heading-2 mb-6">
                  {t('mission.revolutionTitle')}
                </h2>
                <p className="body-text mb-6">
                  {t('mission.paragraph1')}
                </p>
                <p className="body-text mb-8">
                  {t('mission.paragraph2')}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium">{t('mission.democratize')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Points */}
        <section className="py-16 md:py-24" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                {t('mission.ourCommitments')}
              </div>
              <h2 className="heading-2 mb-6">{t('mission.howWeRealize')}</h2>
              <p className="body-text">
                {t('mission.commitmentDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Riquadro 1 - Innovazione */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">INNOVAZIONE</h3>
                <p className="text-brand-gray">Ricerchiamo costantemente le soluzioni più innovative per offrire ai nostri clienti risultati all'avanguardia. Investiamo in tecnologie di ultima generazione e aggiorniamo continuamente le nostre competenze.</p>
              </div>
              
              {/* Riquadro 2 - Conoscenza */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">CONOSCENZA</h3>
                <p className="text-brand-gray">Vogliamo che la stampa 3D diventi un linguaggio universale, conosciuto e riconosciuto da tutti, non più riservato a pochi esperti. Crediamo in un futuro in cui questa tecnologia sia parte integrante della vita quotidiana, al punto da diventare il primo pensiero quando si cerca una soluzione creativa e concreta.</p>
              </div>
              
              {/* Riquadro 3 - Semplicità */}
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                <div className="h-12 w-12 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">SEMPLICITÀ</h3>
                <p className="text-brand-gray">Semplicità significa ridurre le distanze tra idea e realtà, eliminare barriere e rendere la creazione un processo fluido, immediato e accessibile a tutti. Crediamo che ogni innovazione debba nascere senza complicazioni, lasciando spazio solo all'essenza: trasformare un pensiero in oggetto con naturalezza, come se fosse il passo più ovvio del percorso creativo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                  {t('mission.ourVision')}
                </div>
                <h2 className="heading-2 mb-6">
                  {t('mission.visionTitle')}
                </h2>
                <p className="body-text mb-6">
                  {t('mission.visionParagraph1')}
                </p>
                <p className="body-text mb-6">
                  {t('mission.visionParagraph2')}
                </p>
                <p className="body-text mb-8">
                  {t('mission.visionParagraph3')}
                </p>
                <Button asChild>
                  <Link to="/services">{t('mission.discoverVision')}</Link>
                </Button>
              </div>
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute -left-8 -top-8 w-40 h-40 rounded-full bg-brand-accent/20 blur-2xl"></div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-brand-blue/20 blur-2xl"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-100 to-white rounded-2xl p-1 backdrop-blur-sm border border-gray-200 shadow-xl">
                    <img 
                      src="https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                      alt="Our vision for 3D printing" 
                      className="w-full h-auto rounded-xl object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Mission;
