import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookOpen, CheckCircle, GraduationCap, Users, Clock, Send } from "lucide-react";
import { useTranslation } from 'react-i18next';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShopPhoneLinks } from "@/components/ShopPhoneLinks";
import { addCourseRegistration } from "@/services/courseRegistrationService";
import { useToast } from "@/components/ui/use-toast";
import { sendAdminNotificationEmail, sendCourseRegistrationConfirmationEmail } from "@/utils/emailService";
import { sendWebsiteLead } from "@/lib/gestionaleLead";
import { openCourseSlots } from "@/data/courseSlots";

const IscrizioneCorsi = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeSlots = openCourseSlots(i18n.language);
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-brand-blue">
          <section className="py-16 md:py-24">
            <div className="container-custom">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t("courseRegistration.success.title")}</h1>
                <p className="text-gray-300 text-lg mb-8">
                  {t("courseRegistration.success.description")}
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 backdrop-blur-sm">
                  <p className="text-sm text-gray-300">
                    <strong className="text-white">{t("courseRegistration.success.nextStepsTitle")}</strong><br />
                    {t("courseRegistration.success.step1")}<br />
                    {t("courseRegistration.success.step2")}<br />
                    {t("courseRegistration.success.step3")}
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="secondary"
                >
                  {t("courseRegistration.success.backHome")}
                </Button>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero + Caratteristiche + Form - Tutto su sfondo brand-blue */}
        <section className="bg-brand-blue py-16 md:py-24">
          <div className="container-custom">

            {/* Titolo */}
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-accent/20 rounded-full mb-6">
                <GraduationCap className="w-8 h-8 text-brand-accent" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                {t("courseRegistration.hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-gray-300">
                {t("courseRegistration.hero.subtitle")}
              </p>
            </div>

            {/* Caratteristiche - 3 card glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[200px]">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-accent/20 rounded-full mb-4">
                  <Users className="w-7 h-7 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("courseRegistration.features.smallGroups.title")}</h3>
                <p className="text-gray-400 text-sm text-center">
                  {t("courseRegistration.features.smallGroups.description")}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[200px]">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-accent/20 rounded-full mb-4">
                  <BookOpen className="w-7 h-7 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("courseRegistration.features.practiceTheory.title")}</h3>
                <p className="text-gray-400 text-sm text-center">
                  {t("courseRegistration.features.practiceTheory.description")}
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg border border-white/10 backdrop-blur-sm flex flex-col items-center justify-center min-h-[200px]">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-accent/20 rounded-full mb-4">
                  <Clock className="w-7 h-7 text-brand-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("courseRegistration.features.twoEvenings.title")}</h3>
                <p className="text-gray-400 text-sm text-center">
                  {t("courseRegistration.features.twoEvenings.description")}
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Sezione Programma del Corso - Full Width */}
        <section className="py-16 md:py-6" style={{ backgroundColor: '#E5DDD3' }}>
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black text-brand-blue mb-3 text-center">
                {t("courseRegistration.program.title")}
              </h2>
              <p className="text-gray-600 mb-10 italic text-center text-lg">
                {t("courseRegistration.program.subtitle")}
              </p>
              
              {/* 4 Moduli in Griglia 2x2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                
                {/* Modulo 1 - Sicurezza */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">1h</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-blue">{t("courseRegistration.program.modules.safety.title")}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li>• {t("courseRegistration.program.modules.safety.item1")}</li>
                    <li>• {t("courseRegistration.program.modules.safety.item2")}</li>
                    <li>• {t("courseRegistration.program.modules.safety.item3")}</li>
                  </ul>
                </div>

                {/* Modulo 2 - FDM */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">3h</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-blue">{t("courseRegistration.program.modules.fdm.title")}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li>• {t("courseRegistration.program.modules.fdm.item1")}</li>
                    <li>• {t("courseRegistration.program.modules.fdm.item2")}</li>
                    <li>• {t("courseRegistration.program.modules.fdm.item3")}</li>
                    <li>• {t("courseRegistration.program.modules.fdm.item4")}</li>
                  </ul>
                </div>

                {/* Modulo 3 - SLA */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">3h</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-blue">{t("courseRegistration.program.modules.sla.title")}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li>• {t("courseRegistration.program.modules.sla.item1")}</li>
                    <li>• {t("courseRegistration.program.modules.sla.item2")}</li>
                    <li>• {t("courseRegistration.program.modules.sla.item3")}</li>
                    <li>• {t("courseRegistration.program.modules.sla.item4")}</li>
                  </ul>
                </div>

                {/* Modulo 4 - Tecniche */}
                <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">1h</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-blue">{t("courseRegistration.program.modules.techniques.title")}</h3>
                  </div>
                  <ul className="space-y-1.5 text-sm text-gray-700">
                    <li>• {t("courseRegistration.program.modules.techniques.item1")}</li>
                    <li>• {t("courseRegistration.program.modules.techniques.item2")}</li>
                    <li>• {t("courseRegistration.program.modules.techniques.item3")}</li>
                    <li>• {t("courseRegistration.program.modules.techniques.item4")}</li>
                  </ul>
                </div>
              </div>

              {/* Dettagli Corso - Lista compatta */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-brand-blue mb-4 text-lg">{t("courseRegistration.includes.title")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item1")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item2")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item3")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item4")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item5")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-brand-accent font-bold">✓</span> {t("courseRegistration.includes.item6")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sezione Prezzo e Form - Su sfondo chiaro */}
        <section className="py-16 md:py-20" style={{ backgroundColor: '#E5DDD3' }}>
          <div className="container-custom">
            <div className="max-w-5xl mx-auto">
              
              {/* Prezzo in evidenza */}
              <div className="grid grid-cols-1 gap-6 mb-10">
                
                {/* Banner Offerta Limitata */}
                <div className="relative">
                  <div className="absolute -top-3 left-4 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-md z-10">
                    {t("courseRegistration.pricing.limitedSpots")}
                  </div>
                  <div className="border-2 border-brand-accent rounded-lg p-6 bg-white shadow-md h-full">
                    <div className="text-center">
                      <p className="text-gray-600 text-sm font-semibold mb-3 mt-2">{t("courseRegistration.pricing.earlyBird")}</p>
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <span className="text-gray-400 line-through text-2xl font-bold">550</span>
                        <span className="text-brand-accent text-5xl font-black">450</span>
                        <span className="text-gray-700 text-xl font-bold">CHF</span>
                      </div>
                      <p className="text-green-600 font-semibold text-sm mb-3">
                        {t("courseRegistration.pricing.savings")}
                      </p>
                      <div className="border-t border-gray-200 pt-3">
                        <p className="text-xs text-gray-500">
                          {t("courseRegistration.pricing.cta")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Iscrizione - Full Width */}
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-brand-blue mb-2">{t("courseRegistration.form.title")}</h3>
                  <p className="text-gray-600 text-sm">
                    {t("courseRegistration.form.description")}
                  </p>
                </div>
                <form 
                  name="iscrizione-corsi" 
                  method="POST"
                  data-netlify="true" 
                  data-netlify-honeypot="bot-field"
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    
                    if (isSubmitting) return;
                    setIsSubmitting(true);
                    
                    const formData = new FormData(e.target as HTMLFormElement);
                    const firstName = formData.get('firstName') as string;
                    const lastName = formData.get('lastName') as string;
                    const email = formData.get('email') as string;
                    const phone = formData.get('phone') as string;
                    const timeSlot = formData.get('timeSlot') as string;
                    const paymentMethod = formData.get('paymentMethod') as string;
                    const message = formData.get('message') as string;
                    
                    try {
                      console.log('📝 Tentativo di salvataggio in Firestore...');
                      console.log('Dati da salvare:', { firstName, lastName, email, phone, timeSlot });
                      
                      // Prepara i dati - Firestore non accetta valori undefined
                      const registrationData: {
                        firstName: string;
                        lastName: string;
                        email: string;
                        phone: string;
                        timeSlot: string;
                        paymentMethod: string;
                        status: "pending";
                        message?: string;
                      } = {
                        firstName,
                        lastName,
                        email,
                        phone,
                        timeSlot,
                        paymentMethod,
                        status: 'pending',
                      };
                      
                      // Aggiungi message solo se non è vuoto
                      if (message && message.trim()) {
                        registrationData.message = message.trim();
                      }
                      
                      // Salva in Firestore - questo è il salvataggio principale
                      const registrationId = await addCourseRegistration(registrationData);
                      
                      console.log('✅ Salvato in Firestore con ID:', registrationId);

                      try {
                        await sendWebsiteLead({
                          kind: "course",
                          firstName,
                          lastName,
                          email,
                          phone,
                          subject: "Iscrizione corso base stampa 3D",
                          message: message?.trim() || "Iscrizione al corso base stampa 3D",
                          service: "corso",
                          extra: `SlotId: ${timeSlot}\nSlot: ${timeSlots.find((slot) => slot.value === timeSlot)?.label || timeSlot}\nPagamento: ${paymentMethod}\nID: ${registrationId}`,
                          botField: String(formData.get("bot-field") || ""),
                        });
                      } catch (leadError) {
                        console.error("Iscrizione non arrivata al gestionale:", leadError);
                      }

                      // Invia in automatico email al cliente + notifica admin
                      const selectedSlotLabel = timeSlots.find((slot) => slot.value === timeSlot)?.label || timeSlot;
                      const [userEmailSent, adminEmailSent] = await Promise.all([
                        sendCourseRegistrationConfirmationEmail({
                          userEmail: email,
                          firstName,
                          lastName,
                          timeSlot: selectedSlotLabel,
                          paymentMethod,
                          registrationId,
                        }),
                        sendAdminNotificationEmail({
                          type: 'new_course_registration',
                          details: `Nuova iscrizione corso da ${firstName} ${lastName}`,
                          userInfo:
                            `Email: ${email}\n` +
                            `Telefono: ${phone}\n` +
                            `Slot: ${selectedSlotLabel}\n` +
                            `Pagamento: ${paymentMethod}\n` +
                            `${message?.trim() ? `Note: ${message.trim()}\n` : ''}` +
                            `ID Iscrizione: ${registrationId}`,
                          courseData: {
                            participantName: `${firstName} ${lastName}`,
                            courseTitle: 'Corso Base Stampa 3D',
                            courseDate: selectedSlotLabel,
                            paymentMethod,
                            registrationCode: registrationId.slice(0, 8).toUpperCase(),
                          },
                        }),
                      ]);

                      if (!userEmailSent || !adminEmailSent) {
                        toast({
                          title: "Iscrizione salvata, ma invio email incompleto",
                          description: "Una o piu email automatiche non sono partite. Puoi reinviare la conferma dal pannello admin.",
                          variant: "destructive",
                        });
                      } else {
                        console.log('✅ Email automatiche inviate (cliente + admin)');
                      }
                      
                      // Invia anche a Netlify Forms come backup (solo in produzione)
                      // In locale questo fallirà con 404, ma non è un problema
                      try {
                        await fetch("/", {
                          method: "POST",
                          headers: { "Content-Type": "application/x-www-form-urlencoded" },
                          body: new URLSearchParams(
                            Array.from(formData.entries()).map(([key, value]) => [key, String(value)])
                          ).toString()
                        });
                        console.log('✅ Inviato anche a Netlify Forms');
                      } catch (netlifyError) {
                        console.log('⚠️ Netlify Forms non disponibile (normale in locale):', netlifyError);
                        // Non è un errore critico, continuiamo comunque
                      }
                      
                      setIsSubmitted(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch (error) {
                      console.error('❌ Errore completo:', error);
                      toast({
                        title: t("courseRegistration.form.errorTitle"),
                        description: error instanceof Error ? error.message : t("courseRegistration.form.errorDescription"),
                        variant: "destructive",
                      });
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <input type="hidden" name="form-name" value="iscrizione-corsi" />
                  <div className="hidden">
                    <Label htmlFor="bot-field">{t("courseRegistration.form.botFieldLabel")}</Label>
                    <Input id="bot-field" name="bot-field" />
                  </div>

                  {/* Nome e Cognome */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700">{t("courseRegistration.form.firstNameLabel")}</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        type="text" 
                        required 
                        placeholder={t("courseRegistration.form.firstNamePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700">{t("courseRegistration.form.lastNameLabel")}</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        type="text" 
                        required 
                        placeholder={t("courseRegistration.form.lastNamePlaceholder")}
                      />
                    </div>
                  </div>

                  {/* Email e Telefono */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">{t("courseRegistration.form.emailLabel")}</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder={t("courseRegistration.form.emailPlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">{t("courseRegistration.form.phoneLabel")}</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder={t("courseRegistration.form.phonePlaceholder")}
                      />
                    </div>
                  </div>

                  {/* Slot Orario */}
                  <div className="space-y-2">
                    <Label htmlFor="timeSlot" className="text-gray-700">{t("courseRegistration.form.timeSlotLabel")}</Label>
                    <select
                      id="timeSlot"
                      name="timeSlot"
                      required
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                    >
                      <option value="">{t("courseRegistration.form.timeSlotPlaceholder")}</option>
                      {timeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      {t("courseRegistration.form.timeSlotHelper")}
                    </p>
                  </div>

                  {/* Metodo di Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-gray-700">{t("courseRegistration.form.paymentMethodLabel")}</Label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
                      defaultValue=""
                    >
                      <option value="" disabled>{t("courseRegistration.form.paymentMethodPlaceholder")}</option>
                      <option value="Bonifico bancario">{t("courseRegistration.form.paymentMethods.bankTransfer")}</option>
                      <option value="TWINT">{t("courseRegistration.form.paymentMethods.twint")}</option>
                      <option value="Contanti in sede">{t("courseRegistration.form.paymentMethods.cashOnSite")}</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-700">{t("courseRegistration.form.messageLabel")}</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      rows={3}
                      placeholder={t("courseRegistration.form.messagePlaceholder")}
                    />
                  </div>

                  {/* Privacy */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <input 
                        type="checkbox" 
                        id="privacy" 
                        name="privacy" 
                        required
                        className="mt-1 accent-brand-accent"
                      />
                      <Label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
                        {t("courseRegistration.form.privacyConsent")}
                      </Label>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button 
                    type="submit" 
                    className="w-full bg-brand-accent hover:bg-brand-accent/80 text-white text-lg py-6"
                    disabled={isSubmitting}
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? t("courseRegistration.form.submitting") : t("courseRegistration.form.submit")}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    {t("courseRegistration.form.requiredFields")}
                  </p>
                </form>
              </div>

              {/* Contatti */}
              <div className="mt-8 text-center text-gray-600 text-sm bg-white/50 rounded-lg p-4">
                <p className="font-semibold text-brand-blue mb-1">{t("courseRegistration.contact.title")}</p>
                <p>
                  {t("courseRegistration.contact.prompt")}{" "}
                  <ShopPhoneLinks stacked={false} linkClassName="text-brand-accent hover:underline font-semibold inline" />
                  {" "}{t("courseRegistration.contact.orEmail")}{" "}
                  <a href="mailto:info@3dmakes.ch" className="text-brand-accent hover:underline font-semibold">info@3dmakes.ch</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IscrizioneCorsi;
