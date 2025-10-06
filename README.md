# 3D Makes - Servizio di Stampa 3D

Applicazione web per il servizio di stampa 3D personalizzata che permette agli utenti di richiedere preventivi, caricare file 3D, gestire ordini e monitorare lo stato di avanzamento della produzione.

## Funzionalità

- **Per gli utenti**:
  - Caricamento di file 3D (.stl, .obj, ecc.)
  - Richiesta di preventivi personalizzati
  - Gestione ordini e monitoraggio dello stato di avanzamento
  - Comunicazione diretta con l'amministrazione

- **Per gli amministratori**:
  - Gestione completa di clienti, preventivi e ordini
  - Invio di preventivi per le richieste ricevute
  - Tracciamento dello stato di produzione e pagamento di ciascun ordine
  - Comunicazione con i clienti

## Prerequisiti

- Node.js (v14 o superiore)
- npm o yarn
- Account Firebase (per l'autenticazione e il database)

## Installazione

1. Clona il repository:
   ```bash
   git clone https://github.com/tuouser/sito-3dmakes.git
   cd sito-3dmakes
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   # oppure
   yarn install
   ```

3. Configura Firebase:
   - Crea un progetto su [Firebase Console](https://console.firebase.google.com/)
   - Abilita l'autenticazione e Firestore Database
   - Aggiungi le credenziali Firebase nel file `.env` (copia `.env.example`)

4. Avvia l'applicazione in modalità sviluppo:
   ```bash
   npm run dev
   # oppure
   yarn dev
   ```

5. Apri il browser all'indirizzo indicato (di solito http://localhost:8081/)

## Popolamento del database con dati di esempio

Per testare l'applicazione con dati fittizi:

1. Accedi come amministratore (email: info@3dmakes.ch, password: qualsiasi)
2. Nella dashboard amministrativa, clicca sul pulsante "Popola Database (Test)"
3. Clicca su "Popola Database con Dati di Esempio" nella pagina di seeding

Questo creerà:
- 2 utenti di test
- Progetti di esempio per ogni utente
- Preventivi e ordini di esempio collegati ai progetti

## Struttura del progetto

- `src/components/`: Componenti UI riutilizzabili
- `src/pages/`: Pagine dell'applicazione
- `src/firebase/`: Configurazione e utilità Firebase
- `src/types/`: Definizioni TypeScript
- `src/utils/`: Funzioni di utilità
- `src/scripts/`: Script di utilità (incluso il seeding del database)

## Licenza

Tutti i diritti riservati © 3D Makes 2024 