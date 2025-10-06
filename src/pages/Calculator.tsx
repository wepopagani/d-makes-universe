import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import QuoteCalculator from "@/components/QuoteCalculator";
import { useTranslation } from 'react-i18next';

const Calculator = () => {
  const { t } = useTranslation();

  // Sample FAQ data
  const faqs = [
    {
      question: t('faq.howItWorks'),
      answer: t('calculator.howItWorks')
    },
    {
      question: t('faq.accuracy'),
      answer: t('calculator.accuracy')
    },
    {
      question: t('faq.fileFormats'),
      answer: t('calculator.fileFormats')
    },
    {
      question: t('faq.deliveryTimes'),
      answer: t('calculator.deliveryTimes')
    },
    {
      question: t('faq.modelModification'),
      answer: t('calculator.modelModification')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-brand-blue text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="heading-1 mb-6">{t('calculator.title')}</h1>
              <p className="text-xl text-gray-300">
                {t('calculator.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16 md:py-24" style={{backgroundColor: '#E4DDD4'}}>
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              <QuoteCalculator />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="heading-2 mb-6">{t('faq.title')}</h2>
              <p className="body-text">
                {t('faq.subtitle')}
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 transition-all">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-brand-gray">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-12">
              <p className="body-text mb-6">{t('contact.title')}?</p>
              <a href="mailto:info@3dmakes.ch" className="inline-flex items-center text-brand-accent font-medium hover:underline">
                {t('contact.form.send')}
                <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;
