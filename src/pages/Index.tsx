import AboutSection from "@/components/AboutSection";
import Banner from "@/components/Banner";
import BlogSection from "@/components/BlogSection";
import CallToAction from "@/components/CallToAction";
import ContactForm from "@/components/ContactForm";
import FaqHomeTeaser from "@/components/FaqHomeTeaser";
import Footer from "@/components/Footer";
import GoogleReviewsCarousel from "@/components/GoogleReviewsCarousel";
import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";
import Navbar from "@/components/Navbar";
import PartnersLogos from "@/components/PartnersLogos";
import SearchSection from "@/components/SearchSection";
import ServicesSection from "@/components/ServicesSection";
import HowWeHelpSection from "@/components/HowWeHelpSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Index = () => {
  const { t } = useTranslation();
  const tonyVideoFallbackText = encodeURIComponent(t("index.tonyVideoFallbackText"));
  const iniziamoFallbackText = encodeURIComponent(t("index.iniziamoFallbackText"));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Banner />
        <Hero />
        <AboutSection />
        <GoogleReviewsCarousel />
        <ServicesSection />
        <HowWeHelpSection />
        <FaqHomeTeaser />
        <MissionSection />
        <section className="bg-white py-16 md:py-24">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
              <div className="max-w-2xl w-full">
                <video 
                  src="/tony si sdraia.mp4" 
                  className="w-full h-auto"
                  autoPlay
                  muted
                  playsInline
                  onEnded={(e) => {
                    // Quando il video finisce, riparti dal secondo 3
                    e.currentTarget.currentTime = 3;
                    e.currentTarget.play();
                  }}
                  onError={(e) => {
                    // Fallback to image if video fails
                    const img = document.createElement('img');
                    img.src = `https://placehold.co/600x400/ffffff/333333?text=${tonyVideoFallbackText}`;
                    img.className = "w-full h-auto";
                    img.alt = t("index.tonyVideoAlt");
                    e.currentTarget.parentNode?.replaceChild(img, e.currentTarget);
                  }}
                >
                  {t("index.videoUnsupported")}
                </video>
              </div>
              <div className="max-w-2xl w-full">
                <img 
                  src="/iniziamo.png" 
                  alt={t("index.iniziamoAlt")}
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/1000x400/ffffff/333333?text=${iniziamoFallbackText}`;
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        <SearchSection />
        <section className="py-16 md:py-20" style={{backgroundColor: '#E5DDD3'}}>
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-4">{t("services.readyToRealize")}</h2>
              <p className="body-text mb-8">{t("services.contactToday")}</p>
              <Button asChild size="lg" className="bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold px-8 md:px-12 py-4 md:py-5 text-lg md:text-xl">
                <Link to="/calculator">{t("nav.requestQuote")}</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-white py-4 md:py-6"></section>
        <BlogSection />
        <PartnersLogos />
        <ContactForm />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
