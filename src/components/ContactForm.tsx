import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

// Dichiarazione gtag per Google Ads tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
const gtag = typeof window !== 'undefined' ? window.gtag : undefined;

const ContactForm = () => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="heading-2 mb-4">{t('contact.messageSentSuccess')}</h2>
            <p className="body-text mb-8">
              {t('contact.thankYouMessage')}
            </p>
            <Button 
              onClick={() => setIsSubmitted(false)}
              variant="outline"
            >
              {t('contact.sendAnotherMessage')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-16 md:py-20 bg-white">
      <div className="container-custom">
        {/* Immagine Contatto */}
        <div className="text-center mb-20">
          <img
            src="/contatto.png"
            alt="Contatto"
            className="w-full h-auto max-w-6xl mx-auto"
            onError={(e) => {
              e.currentTarget.src = "https://placehold.co/1000x400/ffffff/333333?text=Contatto";
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Informazioni di contatto */}
          <div className="space-y-8">
            <div>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('contact.info.email')}</h4>
                    <a 
                      href="mailto:info@3dmakes.ch" 
                      className="text-brand-accent hover:text-brand-blue transition-colors"
                    >
                      info@3dmakes.ch
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('contact.info.phone')}</h4>
                    <a 
                      href="tel:+41762660396" 
                      className="text-brand-accent hover:text-brand-blue transition-colors"
                      onClick={() => {
                        if (gtag) {
                          gtag('event', 'conversion', {
                            'send_to': 'AW-758841456/phone_call',
                            'value': 50.0,
                            'currency': 'CHF'
                          });
                        }
                      }}
                    >
                      +41 76 266 03 96
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">WhatsApp</h4>
                    <a 
                      href="https://wa.me/41762660396" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-500 transition-colors"
                    >
                      {t('contact.chatWithUs')}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-accent/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{t('contact.info.address')}</h4>
                    <p className="text-gray-600">{t('contact.fullAddress')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">{t('contact.info.hours')}</h4>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>{t('contact.mondayFriday')}</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('contact.saturday')}</span>
                  <span>9:00 - 13:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('contact.sunday')}</span>
                  <span>{t('contact.closed')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modulo di contatto */}
          <Card>
            <CardHeader>
              <CardTitle>{t('contact.sendMessage')}</CardTitle>
              <CardDescription>
                {t('contact.form.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                name="contact" 
                method="POST"
                data-netlify="true" 
                data-netlify-honeypot="bot-field"
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Track conversion
                  if (gtag) {
                    gtag('event', 'ads_conversion_Modulo_1', {
                      'send_to': 'AW-758841456/Modulo_1',
                      'value': 40.0,
                      'currency': 'CHF'
                    });
                  }
                  
                  // Submit form data to Netlify
                  const formData = new FormData(e.target as HTMLFormElement);
                  fetch("/", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams(formData as any).toString()
                  }).then(() => {
                    // Redirect to React route after successful submission
                    window.location.href = '/contact-success';
                  }).catch((error) => {
                    console.error('Error:', error);
                    // Fallback - still redirect to success page
                    window.location.href = '/contact-success';
                  });
                }}
              >
                {/* Campo nascosto per Netlify */}
                <input type="hidden" name="form-name" value="contact" />
                
                {/* Honeypot per spam protection */}
                <div className="hidden">
                  <Label htmlFor="bot-field">{t('contact.form.botFieldLabel')}</Label>
                  <Input id="bot-field" name="bot-field" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('contact.form.name')} *</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      required 
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('contact.form.surname')} *</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      required 
                      placeholder={t('contact.form.surnamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.form.email')} *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder={t('contact.form.emailPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder={t('contact.form.phonePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    type="text" 
                    required 
                    placeholder={t('contact.form.subjectPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t('contact.form.message')} *</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    required 
                    rows={5}
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">{t('contact.form.serviceOfInterest')}</Label>
                  <select 
                    id="service" 
                    name="service"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                  >
                    <option value="">{t('contact.form.selectService')}</option>
                    <option value="stampa-3d-fdm">{t('contact.form.services.fdm')}</option>
                    <option value="stampa-3d-sla">{t('contact.form.services.sla')}</option>
                    <option value="taglio-laser">{t('contact.form.services.laser')}</option>
                    <option value="riparazione-stampanti-3d">{t('contact.form.services.largePrint')}</option>
                    <option value="scansione-3d">{t('contact.form.services.scanning')}</option>
                    <option value="prototipazione">{t('contact.form.services.prototyping')}</option>
                    <option value="altro">{t('contact.form.services.other')}</option>
                  </select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-brand-accent hover:bg-brand-accent/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('contact.form.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm; 