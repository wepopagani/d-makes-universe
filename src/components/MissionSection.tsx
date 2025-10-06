import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-brand-blue text-white">
      <div className="container-custom">
        {/* Immagine Valori */}
        <div className="text-center mb-16 -mt-16">
          <img
            src="/valori.png"
            alt="Valori"
            className="w-full h-auto max-w-3xl mx-auto mb-8"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/700x250/ffffff/333333?text=Valori";
            }}
          />
          {/* Icone dei Valori Aziendali */}
          <div className="flex justify-center gap-12">
            {/* Icona Affidabilità */}
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/20 text-brand-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white text-center">AFFIDABILI</span>
            </div>
            {/* Icona Flessibilità */}
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/20 text-brand-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white text-center">FLESSIBILI</span>
            </div>
            {/* Icona Umanità */}
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/20 text-brand-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white text-center">UMANI</span>
            </div>
            {/* Icona Accessibilità */}
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-accent/20 text-brand-accent mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white text-center">ACCESSIBILI</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
        <div>
          <div className="mb-6">
            <img
              src="/la nostra mission copia.png"
              alt="La Nostra Mission"
              className="w-full h-auto max-w-2xl"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x300/ffffff/333333?text=La+Nostra+Mission";
              }}
            />
          </div>
          <h2 className="heading-2 mb-6">
            {t('mission.democratize')}
          </h2>
            <p className="text-gray-300 text-lg mb-2">
              {t('mission.description')}
            </p>
            <p className="text-gray-300 text-lg mb-8">
              {t('mission.paragraph1')}
            </p>
            <Button asChild variant="secondary">
              <Link to="/mission">{t('common.discoverMore')}</Link>
            </Button>
          </div>
          
          {/* Riquadri Innovazione, Conoscenza e Semplicità */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
              {/* Riquadro Innovazione */}
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="text-xl font-bold text-center">INNOVAZIONE</h3>
              </div>
              
              {/* Riquadro Conoscenza */}
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-bold text-center">CONOSCENZA</h3>
              </div>
              
              {/* Riquadro Semplicità */}
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3 className="text-xl font-bold text-center">SEMPLICITÀ</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;