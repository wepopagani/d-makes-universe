import { Link } from "react-router-dom";
import BlogPost from "./BlogPost";
import { getBlogPosts } from "../data/blogContent";
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const BlogSection = () => {
  const { t } = useTranslation();
  
  // Get translated blog posts
  const blogPosts = useMemo(() => getBlogPosts(), [t]);
  
  // Ottieni gli ultimi 3 post del blog
  const latestPosts = blogPosts.slice(0, 5);

  return (
    <section className="pt-4 pb-12 md:pt-6 md:pb-24 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="mb-6 -mt-8">
            <img 
              src="/curioso.png" 
              alt="Curioso"
              className="w-full h-auto max-w-2xl mx-auto scale-75"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x300/ffffff/333333?text=Curioso";
              }}
            />
          </div>
          <h2 className="heading-2 mb-6">
            {t('blog.subtitle')}
          </h2>
          <p className="body-text">
            {t('services.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <BlogPost key={post.id} {...post} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link to="/blog" className="inline-flex items-center text-brand-accent font-medium hover:text-brand-blue transition-colors">
            {t('blog.allArticles')}
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
