import emailjs from '@emailjs/browser';
import { SHOP_PRIMARY_WA_DIGITS, shopPhonesEmailHtmlFragments } from '@/constants/shopPhones';

// Configurazione EmailJS
const EMAILJS_SERVICE_ID = 'service_z5mjon2'; // Il tuo Service ID da EmailJS
// Sostituisci questi ID con quelli reali che ti darà EmailJS dopo aver creato i template
const EMAILJS_TEMPLATE_ID_WELCOME = 'template_xq7429h'; // ID del template Welcome
const EMAILJS_TEMPLATE_ID_COURSE_REGISTRATION = 'template_rg7rn3i'; // Template Course Subscription
// Manteniamo compatibilita con i flussi legacy usando il template corso
const EMAILJS_TEMPLATE_ID_GENERAL = EMAILJS_TEMPLATE_ID_COURSE_REGISTRATION;
const EMAILJS_TEMPLATE_ID_WELCOME_LEGACY = 'template_xq74z9h'; // Fallback per vecchio ID welcome
const EMAILJS_TEMPLATE_ID_COURSE_LEGACY = 'template_90n08kw'; // Fallback storico template corso/ordine
const EMAILJS_PUBLIC_KEY = 'y0Ulz-qSVjiET74Lx'; // La tua Public Key da EmailJS

// Inizializza EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailData {
  email: string;
  to_name: string;
  from_name?: string;
  subject?: string;
  message?: string;
  order_id?: string;
  order_details?: string;
  quote_price?: string;
  delivery_date?: string;
  [key: string]: any; // Permette proprietà aggiuntive per EmailJS
}

const BRAND_BLUE = '#1A2A4A';
const BRAND_CYAN = '#3D9DFF';
const BRAND_CYAN_HOVER = '#2B8BEA';

// Template email di benvenuto
export const sendWelcomeEmail = async (userData: {
  email: string;
  nome: string;
  cognome: string;
}): Promise<boolean> => {
  try {
    const brandedHtml = createEmailTemplate(
      'Benvenuto in 3DMAKES!',
      `
        <p>Ciao <strong>${userData.nome}</strong>, grazie per esserti registrato su 3DMAKES.</p>
        <p>Da ora puoi gestire i tuoi progetti 3D, richiedere preventivi e monitorare i tuoi ordini in un unico posto.</p>
      `,
      'Esplora le Tecnologie',
      'https://3dmakes.ch/services'
    );

    const templateParams: EmailData = {
      email: userData.email,
      to_name: `${userData.nome} ${userData.cognome}`,
      from_name: '3DMAKES Team',
      order_id: 'BENVENUTO',
      order_details: `Benvenuto ${userData.nome}! Grazie per esserti registrato su 3DMAKES.`,
      quote_price: '0.00 CHF',
      delivery_date: 'Immediata',
      html_content: brandedHtml
    };

    const welcomeTemplateCandidates = [
      EMAILJS_TEMPLATE_ID_WELCOME,
      EMAILJS_TEMPLATE_ID_WELCOME_LEGACY,
      EMAILJS_TEMPLATE_ID_COURSE_REGISTRATION,
    ];

    let sent = false;
    let lastError: unknown = null;

    for (const templateId of welcomeTemplateCandidates) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
        sent = true;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!sent) {
      throw lastError || new Error('Nessun template EmailJS disponibile per il welcome');
    }

    console.log('Email di benvenuto inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di benvenuto:', error);
    return false;
  }
};

