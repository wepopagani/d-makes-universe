# 📧 Guida Configurazione Email System - 3DMAKES

## Panoramica Sistema Email

Il sistema email di 3DMAKES utilizza **EmailJS** per inviare email personalizzate mantenendo lo stile del brand. Include template per:

- ✅ Email di benvenuto nuovi utenti
- ✅ Conferme ordini
- ✅ Aggiornamenti stato ordini  
- ✅ Preventivi pronti
- ✅ Notifiche admin
- ✅ Reset password (Firebase Auth)

## 🔧 Configurazione EmailJS

### 1. Crea Account EmailJS
1. Vai su [EmailJS.com](https://www.emailjs.com/)
2. Registrati con l'account 3DMAKES
3. Crea un nuovo servizio email

### 2. Configura Servizio Email
```javascript
// In src/utils/emailService.ts aggiorna:
const EMAILJS_SERVICE_ID = 'il_tuo_service_id';
const EMAILJS_PUBLIC_KEY = 'la_tua_public_key';
```

### 3. Template Email da Creare

#### Template: `template_welcome` (Benvenuto)
```html
Oggetto: Benvenuto in 3DMAKES, {{to_name}}!

Contenuto:
Ciao {{to_name}},

Benvenuto nella famiglia 3DMAKES! 🎉

Il tuo account è stato creato con successo. Ora puoi:
- Caricare i tuoi progetti 3D
- Ottenere preventivi istantanei
- Tracciare i tuoi ordini
- Accedere ai servizi laser

Inizia subito: https://3dmakes.ch/calculator

Grazie per aver scelto 3DMAKES!

Il Team 3DMAKES
```

#### Template: `template_order_confirm` (Conferma Ordine)
```html
Oggetto: Conferma Ordine #{{order_id}}

Contenuto:
Ciao {{to_name}},

Il tuo ordine #{{order_id}} è stato confermato! ✅

Dettagli Ordine:
{{order_details}}

Totale: {{quote_price}}
Consegna stimata: {{delivery_date}}

Puoi tracciare il tuo ordine: https://3dmakes.ch/dashboard

Grazie per la fiducia!

Il Team 3DMAKES
```

#### Template: `template_order_update` (Aggiornamento Ordine)
```html
Oggetto: Aggiornamento Ordine #{{order_id}}

Contenuto:
Ciao {{to_name}},

Il tuo ordine #{{order_id}} è stato aggiornato:

{{message}}

Visualizza dettagli: https://3dmakes.ch/dashboard

Il Team 3DMAKES
```

#### Template: `template_quote_ready` (Preventivo Pronto)
```html
Oggetto: Preventivo Pronto - {{message}}

Contenuto:
Ciao {{to_name}},

Il preventivo per "{{message}}" è pronto! 📋

Prezzo: {{quote_price}}
Valido fino al: {{delivery_date}}

Conferma ordine: https://3dmakes.ch/dashboard

Il Team 3DMAKES
```

#### Template: `template_admin_notification` (Notifiche Admin)
```html
Oggetto: {{subject}}

Contenuto:
{{message}}

{{order_details}}

Sistema 3DMAKES
```

## 🎨 Design Template HTML

Tutti i template utilizzano il design system 3DMAKES:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 600px;
      margin: 0 auto;
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
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .button {
      background: #f97316;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">3D<span style="color: #f97316;">MAKES</span></div>
    <p>Innovazione nella Stampa 3D</p>
  </div>
  
  <div class="content">
    <!-- CONTENUTO EMAIL -->
  </div>
</body>
</html>
```

## 🚀 Attivazione Sistema

1. **Configura EmailJS** con i template sopra
2. **Aggiorna le chiavi** in `src/utils/emailService.ts`
3. **Testa l'invio** registrando un nuovo utente
4. **Verifica template** nella dashboard EmailJS

## 📋 Motivi per Inviare Email

### Email Automatiche Attive:
- ✅ **Registrazione utente** → Email benvenuto + notifica admin
- ✅ **Reset password** → Email Firebase Auth (già attivo)
- ✅ **Cambio email** → Conferma via Firebase Auth

### Email da Implementare:
- 🔄 **Nuovo ordine** → Conferma + notifica admin
- 🔄 **Aggiornamento ordine** → Notifica stato
- 🔄 **Preventivo pronto** → Notifica disponibilità
- 🔄 **Nuovo messaggio** → Notifica admin
- 🔄 **Promemoria carrello** → Email marketing

## 🛠️ Funzionalità Implementate

### Sistema Cambio Email
- Interface utente nel profilo
- Validazione password attuale
- Aggiornamento Firebase Auth + Firestore
- Gestione errori completa

### Calcolatore Laser
- Nuova tab "Laser" nel calcolatore
- Materiali specifici (legno, MDF, acrilico, etc.)
- Tipi di lavorazione (taglio, incisione, combinato)
- Info tecniche (area lavoro, precisione, formati)

### Template Email Responsive
- Design coerente con brand 3DMAKES
- Responsive per mobile
- Colori e tipografia del sito
- Call-to-action evidenziati

## 🔍 Errori da Monitorare

### Possibili Problemi:
1. **Quota EmailJS** superata
2. **Template non configurati**
3. **Chiavi API errate**
4. **Firewall/CORS** per EmailJS

### Debug:
```javascript
// Console logs attivi in emailService.ts
console.log('Email inviata con successo');
console.error('Errore invio email:', error);
```

## 📈 Prossimi Sviluppi

1. **Email Marketing** → Newsletter, promozioni
2. **Tracking Email** → Aperture, click
3. **Template Personalizzati** → Per tipo cliente
4. **Automazioni** → Workflow email avanzati
5. **Analytics** → Metriche engagement

---

**Nota**: Il sistema è progettato per essere failsafe - se l'invio email fallisce, non blocca le operazioni principali (registrazione, ordini, etc.). 