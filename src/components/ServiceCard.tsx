import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  title: string;
  description: string;
  link: string;
}

const ServiceCard = ({ title, description, link }: ServiceCardProps) => {
  const { t } = useTranslation();

  return (
    <Link to={link} className="block h-full">
      <div className="group relative bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100 cursor-pointer h-full flex flex-col p-6 hover:border-brand-accent/40">
        <h3 className="text-xl font-semibold text-brand-blue mb-3 flex-shrink-0 line-clamp-2 group-hover:text-brand-accent transition-colors">
          {title}
        </h3>
        <p className="text-brand-gray mb-5 flex-grow line-clamp-4 leading-relaxed">
          {description}
        </p>
        <Button variant="outline" className="pointer-events-none flex-shrink-0 mt-auto">
          {t("common.discoverMore")}
        </Button>
      </div>
    </Link>
  );
};

export default ServiceCard;
