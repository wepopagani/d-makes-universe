import React, { useState, useEffect } from 'react';

const Banner = () => {
  const [visibleChars, setVisibleChars] = useState(0);
  const text = "DOVE OGNI IDEA PRENDE FORMA";

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleChars(prev => {
        if (prev < text.length) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 100); // Velocità dell'animazione: 100ms per carattere

    return () => clearInterval(timer);
  }, [text.length]);

  return (
    <section className="py-8" style={{
      backgroundColor: '#E5DDD3'
    }}>
      <div className="container-custom flex justify-between items-center gap-8">
        <div className="max-w-2xl w-full flex items-center justify-center">
          <h1 className="text-6xl font-black text-brand-blue text-center leading-tight" style={{fontFamily: 'Gotham Black, Arial Black, sans-serif'}}>
            {text.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-300 ${
                  index < visibleChars 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  textShadow: index < visibleChars ? '2px 2px 4px rgba(61, 115, 221, 0.3)' : 'none'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>
        <div className="max-w-2xl w-full">
          <img 
            src="/TONY HD CON OMBRA copia.png" 
            alt="Tony HD con ombra"
            className="w-full h-auto block"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/600x300/ffffff/333333?text=Tony+HD";
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default Banner;