// Template email di conferma ordine
export const sendOrderConfirmationEmail = async (orderData: {
  userEmail: string;
  userName: string;
  orderId: string;
  orderDetails: string;
  totalPrice: number;
  estimatedDelivery: string;
}): Promise<boolean> => {
  try {
    const brandedHtml = createEmailTemplate(
      `Conferma Ordine #${orderData.orderId}`,
      `
        <p>Ciao <strong>${orderData.userName}</strong>, abbiamo ricevuto il tuo ordine.</p>
        <p><strong>Dettagli:</strong> ${orderData.orderDetails}</p>
        <p><strong>Totale:</strong> ${orderData.totalPrice.toFixed(2)} CHF</p>
        <p><strong>Consegna stimata:</strong> ${orderData.estimatedDelivery}</p>
      `,
      'Vai alla Dashboard',
      'https://3dmakes.ch/dashboard'
    );

    const templateParams: EmailData = {
      email: orderData.userEmail,
      to_name: orderData.userName,
      from_name: '3DMAKES Team',
      subject: `Conferma Ordine #${orderData.orderId}`,
      order_id: orderData.orderId,
      order_details: orderData.orderDetails,
      quote_price: `${orderData.totalPrice.toFixed(2)} CHF`,
      delivery_date: orderData.estimatedDelivery,
      html_content: brandedHtml
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      templateParams
    );

    console.log('Email di conferma ordine inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di conferma ordine:', error);
    return false;
  }
};

// Template email di conferma iscrizione corso
export const sendCourseRegistrationConfirmationEmail = async (registrationData: {
  userEmail: string;
  firstName: string;
  lastName: string;
  timeSlot: string;
  paymentMethod: string;
  registrationId: string;
}): Promise<boolean> => {
  try {
    const fullName = `${registrationData.firstName} ${registrationData.lastName}`.trim();
    const brandedHtml = createEmailTemplate(
      'Iscrizione Corso Ricevuta',
      `
        <p>Ciao <strong>${registrationData.firstName}</strong>, abbiamo ricevuto la tua richiesta di iscrizione al corso.</p>
        <h3 style="margin: 20px 0 10px; color: #1f2937;">Riepilogo Iscrizione Corso</h3>
        <p><strong>Studente:</strong> ${fullName}</p>
        <p><strong>Data del corso:</strong> ${registrationData.timeSlot}</p>
        <p><strong>Modalita di pagamento:</strong> ${registrationData.paymentMethod}</p>
        <p style="margin-top: 16px;">Ti contatteremo entro <strong>24-48 ore</strong> per confermare definitivamente il posto e inviarti i prossimi passaggi.</p>
      `,
      'Contattaci su WhatsApp',
      `https://wa.me/${SHOP_PRIMARY_WA_DIGITS}`
    );

    const templateParams: EmailData = {
      email: registrationData.userEmail,
      to_name: fullName,
      from_name: '3DMAKES Team',
      subject: 'Conferma richiesta iscrizione - Corso Base Stampa 3D',
      order_id: registrationData.registrationId.slice(0, 8).toUpperCase(),
      order_details: `Conferma iscrizione al corso - Studente: ${fullName}`,
      delivery_date: registrationData.timeSlot,
      message: `Pagamento selezionato: ${registrationData.paymentMethod}. Ti contatteremo entro 24-48 ore per la conferma finale.`,
      payment_method: registrationData.paymentMethod,
      // Campi pronti per template EmailJS dedicato corso
      email_title: 'Conferma Iscrizione al Corso',
      section_title: 'Riepilogo Iscrizione Corso',
      course_title: 'Corso Base Stampa 3D',
      student_name: fullName,
      course_date: registrationData.timeSlot,
      registration_code: registrationData.registrationId.slice(0, 8).toUpperCase(),
      cta_label: 'Contattaci su WhatsApp',
      cta_url: `https://wa.me/${SHOP_PRIMARY_WA_DIGITS}`,
      html_content: brandedHtml
    };

    const templateCandidates = [
      EMAILJS_TEMPLATE_ID_COURSE_REGISTRATION,
      EMAILJS_TEMPLATE_ID_GENERAL,
      EMAILJS_TEMPLATE_ID_COURSE_LEGACY,
    ];
    let sent = false;
    let lastError: unknown = null;

    for (const templateId of templateCandidates) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams);
        sent = true;
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!sent) {
      throw lastError || new Error('Nessun template EmailJS disponibile per conferma corso');
    }

    console.log('Email di conferma iscrizione corso inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di conferma iscrizione corso:', error);
    return false;
  }
};

