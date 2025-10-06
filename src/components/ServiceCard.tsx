
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  imageUrl: string;
}

const ServiceCard = ({ title, description, icon, link, imageUrl }: ServiceCardProps) => {
  const getImageClasses = () => {
    let baseClasses = "w-full h-full object-contain transition-transform duration-500";
    
    if (imageUrl.includes('stampa 3d resina logo')) {
      return `${baseClasses} sla-image-larger`;
    } else if (imageUrl.includes('stampa 3d logo')) {
      return `${baseClasses}`;
    } else if (imageUrl.includes('taglio laser logo')) {
      return `${baseClasses} laser-image-smaller`;
    } else if (imageUrl.includes('riparazione logo')) {
      return `${baseClasses} repair-image-smaller`;
    } else if (imageUrl.includes('scan logo')) {
      return `${baseClasses} scan-image-smaller group-hover:scale-115`;
    } else if (imageUrl.includes('prototipo logo')) {
      return `${baseClasses} group-hover:scale-130`;
    } else if (imageUrl.includes('stampa slm')) {
      return `${baseClasses} scale-[0.675]`;
    } else if (imageUrl.includes('stampa sls')) {
      return `${baseClasses} scale-[0.857375]`;
    } else {
      return `${baseClasses} group-hover:scale-105`;
    }
  };

  return (
    <Link to={link} className="block h-full">
      <div className="group relative bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl overflow-hidden border border-gray-100 cursor-pointer h-full flex flex-col">
        <div className="h-48 overflow-hidden flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={title} 
            className={getImageClasses()}
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-brand-accent/10 text-brand-accent mb-4 flex-shrink-0">
            {icon}
          </div>
          <h3 className="text-xl font-semibold mb-3 flex-shrink-0">{title}</h3>
          <p className="text-brand-gray mb-5 flex-grow">{description}</p>
          <Button variant="outline" className="pointer-events-none flex-shrink-0">
            Scopri di più
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
