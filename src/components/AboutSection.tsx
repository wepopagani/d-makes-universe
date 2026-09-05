import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <>
      <section id="about" className="pt-12 pb-12 md:pt-16 md:pb-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="bg-brand-blue/10 absolute -left-5 -top-5 w-24 h-24 rounded-lg"></div>
              <div className="bg-brand-accent/10 absolute -right-5 -bottom-5 w-32 h-32 rounded-lg"></div>
              <img
                src="/ragazzi.png"
                alt="Team 3DMAKES — laboratorio di progettazione e stampa 3D a Figino"
                className="rounded-lg w-full h-auto object-cover shadow-lg relative z-10"
              />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
              {t('about.eyebrow')}
            </p>
            <h2 className="heading-2 mb-6">
              {t('about.heroSubtitle')}
            </h2>
            <p className="body-text mb-6">
              {t('about.description')}
            </p>
            <p className="body-text mb-8">
              {t('about.humanFace')}
            </p>
            <Button asChild>
              <Link to="/about">{t('common.discoverMore')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default AboutSection;
