import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const MissionSection = () => {
  const { t } = useTranslation();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-brand-blue text-white">
      <div className="container-custom">
        <div className="text-center mb-16 -mt-16">
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
            {t('about.ourValues')}
          </p>
          <h2 className="heading-2 mb-10">{t('about.humanFaceTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-3">01</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t('about.values.reliable')}</h3>
              <p className="text-sm text-gray-300">{t('about.values.reliableDescription')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-3">02</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t('about.values.flexible')}</h3>
              <p className="text-sm text-gray-300">{t('about.values.flexibleDescription')}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-3">03</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t('about.values.close')}</h3>
              <p className="text-sm text-gray-300">{t('about.values.closeDescription')}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
        <div>
          <div className="mb-6">
            <img
              src="/la nostra mission copia.png"
              alt="Mission 3DMAKES — democratizzare la stampa 3D in Ticino e Lombardia"
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