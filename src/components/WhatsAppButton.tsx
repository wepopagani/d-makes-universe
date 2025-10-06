const WhatsAppButton = () => {
  const phoneNumber = "0762660396"; // Numero senza spazi e prefisso
  const message = "Ciao! Sono interessato ai vostri servizi di stampa 3D.";
  
  const handleWhatsAppClick = () => {
    const url = `https://wa.me/41${phoneNumber}?text=${encodeURIComponent(message)}`;
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
        alt="WhatsApp" 
        className="w-6 h-6 group-hover:animate-pulse"
      />
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        Scrivici su WhatsApp
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
    </button>
  );
};

export default WhatsAppButton;

