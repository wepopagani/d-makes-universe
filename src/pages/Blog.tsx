import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BlogPost from "@/components/BlogPost";
import { getBlogPosts } from "@/data/blogContent";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Blog = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get translated blog posts
  const blogPosts = useMemo(() => getBlogPosts(), [t]);
  
  // Estrai categorie uniche dai post del blog
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  
  // Trova l'ultimo post featured da mostrare in evidenza
  const featuredPost = blogPosts.find(post => post.featured);
  
  // Filtra i post in base alla categoria selezionata, escludendo il post featured
  const filteredPosts = selectedCategory 
    ? blogPosts.filter(post => post.category === selectedCategory && post.id !== featuredPost?.id) 
    : blogPosts.filter(post => post.id !== featuredPost?.id);
  
  // Effect to handle page load scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-blue text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="heading-1 mb-6">{t('blog.title')}</h1>
              <p className="text-xl text-gray-300">
                {t('blog.subtitle')}
              </p>
            </div>
          </div>
        </section>
        
        {/* Featured Post */}
        {featuredPost && (
          <section className="py-16 md:py-24 bg-white">
            <div className="container-custom">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
                    {featuredPost.category}
                  </div>
                  <h2 className="heading-2 mb-6">{featuredPost.title}</h2>
                  <p className="body-text mb-8">{featuredPost.excerpt}</p>
                  <div className="flex items-center mb-8 text-brand-gray">
                    <span>{t('blog.publishedOn')} {featuredPost.date}</span>
                    <span className="mx-3">•</span>
                    <span>{t('blog.by')} {featuredPost.author}</span>
                  </div>
                  <Button asChild>
                    <Link to={`/blog/${featuredPost.id}`}>{t('blog.readMore')}</Link>
                  </Button>
                </div>
                <div className="relative">
                  <div className="bg-brand-accent/10 absolute -left-6 -top-6 w-32 h-32 rounded-lg"></div>
                  <img
                    src={featuredPost.imageSrc}
                    alt={featuredPost.title}
                    className="rounded-lg w-full h-auto object-cover shadow-lg relative z-10"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Blog Categories */}
        <section className="py-8" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === null 
                    ? 'bg-brand-accent text-white' 
                    : 'bg-white text-brand-gray hover:bg-gray-100'}`}
              >
                {t('common.all')}
              </button>
              
              {categories.map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedCategory === category 
                      ? 'bg-brand-accent text-white' 
                      : 'bg-white text-brand-gray hover:bg-gray-100'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* All Blog Posts */}
        <section className="py-16 md:py-24" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <h2 className="text-2xl font-semibold mb-8">
              {selectedCategory ? t('blog.articlesCategory', { category: selectedCategory }) : t('blog.allArticles')}
            </h2>
            
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Link to={`/blog/${post.id}`} className="block h-48 overflow-hidden">
                      <img
                        src={post.imageSrc}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-brand-accent/10 text-brand-accent">
                          {post.category}
                        </span>
                      </div>
                      <Link to={`/blog/${post.id}`} className="block group">
                        <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-accent transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-brand-gray mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-brand-gray">{post.date}</span>
                        <Link 
                          to={`/blog/${post.id}`} 
                          className="text-brand-accent text-sm font-medium hover:underline"
                        >
                          {t('blog.readMore')}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-brand-gray">{t('blog.noArticlesFound')}</p>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">
                {t('blog.moreServicesTitle')}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('blog.moreServicesDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/services">{t('nav.services')}</Link>
                </Button>
                <Button asChild className="bg-gray-600 hover:bg-gray-700 text-white">
                  <Link to="/contact">{t('contact.title')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
