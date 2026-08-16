import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBlogPosts, blogPostsContent } from "@/data/blogContent";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BlogPostPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Get translated blog posts
  const blogPosts = useMemo(() => getBlogPosts(), [t]);
  
  // Trova il post del blog dal parametro ID
  const post = blogPosts.find(post => post.id === id);
  
  // Trova il contenuto completo del post
  const rawContent = id ? blogPostsContent[id as keyof typeof blogPostsContent] : null;

  // Seleziona la versione corretta in base alla lingua attiva (fallback su italiano)
  const postContent = useMemo(() => {
    if (!rawContent) return null;
    const isEn = i18n.language?.toLowerCase().startsWith('en');
    const anyContent = rawContent as any;
    return {
      ...rawContent,
      title: isEn && anyContent.titleEn ? anyContent.titleEn : rawContent.title,
      content: isEn && anyContent.contentEn ? anyContent.contentEn : rawContent.content,
    };
  }, [rawContent, i18n.language]);
  
  // Reindirizza alla pagina 404 se il post non esiste
  useEffect(() => {
    if (!post) {
      navigate('/404', { replace: true });
    }
  }, [post, navigate]);
  
  // Scroll all'inizio della pagina quando il componente viene montato
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  
  // Article + Author structured data (Schema.org)
  useEffect(() => {
    if (!post) return;

    const CANONICAL_BASE_URL = "https://3dmakes.ch";
    const pageUrl = `${CANONICAL_BASE_URL}/blog/${post.id}/`;

    const monthMap: Record<string, number> = {
      Jan: 0, Gen: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4, Mag: 4,
      Jun: 5, Giu: 5,
      Jul: 6, Lug: 6,
      Aug: 7, Ago: 7,
      Sep: 8, Set: 8,
      Oct: 9, Ott: 9,
      Nov: 10,
      Dec: 11, Dic: 11,
    };

    const parseBlogDate = (dateStr: string) => {
      // formati: "20 Apr 2023" oppure "16 Ago 2026"
      const parts = dateStr.split(" ");
      if (parts.length !== 3) return null;
      const day = Number(parts[0]);
      const month = monthMap[parts[1]];
      const year = Number(parts[2]);
      if (Number.isNaN(day) || month === undefined || Number.isNaN(year)) return null;
      const d = new Date(Date.UTC(year, month, day));
      return d.toISOString();
    };

    const isoDate = parseBlogDate(post.date);
    const imageUrl = post.imageSrc.startsWith("http")
      ? post.imageSrc
      : `${CANONICAL_BASE_URL}${post.imageSrc.startsWith("/") ? post.imageSrc : `/${post.imageSrc}`}`;

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${pageUrl}#article`,
      headline: post.title,
      description: post.excerpt,
      image: [imageUrl],
      datePublished: isoDate ?? undefined,
      dateModified: isoDate ?? undefined,
      author: {
        "@type": "Person",
        name: post.author,
        sameAs: "https://ch.linkedin.com/company/3d-makes",
      },
      publisher: {
        "@type": "Organization",
        name: "3DMAKES",
        logo: {
          "@type": "ImageObject",
          url: `${CANONICAL_BASE_URL}/images/3dmakes-logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl,
      },
      isPartOf: {
        "@type": "Blog",
        "@id": `${CANONICAL_BASE_URL}/blog/#blog`,
        name: "3DMAKES",
      },
      inLanguage: i18n.language,
    };

    const ARTICLE_SCHEMA_ID = "article-author-schema-blogpost";
    const existing = document.getElementById(ARTICLE_SCHEMA_ID) as HTMLScriptElement | null;
    const json = JSON.stringify(articleSchema);

    if (existing) {
      existing.textContent = json;
    } else {
      const script = document.createElement("script");
      script.id = ARTICLE_SCHEMA_ID;
      script.type = "application/ld+json";
      script.textContent = json;
      document.head.appendChild(script);
    }

    return () => {
      const el = document.getElementById(ARTICLE_SCHEMA_ID);
      el?.remove();
    };
  }, [post, i18n.language]);

  // Ottieni 3 post correlati (escludi il post corrente)
  const relatedPosts = blogPosts
    .filter(p => p.id !== id)
    .filter(p => p.category === post?.category)
    .slice(0, 3);
  
  // Se non ci sono abbastanza post nella stessa categoria, aggiungi altri post casuali
  if (relatedPosts.length < 3) {
    const additionalPosts = blogPosts
      .filter(p => p.id !== id && !relatedPosts.some(rp => rp.id === p.id))
      .slice(0, 3 - relatedPosts.length);
    
    relatedPosts.push(...additionalPosts);
  }
  
  if (!post) {
    return <div>{t('common.loading')}</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-blue text-white py-12 md:py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/20 text-white mb-6">
                {post.category}
              </div>
              <h1 className="heading-1 mb-6">{post.title}</h1>
              <div className="flex items-center justify-center text-gray-300 text-sm">
                <span>{t('blog.publishedOn')} {post.date}</span>
                <span className="mx-3">•</span>
                <span>{t('blog.by')} {post.author}</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Image */}
        <div className="w-full h-80 md:h-96 relative -mt-8 mb-8">
          <img 
            src={post.imageSrc} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Post Content */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <div
                  className="
                    prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-brand-blue prose-headings:scroll-mt-24
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-3
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-brand-accent
                    prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2
                    prose-p:text-brand-gray prose-p:leading-relaxed prose-p:mb-5
                    prose-a:text-brand-accent hover:prose-a:text-brand-blue prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-ul:my-5 prose-ul:space-y-1 prose-li:marker:text-brand-accent
                    prose-ol:my-5 prose-ol:space-y-1
                    prose-blockquote:border-l-brand-accent prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic
                    prose-code:text-brand-accent prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    prose-hr:border-gray-200
                  "
                >
                  {postContent ? (
                    <>
                      <p className="lead text-xl text-brand-gray !mb-8 !mt-0 font-medium">{post.excerpt}</p>

                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                      >
                        {postContent.content}
                      </ReactMarkdown>
                    </>
                  ) : (
                    <p className="text-xl text-brand-gray mb-8">{post.excerpt}</p>
                  )}
                </div>
                
                {/* Author Info */}
                <div className="mt-12 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xl">
                      {post.author.substring(0, 1)}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold">{post.author}</h3>
                      <p className="text-sm text-brand-gray">{t('blog.author')}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-4">
                {/* Post Details */}
                {postContent?.details && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">{t('blog.technicalDetails')}</h3>
                    <ul className="space-y-3">
                      {Object.entries(postContent.details).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span className="text-brand-gray capitalize">{key}</span>
                          <span className="font-medium">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Challenges */}
                {(postContent as any)?.challenges && Array.isArray((postContent as any).challenges) && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">{t('blog.challenges')}</h3>
                    <ul className="space-y-2">
                      {(postContent as any).challenges.map((challenge: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-brand-accent mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>{challenge}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Benefits */}
                {(postContent as any)?.benefits && Array.isArray((postContent as any).benefits) && (
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-4">{t('blog.benefits')}</h3>
                    <ul className="space-y-2">
                      {(postContent as any).benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-brand-accent mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16" style={{backgroundColor: '#E4DDD4'}}>
            <div className="container-custom">
              <h2 className="heading-2 mb-8">{t('blog.relatedPosts')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Link to={`/blog/${relatedPost.id}`} className="block h-48 overflow-hidden">
                      <img 
                        src={relatedPost.imageSrc} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-brand-accent/10 text-brand-accent">
                          {relatedPost.category}
                        </span>
                      </div>
                      <Link to={`/blog/${relatedPost.id}`} className="block group">
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-accent transition-colors">{relatedPost.title}</h3>
                      </Link>
                      <p className="text-brand-gray text-sm mb-4">{relatedPost.excerpt.substring(0, 100)}...</p>
                      <Link to={`/blog/${relatedPost.id}`} className="text-brand-accent text-sm font-medium hover:underline">
                        {t('blog.readMore')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">
                {t('blog.projectInMind')}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('blog.contactDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                <Button asChild className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/calculator">{t('footer.calculateQuote')}</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                  <Link to="/services">{t('nav.services')}</Link>
                </Button>
                <Button asChild variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                  <Link to="/faq">{t('nav.faq')}</Link>
                </Button>
                <Button asChild className="bg-gray-600 hover:bg-gray-700 text-white">
                  <a href="mailto:info@3dmakes.ch">{t('contact.title')}</a>
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

export default BlogPostPage; 