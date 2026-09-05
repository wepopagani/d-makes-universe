import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ServiceCardProps {
  title: string;
  description: string;
  link: string;
  image?: string;
  badge?: string;
}

const ServiceCard = ({ title, description, link, image, badge }: ServiceCardProps) => {
  const { t } = useTranslation();

  return (
    <Link to={link} className="block h-full">
      <div className="group relative bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-xl border border-gray-100 cursor-pointer h-full flex flex-col overflow-hidden hover:border-brand-accent/40">
        {image && (
          <div className="relative h-44 overflow-hidden bg-brand-blue">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            {badge && (
              <span className="absolute left-4 top-4 inline-flex px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-brand-blue text-white">
                {badge}
              </span>
            )}
          </div>
        )}
        <div className="p-6 flex flex-col flex-grow">
          {!image && badge && (
            <span className="mb-4 inline-flex self-start px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-brand-blue text-white">
              {badge}
            </span>
          )}
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
      </div>
    </Link>
  );
};

export default ServiceCard;
