import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';

const AboutSection = () => {
  const { t } = useTranslation();
  
  // Componente per l'animazione semplice: sparsi → uniti
  const FloatingNames = () => {
    const [isUnited, setIsUnited] = useState(false);
    const [visibleNames, setVisibleNames] = useState(0);
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef(null);
    
    const names = ["MARCO", "MATTEO", "ALESSANDRO", "MANUEL", "ALESSANDRO"];
    
    // Posizioni iniziali sparse - responsive
    const initialPositions = [
      { x: '25%', y: '40%' },  // MARCO
      { x: '70%', y: '25%' },  // MATTEO
      { x: '35%', y: '70%' },  // ALESSANDRO
      { x: '75%', y: '60%' },  // MANUEL
      { x: '60%', y: '10%' }   // ALESSANDRO
    ];
    
    // Posizioni finali unite sulla sinistra (colonna ordinata) - responsive
    const finalPositions = [
      { x: '5%', y: '15%' },   // MARCO
      { x: '5%', y: '30%' },   // MATTEO
      { x: '5%', y: '45%' },   // ALESSANDRO
      { x: '5%', y: '60%' },   // MANUEL
      { x: '5%', y: '75%' }    // ALESSANDRO
    ];
    
    useEffect(() => {
      // Intersection Observer per rilevare quando il componente è visibile
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isInView) {
              setIsInView(true);
            }
          });
        },
        {
          threshold: 0.3, // Attiva quando il 30% del componente è visibile
          rootMargin: '0px 0px -50px 0px' // Margine per attivare un po' prima
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => {
        if (containerRef.current) {
          observer.unobserve(containerRef.current);
        }
      };
    }, [isInView]);

    useEffect(() => {
      // Avvia l'animazione solo quando il componente è in vista
      if (!isInView) return;

      // Mostra tutti i nomi rapidamente
      const appearTimer = setInterval(() => {
        setVisibleNames(prev => {
          if (prev < names.length) {
            return prev + 1;
          } else {
            clearInterval(appearTimer);
            // Dopo 1 secondo, uniscili al centro
            setTimeout(() => {
              setIsUnited(true);
            }, 1000);
            return prev;
          }
        });
      }, 200);
      
      return () => clearInterval(appearTimer);
    }, [isInView, names.length]);
    
    return (
      <div className="mb-8 flex justify-center">
        <div 
          ref={containerRef}
          className="relative overflow-hidden w-full max-w-4xl h-48 md:h-72"
          style={{
            background: 'transparent'
          }}
        >
          {names.map((name, index) => {
            const isVisible = index < visibleNames;
            const currentPos = isUnited ? finalPositions[index] : initialPositions[index];
            
            return (
              <div
                key={index}
                className={`absolute transition-all duration-1500 ease-out ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: currentPos.x,
                  top: currentPos.y,
                  transform: !isVisible ? 'scale(0)' : 'scale(1)',
                  fontSize: 'clamp(20px, 4vw, 36px)',
                  fontFamily: 'Gotham Black, Arial Black, sans-serif',
                  fontWeight: '900',
                  color: isUnited ? '#009FE3' : '#000000',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                {name}
              </div>
            );
          })}
          
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Banner Chi Siamo */}
      <section className="bg-white py-4">
        <div className="container-custom">
          <div className="flex justify-center">
            <img 
              src="/chi siamo.png" 
              alt="Chi Siamo"
              className="w-full h-auto max-w-3xl"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x300/ffffff/333333?text=Chi+Siamo";
              }}
            />
          </div>
        </div>
      </section>

      {/* Sezione About */}
      <section id="about" className="pt-8 pb-12 md:pb-24 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="bg-brand-blue/10 absolute -left-5 -top-5 w-24 h-24 rounded-lg"></div>
              <div className="bg-brand-accent/10 absolute -right-5 -bottom-5 w-32 h-32 rounded-lg"></div>
              <img
                src="/ragazzi.png"
                alt="Team 3DMAKES"
                className="rounded-lg w-full h-auto object-cover shadow-lg relative z-10"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/ffffff/333333?text=Team+Ragazzi";
                }}
              />
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            {/* Animazione nomi fluttuanti */}
            <FloatingNames />
            
            <h2 className="heading-2 mb-6">
              {t('about.heroSubtitle')}
            </h2>
            <p className="body-text mb-6">
              {t('about.description')}
            </p>
            <p className="body-text mb-8">
              {t('about.storyParagraph1')}
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
