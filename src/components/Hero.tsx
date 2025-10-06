import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import CounterAnimation from './CounterAnimation';

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-slate-900 text-white pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(61,157,255,0.4)_0%,rgba(0,0,0,0)_50%)]"></div>
        <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNhYWEiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="heading-1 mb-6">
              {t('hero.title')}
              <span className="text-brand-accent block mt-2">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
                <Link to="/services">{t('hero.discoverServices')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/calculator">{t('hero.requestQuote')}</Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center animate-fade-in">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-accent to-brand-blue rounded-lg blur opacity-30"></div>
              <div className="relative bg-slate-800/60 p-6 rounded-lg border border-white/10 shadow-xl">
                <img 
                  src="/stampa corretta.gif" 
                  alt="Stampante 3D professionale"
                  className="w-full h-auto rounded"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400/3d73dd/ffffff?text=Stampante+3D";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                    <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
                      <CounterAnimation
                        end={5}
                        suffix="+"
                        duration={1500}
                        className="font-display text-3xl font-bold text-brand-accent mb-1"
                      />
                      <p className="text-gray-300">{t('hero.stats.experience')}</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
                      <CounterAnimation
                        end={100}
                        suffix="+"
                        duration={1500}
                        className="font-display text-3xl font-bold text-brand-accent mb-1"
                      />
                      <p className="text-gray-300">{t('hero.stats.projects')}</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
                      <CounterAnimation
                        end={25}
                        suffix="+"
                        duration={1500}
                        className="font-display text-3xl font-bold text-brand-accent mb-1"
                      />
                      <p className="text-gray-300">Km di filamento impiegati</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: "500ms" }}>
                      <CounterAnimation
                        end={100}
                        suffix="%"
                        duration={1500}
                        className="font-display text-3xl font-bold text-brand-accent mb-1"
                      />
                      <p className="text-gray-300">{t('hero.stats.precision')}</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: "600ms" }}>
                      <CounterAnimation
                        end={5000}
                        suffix="+"
                        duration={1500}
                        className="font-display text-3xl font-bold text-brand-accent mb-1"
                      />
                      <p className="text-gray-300">Caffè consumati</p>
                    </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
