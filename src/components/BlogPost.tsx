
import { Link } from "react-router-dom";

interface BlogPostProps {
  id: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  author: string;
  date: string;
  category: string;
  featured?: boolean;
}

const BlogPost = ({ id, title, excerpt, imageSrc, author, date, category, featured = false }: BlogPostProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-shadow hover:shadow-md h-full flex flex-col ${featured ? 'md:col-span-2' : ''}`}>
      <div className={`overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
        <Link to={`/blog/${id}`}>
          <img 
            src={imageSrc} 
            alt={title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-brand-accent/10 text-brand-accent">
            {category}
          </span>
          <span className="text-sm text-brand-gray ml-auto">
            {date}
          </span>
        </div>
        
        <Link to={`/blog/${id}`} className="group">
          <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors">
            {title}
          </h3>
        </Link>
        
        <p className="text-brand-gray mb-4 flex-grow">
          {excerpt}
        </p>
        
        <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-medium text-sm">
              {author.substring(0, 1)}
            </div>
            <span className="ml-2 text-sm font-medium">{author}</span>
          </div>
          <Link to={`/blog/${id}`} className="ml-auto text-brand-accent text-sm font-medium hover:underline">
            Leggi articolo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
