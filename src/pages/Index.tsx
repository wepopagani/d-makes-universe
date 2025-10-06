import AboutSection from "@/components/AboutSection";
import Banner from "@/components/Banner";
import BlogSection from "@/components/BlogSection";
import CallToAction from "@/components/CallToAction";
import ContactForm from "@/components/ContactForm";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";
import Navbar from "@/components/Navbar";
import SearchSection from "@/components/SearchSection";
import ServicesSection from "@/components/ServicesSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Banner />
        <Hero />
        <AboutSection />
        <ServicesSection />
        <MissionSection />
        <section className="bg-white py-16 md:py-24">
          <div className="container-custom">
            <div className="flex justify-center items-center gap-8">
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
                    img.src = "https://placehold.co/600x400/ffffff/333333?text=Tony+Video";
                    img.className = "w-full h-auto";
                    img.alt = "Tony si sdraia";
                    e.currentTarget.parentNode?.replaceChild(img, e.currentTarget);
                  }}
                >
                  Il tuo browser non supporta il tag video.
                </video>
              </div>
              <div className="max-w-2xl w-full">
                <img 
                  src="/iniziamo.png" 
                  alt="Iniziamo"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/1000x400/ffffff/333333?text=Iniziamo";
                  }}
                />
              </div>
            </div>
          </div>
        </section>
        <SearchSection />
        <section className="py-16 md:py-24" style={{backgroundColor: '#E5DDD3'}}>
          <div className="container-custom">
            <div className="text-center">
              <div className="mb-8 -mt-8">
                <img 
                  src="/hai idea.png" 
                  alt="Hai Idea"
                  className="w-full h-auto max-w-3xl mx-auto scale-75"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/1000x400/d1d5db/333333?text=Hai+Idea";
                  }}
                />
              </div>
              <Button asChild size="lg" className="bg-brand-blue text-white hover:bg-brand-blue/90 font-semibold px-12 py-5 text-xl scale-140">
                <Link to="/calculator">Richiedi Preventivo</Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="bg-white py-4 md:py-6"></section>
        <BlogSection />
        <FAQSection />
        <ContactForm />
        <CallToAction />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
