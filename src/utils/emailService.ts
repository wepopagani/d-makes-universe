import emailjs from '@emailjs/browser';

// Configurazione EmailJS
const EMAILJS_SERVICE_ID = 'service_z5mjon2'; // Il tuo Service ID da EmailJS
// Sostituisci questi ID con quelli reali che ti darà EmailJS dopo aver creato i template
const EMAILJS_TEMPLATE_ID_WELCOME = 'template_xq74z9h'; // ID del template Welcome
const EMAILJS_TEMPLATE_ID_ORDER_CONFIRMATION = 'template_90n08kw'; // ID del template Order Confirmation
const EMAILJS_TEMPLATE_ID_ORDER_UPDATE = 'template_90n08kw'; // Usa template Order Confirmation per aggiornamenti
const EMAILJS_TEMPLATE_ID_QUOTE_READY = 'template_90n08kw'; // Usa template Order Confirmation per preventivi
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

// Template email di benvenuto
export const sendWelcomeEmail = async (userData: {
  email: string;
  nome: string;
  cognome: string;
}): Promise<boolean> => {
  try {
    const templateParams: EmailData = {
      email: userData.email,
      to_name: `${userData.nome} ${userData.cognome}`,
      from_name: '3DMAKES Team',
      order_id: 'BENVENUTO',
      order_details: `Benvenuto ${userData.nome}! Grazie per esserti registrato su 3DMAKES.`,
      quote_price: '0.00 CHF',
      delivery_date: 'Immediata'
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_WELCOME,
      templateParams
    );

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
    const templateParams: EmailData = {
      email: orderData.userEmail,
      to_name: orderData.userName,
      from_name: '3DMAKES Team',
      subject: `Conferma Ordine #${orderData.orderId}`,
      order_id: orderData.orderId,
      order_details: orderData.orderDetails,
      quote_price: `${orderData.totalPrice.toFixed(2)} CHF`,
      delivery_date: orderData.estimatedDelivery
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_ORDER_CONFIRMATION,
      templateParams
    );

    console.log('Email di conferma ordine inviata con successo');
    return true;
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di conferma ordine:', error);
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
    const templateParams: EmailData = {
      email: orderData.userEmail,
      to_name: orderData.userName,
      from_name: '3DMAKES Team',
      subject: `Aggiornamento Ordine #${orderData.orderId}`,
      order_id: orderData.orderId,
      message: orderData.message
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_ORDER_UPDATE,
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
    const templateParams: EmailData = {
      email: quoteData.userEmail,
      to_name: quoteData.userName,
      from_name: '3DMAKES Team',
      subject: `Preventivo Pronto - ${quoteData.projectName}`,
      order_id: `PREVENTIVO-${Date.now().toString().slice(-6)}`,
      order_details: `Il tuo preventivo per "${quoteData.projectName}" è pronto!`,
      quote_price: `${quoteData.quotePrice.toFixed(2)} CHF`,
      delivery_date: `Valido per ${quoteData.validUntil}`,
      message: `Ciao ${quoteData.userName}! Il tuo preventivo è pronto. Puoi procedere con l'ordine accedendo alla tua area clienti.`
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_QUOTE_READY,
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
      quote_notes: quoteData.notes || ''
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_QUOTE_READY,
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
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_ORDER_CONFIRMATION,
      emailData
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
  type: 'new_order' | 'new_user' | 'new_message';
  details: string;
  userInfo?: string;
}): Promise<boolean> => {
  try {
    const templateParams: EmailData = {
      email: 'info@3dmakes.ch',
      to_name: 'Admin 3DMAKES',
      from_name: 'Sistema 3DMAKES',
      subject: `Notifica: ${data.type}`,
      message: data.details,
      order_details: data.userInfo
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_ORDER_CONFIRMATION,
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
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
          background: #f97316;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          transition: background-color 0.3s;
        }
        .button:hover {
          background: #ea580c;
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
        <div class="logo">3D<span style="color: #f97316;">MAKES</span></div>
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
          📱 <a href="tel:+41762660396">+41 76 266 03 96</a>
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