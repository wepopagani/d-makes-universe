import { SHOP_PRIMARY_WA_DIGITS } from '@/constants/shopPhones';

const WhatsAppButton = () => {
  const message = "Ciao! Sono interessato alle vostre tecnologie di stampa 3D.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${SHOP_PRIMARY_WA_DIGITS}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label="Contattaci su WhatsApp"
    >
      <img 
        src="/images/WhatsApp.png" 
        alt="Scrivi a 3DMAKES su WhatsApp per preventivo stampa 3D" 
        className="w-6 h-6 group-hover:animate-pulse"
      />
      
      {/* Tooltip - nascosto su mobile */}
      <div className="hidden md:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
        Scrivici su WhatsApp
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </button>
  );
};

export default WhatsAppButton;

