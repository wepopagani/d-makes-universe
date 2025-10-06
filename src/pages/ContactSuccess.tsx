import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Dichiarazione gtag per Google Ads tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
const gtag = typeof window !== 'undefined' ? window.gtag : undefined;

const ContactSuccess = () => {
  const { t } = useTranslation();
  
  // Scroll to top quando la pagina viene caricata e track conversione
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track conversion for contact form completion
    if (gtag) {
      gtag('event', 'ads_conversion_Modulo_1', {
        'send_to': 'AW-758841456/Modulo_1',
        'value': 40.0,
        'currency': 'CHF'
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-blue to-slate-900 text-white py-24 md:py-32">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-8 animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="heading-1 mb-6">
                {t('contact.messageSentSuccess')}
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {t('contactSuccess.thankYouDetailed')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/">{t('contactSuccess.backToHome')}</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                  <Link to="/services">{t('contactSuccess.discoverServices')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="heading-2 mb-4">{t('contactSuccess.howToFindUs')}</h2>
                <p className="body-text">
                  {t('contactSuccess.urgentContact')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/10 rounded-lg mb-4">
                    <Mail className="w-6 h-6 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('contactSuccess.contacts')}</h3>
                  <p className="text-brand-gray text-sm mb-2">📧 info@3dmakes.ch</p>
                  <p className="text-brand-gray text-sm">📞 +41 76 266 03 96</p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <a 
                    href="https://wa.me/41762660396" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-brand-gray text-sm hover:text-green-500 transition-colors"
                  >
                    {t('contact.chatWithUs')}
                  </a>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/10 rounded-lg mb-4">
                    <MapPin className="w-6 h-6 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('contact.info.address')}</h3>
                  <p className="text-brand-gray text-sm">{t('contact.fullAddress')}</p>
                </div>

                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent/10 rounded-lg mb-4">
                    <Clock className="w-6 h-6 text-brand-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('contactSuccess.hours')}</h3>
                  <p className="text-brand-gray text-sm">{t('contactSuccess.schedule')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What's Next Section */}
        <section className="py-16 md:py-20" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-8">{t('contactSuccess.whatHappensNow')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-blue text-white rounded-full font-bold text-lg mb-4">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">{t('contactSuccess.step1Title')}</h3>
                  <p className="text-brand-gray text-sm">{t('contactSuccess.step1Description')}</p>
                </div>
                
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-blue text-white rounded-full font-bold text-lg mb-4">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">{t('contactSuccess.step2Title')}</h3>
                  <p className="text-brand-gray text-sm">{t('contactSuccess.step2Description')}</p>
                </div>
                
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-accent text-white rounded-full font-bold text-lg mb-4">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">{t('contactSuccess.step3Title')}</h3>
                  <p className="text-brand-gray text-sm">{t('contactSuccess.step3Description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="heading-2 mb-8">{t('contactSuccess.exploreServices')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.fdm.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.fdmDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#fdm">{t('common.discoverMore')}</Link>
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.sla.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.slaDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#sla">{t('common.discoverMore')}</Link>
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.laser.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.laserDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#taglio-laser">{t('common.discoverMore')}</Link>
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.largePrint.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.largePrintDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#riparazione-stampanti-3d">{t('common.discoverMore')}</Link>
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.scanning.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.scanningDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#scansione-3d">{t('common.discoverMore')}</Link>
                  </Button>
                </div>

                <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-brand-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold mb-2">{t('services.prototyping.title')}</h3>
                    <p className="text-brand-gray text-sm mb-4">{t('contactSuccess.prototypingDescription')}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/services#prototipazione">{t('common.discoverMore')}</Link>
                  </Button>
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

export default ContactSuccess; 