import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const CallToAction = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
      <div className="container-custom">
        <div className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 mb-6">
              {t('services.readyToRealize')}
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 mx-auto max-w-2xl">
              {t('services.contactToday')}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90 text-white">
                <Link to="/calculator">{t('nav.requestQuote')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                <Link to="/dashboard">{t('nav.clientArea')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