// Template email di aggiornamento ordine
export const sendOrderUpdateEmail = async (orderData: {
  userEmail: string;
  userName: string;
  orderId: string;
  status: string;
  message: string;
}): Promise<boolean> => {
  try {
    const brandedHtml = createEmailTemplate(
      `Aggiornamento Ordine #${orderData.orderId}`,
      `
        <p>Ciao <strong>${orderData.userName}</strong>, ci sono novita sul tuo ordine.</p>
        <p>${orderData.message}</p>
      `,
      'Controlla lo stato ordine',
      'https://3dmakes.ch/dashboard/ordini'
    );

    const templateParams: EmailData = {
      email: orderData.userEmail,
      to_name: orderData.userName,
      from_name: '3DMAKES Team',
      subject: `Aggiornamento Ordine #${orderData.orderId}`,
      order_id: orderData.orderId,
      message: orderData.message,
      html_content: brandedHtml
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      templateParams
    );

    console.log('Email di aggiornamento ordine inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di aggiornamento ordine:', error);
    return false;
  }
};

// Template email preventivo pronto
export const sendQuoteReadyEmail = async (quoteData: {
  userEmail: string;
  userName: string;
  projectName: string;
  quotePrice: number;
  validUntil: string;
}): Promise<boolean> => {
  try {
    const brandedHtml = createEmailTemplate(
      `Preventivo pronto: ${quoteData.projectName}`,
      `
        <p>Ciao <strong>${quoteData.userName}</strong>, il tuo preventivo e pronto.</p>
        <p><strong>Progetto:</strong> ${quoteData.projectName}</p>
        <p><strong>Importo:</strong> ${quoteData.quotePrice.toFixed(2)} CHF</p>
        <p><strong>Validita:</strong> ${quoteData.validUntil}</p>
      `,
      'Visualizza preventivo',
      'https://3dmakes.ch/dashboard/progetti'
    );

    const templateParams: EmailData = {
      email: quoteData.userEmail,
      to_name: quoteData.userName,
      from_name: '3DMAKES Team',
      subject: `Preventivo Pronto - ${quoteData.projectName}`,
      order_id: `PREVENTIVO-${Date.now().toString().slice(-6)}`,
      order_details: `Il tuo preventivo per "${quoteData.projectName}" è pronto!`,
      quote_price: `${quoteData.quotePrice.toFixed(2)} CHF`,
      delivery_date: `Valido per ${quoteData.validUntil}`,
      message: `Ciao ${quoteData.userName}! Il tuo preventivo è pronto. Puoi procedere con l'ordine accedendo alla tua area clienti.`,
      html_content: brandedHtml
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      templateParams
    );

    console.log('Email preventivo pronto inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email preventivo pronto:', error);
    return false;
  }
};

// Template email preventivo personalizzato da admin
export const sendCustomQuoteEmail = async (quoteData: {
  clientEmail: string;
  clientName: string;
  description: string;
  amount: number;
  quoteId: string;
  pdfUrl?: string;
  validUntil?: Date;
  notes?: string;
}): Promise<boolean> => {
  try {
    const brandedHtml = createEmailTemplate(
      `Preventivo Personalizzato #${quoteData.quoteId}`,
      `
        <p>Ciao <strong>${quoteData.clientName}</strong>, abbiamo preparato il tuo preventivo personalizzato.</p>
        <p><strong>Descrizione:</strong> ${quoteData.description}</p>
        <p><strong>Importo:</strong> ${quoteData.amount.toFixed(2)} CHF</p>
      `,
      quoteData.pdfUrl ? 'Apri Preventivo PDF' : undefined,
      quoteData.pdfUrl
    );

    const templateParams: EmailData = {
      email: quoteData.clientEmail,
      to_name: quoteData.clientName,
      from_name: '3DMAKES Team',
      subject: `Preventivo Personalizzato #${quoteData.quoteId} - 3DMAKES`,
      quote_id: quoteData.quoteId,
      quote_description: quoteData.description,
      quote_price: `${quoteData.amount.toFixed(2)} CHF`,
      quote_pdf_url: quoteData.pdfUrl || '',
      quote_valid_until: quoteData.validUntil ? quoteData.validUntil.toLocaleDateString('it-IT') : '',
      quote_notes: quoteData.notes || '',
      html_content: brandedHtml
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      templateParams
    );

    console.log('Email preventivo personalizzato inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email preventivo personalizzato:', error);
    return false;
  }
};

