import React from 'react';
import { useTranslation } from 'react-i18next';

const SearchSection = () => {
  const { t } = useTranslation();

  React.useEffect(() => {
    // Carica lo script di Google CSE dinamicamente
    const script = document.createElement('script');
    script.src = `https://cse.google.com/cse.js?cx=d6f5fdd7384fa4e0f`;
    script.async = true;
    document.body.appendChild(script);

    // Aggiungiamo gli stili personalizzati per il motore di ricerca
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .gsc-control-cse {
        background-color: transparent !important;
        border: none !important;
        padding: 0 !important;
      }
      .gsc-search-button-v2 {
        background-color: #3B82F6 !important;
        border-color: #3B82F6 !important;
        padding: 12px 15px !important;
        border-radius: 4px !important;
        margin-left: 5px !important;
      }
      .gsc-search-button-v2:hover {
        background-color: #2563EB !important;
        border-color: #2563EB !important;
      }
      .gsc-input-box {
        border-radius: 4px !important;
        border: 2px solid #e0e0e0 !important;
        height: 40px !important;
        background-color: white !important;
      }
      .gsc-input {
        padding-right: 12px !important;
      }
      .gsib_a {
        padding: 5px 9px !important;
      }
      .gsib_a input {
        color: #333 !important;
        font-size: 16px !important;
      }
      .gsib_a input::placeholder {
        color: #666 !important;
      }
      table.gsc-search-box td {
        vertical-align: middle !important;
      }
      .gsc-results-wrapper-overlay {
        width: 80% !important;
        max-width: 800px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
      .gsc-results {
        width: 100% !important;
      }
      /* Aggiungiamo un po' di padding attorno al box di ricerca */
      .gsc-search-box {
        margin-bottom: 0 !important;
      }
      /* Stile per il pulsante */
      .gsc-search-button-v2 svg {
        fill: white !important;
        width: 16px !important;
        height: 16px !important;
      }
    `;
    document.head.appendChild(styleSheet);

    // Cleanup function per rimuovere lo script e lo style quando il componente viene smontato
    return () => {
      const googleScript = document.querySelector('script[src*="cse.google.com"]');
      if (googleScript) googleScript.remove();
      
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-brand-blue text-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/20 text-white mb-4">
            {t('search.title')}
          </div>
          <h2 className="heading-2 mb-6">{t('search.findModels')}</h2>
          <p className="text-gray-300 mb-8">
            {t('search.description')}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="gcse-search"></div>
          <p className="text-sm text-center text-gray-600 mt-6 italic">
            {t('search.instructions')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default SearchSection; 