// Email generica
export const sendGenericEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const mergedData: EmailData = {
      ...emailData,
      html_content:
        emailData.html_content ||
        createEmailTemplate(
          emailData.subject || 'Comunicazione 3DMAKES',
          `<p>${emailData.message || 'Hai ricevuto una nuova comunicazione da 3DMAKES.'}</p>`
        )
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      mergedData
    );

    console.log('Email generica inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email generica:', error);
    return false;
  }
};

// Funzione per inviare email di notifica admin
export const sendAdminNotificationEmail = async (data: {
  type: 'new_order' | 'new_user' | 'new_message' | 'new_quote_request' | 'new_course_registration';
  details: string;
  userInfo?: string;
  replyTo?: string;
  courseData?: {
    participantName: string;
    courseTitle: string;
    courseDate: string;
    paymentMethod: string;
    registrationCode: string;
  };
}): Promise<boolean> => {
  try {
    const subjectMap = {
      'new_order': '🛒 Nuovo Ordine',
      'new_user': '👤 Nuovo Utente Registrato',
      'new_message': '💬 Nuovo Messaggio',
      'new_quote_request': '📋 Nuova Richiesta di Preventivo',
      'new_course_registration': '🎓 Nuova Iscrizione Corso'
    };

    const brandedHtml = createEmailTemplate(
      subjectMap[data.type],
      `
        <p>${data.details}</p>
        ${data.userInfo ? `<p><strong>Dettagli:</strong> ${data.userInfo.replace(/\n/g, '<br>')}</p>` : ''}
      `
    );

    const templateParams: EmailData = {
      email: 'info@3dmakes.ch',
      to_email: 'info@3dmakes.ch',
      to_name: 'Admin 3DMAKES',
      from_name: 'Sistema 3DMAKES',
      subject: subjectMap[data.type],
      message: data.details,
      order_details: data.userInfo || '',
      order_id: `NOTIFICA-${Date.now()}`,
      reply_to: data.replyTo || 'info@3dmakes.ch',
      html_content: brandedHtml
    };

    // Se usiamo il template corso anche per le notifiche admin, valorizziamo i placeholder dedicati
    if (data.type === 'new_course_registration' && data.courseData) {
      templateParams.to_name = '3DMAKES';
      templateParams.email_title = 'Nuova Prenotazione Corso';
      templateParams.section_title = 'Dati Partecipante';
      templateParams.student_name = '3DMAKES';
      templateParams.course_title = `${data.courseData.courseTitle} - ${data.courseData.participantName}`;
      templateParams.course_date = data.courseData.courseDate;
      templateParams.payment_method = data.courseData.paymentMethod;
      templateParams.registration_code = data.courseData.registrationCode;
      templateParams.cta_label = 'Apri pannello admin';
      templateParams.cta_url = 'https://3dmakes.ch/admin';
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_GENERAL,
      templateParams
    );

    console.log('Email di notifica admin inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di notifica admin:', error);
    return false;
  }
};

// Utility per creare template HTML personalizzati
export const createEmailTemplate = (
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .header {
          background: ${BRAND_BLUE};
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .button {
          display: inline-block;
          background: ${BRAND_CYAN};
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background: ${BRAND_CYAN_HOVER};
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo"><span style="color: #ffffff;">3D</span><span style="color: ${BRAND_CYAN};">MAKES</span></div>
        <p style="margin: 0; opacity: 0.9;">Innovazione nella Stampa 3D</p>
      </div>
      
      <div class="content">
        <h1 style="color: #1f2937; margin-top: 0;">${title}</h1>
        ${content}
        
        ${buttonText && buttonUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" class="button">${buttonText}</a>
          </div>
        ` : ''}
        
        <div class="divider"></div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Se hai domande, non esitare a contattarci:
          <br>
          📧 <a href="mailto:info@3dmakes.ch">info@3dmakes.ch</a>
          <br>
          📱 ${shopPhonesEmailHtmlFragments()}
        </p>
      </div>
      
      <div class="footer">
        <p>© 2024 3DMAKES. Tutti i diritti riservati.</p>
        <p>Questo messaggio è stato inviato automaticamente, non rispondere a questa email.</p>
      </div>
    </body>
    </html>
  `;
}; 