/**
 * Contenuto esteso SEO per le pagine servizio (audit SEO & GEO v3.0 — aprile 2026, azione B5).
 *
 * Ogni servizio riceve qui un blocco editoriale aggiuntivo — pensato per:
 *   1. Aumentare la densità di keyword locali (Lugano, Ticino, Lombardia).
 *   2. Rispondere a domande informative reali (E-E-A-T, AI Visibility / GEO).
 *   3. Portare ciascuna pagina ben oltre le 1000 parole utili indicate dall'audit.
 *
 * Il testo è in italiano — lingua primaria del sito (mercato Ticino / Svizzera italiana / nord Italia).
 */

export interface ExtendedApplication {
  title: string;
  description: string;
}

export interface ExtendedSector {
  name: string;
  description: string;
}

export interface ExtendedFaq {
  question: string;
  answer: string;
}

export interface ExtendedServiceContent {
  /** Paragrafo introduttivo che espande la descrizione base. */
  overview: string;
  /** Applicazioni concrete / casi d'uso tipici. */
  applications: ExtendedApplication[];
  /** Settori o tipologie di cliente serviti. */
  sectors: ExtendedSector[];
  /** Quando è la tecnologia giusta — e quando no. */
  whenToChoose: string;
  /** Trust signals: perché 3DMAKES, cosa rende il servizio affidabile. */
  whyUs: string;
  /** FAQ specifiche del servizio (in aggiunta alle FAQ generali in FAQSection). */
  faqs: ExtendedFaq[];
}

export const serviceExtendedContent: Record<string, ExtendedServiceContent> = {
  fdm: {
    overview:
      "La stampa 3D FDM (Fused Deposition Modeling) è la tecnologia additiva più diffusa al mondo e il punto di partenza ideale per la maggior parte dei progetti di prototipazione rapida e produzione in piccola serie. In 3DMAKES lavoriamo con stampanti professionali Stratasys per unire precisione, affidabilità di processo e un costo al pezzo tra i più competitivi del mercato. Dalla nostra sede di Figino (Lugano) serviamo aziende e privati in Canton Ticino, Grigioni italiani e Lombardia con ritiro in sede o spedizione con corriere espresso.",
    applications: [
      {
        title: "Prototipazione funzionale",
        description:
          "Validiamo forma, ergonomia, incastri e meccanismi prima di investire in stampi o lavorazioni meccaniche. L'FDM è ideale per più iterazioni progettuali in tempi rapidi.",
      },
      {
        title: "Parti di ricambio fuori produzione",
        description:
          "Ricostruiamo componenti plastici non più reperibili sul mercato: ingranaggi, coperchi, pulsantiere, passacavi, supporti. Utile per macchinari industriali e attrezzature storiche.",
      },
      {
        title: "Attrezzaggi e dime per linee produttive",
        description:
          "Produciamo maschere, sagome di foratura, alloggiamenti per sensori e porta-pezzo personalizzati che riducono i tempi di set-up e standardizzano i processi.",
      },
      {
        title: "Componenti interni di macchinari",
        description:
          "Staffe, distanziali e coperture in PETG, ABS o Nylon caricato fibra di carbonio per applicazioni meccaniche non a contatto con alimenti.",
      },
      {
        title: "Progetti accademici e ricerca",
        description:
          "Collaboriamo con università svizzere, SUPSI e istituti tecnici ticinesi per tesi, progetti di ricerca e materiali didattici.",
      },
    ],
    sectors: [
      {
        name: "Manifatturiero e automazione industriale",
        description:
          "Clienti nella fascia Ticino–Varesotto–Comasco che adottano stampa 3D interna o in outsourcing per ridurre i lead time.",
      },
      {
        name: "Medicale, dentale e veterinario",
        description:
          "Produciamo modelli anatomici, guide, supporti per studi odontoiatrici e ambulatori.",
      },
      {
        name: "Architettura e design industriale",
        description:
          "Realizziamo plastici architettonici, modelli di studio e prototipi estetici per studi di progettazione.",
      },
      {
        name: "Formazione, maker e privati",
        description:
          "Servizio dedicato per hobbisti, maker e scuole che non dispongono di una stampante propria.",
      },
    ],
    whenToChoose:
      "Scegli la stampa 3D FDM quando le priorità sono velocità, costo contenuto, robustezza meccanica e varietà di materiali. È la tecnologia giusta per prototipi funzionali, parti tecniche di dimensioni contenute e piccoli volumi di produzione. Evita invece l'FDM se il tuo pezzo richiede alta risoluzione estetica e superfici lisce senza post-processing (in questi casi consigliamo SLA o PolyJet), tolleranze estremamente strette (<0,1 mm), oppure isotropia meccanica completa tra gli strati: in questi scenari orientiamo il cliente verso SLS, MJF o SLM.",
    whyUs:
      "Ci occupiamo di stampa 3D professionale da oltre cinque anni con un unico punto di contatto per tutto il flusso: revisione del file CAD, scelta del materiale e dell'orientamento di stampa, slicing e ottimizzazione dei parametri, produzione, controllo qualità dimensionale e rifinitura. Lavoriamo con PLA, PLA+, PETG, ABS, ASA, TPU (flessibile), Nylon, PETG-CF e PA-CF (con fibra di carbonio). Offriamo consegna in 24–72 ore quando il progetto lo richiede, ritiro in sede a Figino (a 10 minuti da Lugano) e spedizione in tutta la Confederazione svizzera e in Italia.",
    faqs: [
      {
        question: "Qual è la dimensione massima stampabile in FDM?",
        answer:
          "Sulle macchine FDM Stratasys arriviamo fino a 800 × 800 × 1000 mm in un unico pezzo. Per dimensioni superiori valutiamo stampa a sezioni e assemblaggio, oppure la tecnologia LSAM per il grande formato.",
      },
      {
        question: "Consegnate in Lombardia e in Italia?",
        answer:
          "Sì. Spediamo regolarmente in Lombardia (Como, Varese, Milano, Bergamo), Piemonte e resto d'Italia con corriere espresso. Tempo di transito tipico 1–2 giorni lavorativi.",
      },
      {
        question: "Posso caricare un file STL e ricevere un preventivo immediato?",
        answer:
          "Sì, usa il nostro calcolatore online — ottieni una stima automatica basata su volume, materiale e finitura scelta.",
      },
      {
        question: "Quali tolleranze dimensionali posso aspettarmi?",
        answer:
          "Per un pezzo FDM standard la tolleranza dimensionale tipica è ±0,2 mm. Per accoppiamenti più precisi consigliamo SLA (±0,05 mm) o produzione in SLS / MJF.",
      },
    ],
  },

  sla: {
    overview:
      "La stampa 3D SLA (Stereolitografia) polimerizza sezione per sezione una resina fotosensibile tramite laser UV, costruendo il pezzo con risoluzione fino a 25 µm e area di stampa di 298 × 164 × 300 mm. È la tecnologia di riferimento quando servono dettagli fini, superfici lisce e alta fedeltà estetica. 3DMAKES utilizza macchine SLA professionali e una gamma di resine calibrate per applicazioni dentali, gioielleria, modelli di studio e componenti tecnici. Serviamo clienti in Canton Ticino e Lombardia.",
    applications: [
      {
        title: "Modelli dentali e odontotecnici",
        description:
          "Produciamo modelli ortodontici, guide chirurgiche e master per allineatori utilizzando resine certificate per uso medicale e dentale.",
      },
      {
        title: "Prototipi estetici ad alta definizione",
        description:
          "Per design industriale, modellini per fiere e presentazioni: dettagli fini, superfici lucide, possibilità di verniciatura.",
      },
      {
        title: "Gioielleria e microfusione",
        description:
          "Stampiamo master in resina calcinabile per microfusione di anelli, ciondoli e componenti da orafo con dettagli estremamente precisi.",
      },
      {
        title: "Componenti trasparenti",
        description:
          "Resine clear per coperchi, prototipi fluidici, alloggiamenti di LED e applicazioni dove serve visibilità interna.",
      },
      {
        title: "Miniature e modellismo",
        description:
          "Miniature da gioco, figure e modelli storici con risoluzione fino a 25 µm sull'asse Z.",
      },
    ],
    sectors: [
      {
        name: "Studi dentistici e laboratori odontotecnici",
        description:
          "Flusso digitale completo: scansione intraorale, modellazione CAD, stampa SLA del modello in resina dedicata.",
      },
      {
        name: "Orafi, goldsmith e gioiellerie",
        description:
          "Lavoriamo con artigiani ticinesi e lombardi per accelerare la realizzazione di pezzi unici tramite master stampati.",
      },
      {
        name: "Studi di design e agenzie creative",
        description:
          "Supportiamo la fase di presentazione concept con prototipi estetici rifiniti.",
      },
      {
        name: "Ricerca e sviluppo prodotto",
        description:
          "Utile quando il prototipo deve essere fotografato, esposto o valutato esteticamente prima dello stampo definitivo.",
      },
    ],
    whenToChoose:
      "Scegli la stampa SLA quando la qualità superficiale, la risoluzione e la fedeltà estetica sono determinanti per il progetto. È indicata per oggetti di dimensioni contenute (tipicamente sotto i 250 mm di lato) dove l'aspetto visivo e i dettagli sono critici. Evitala se hai bisogno di massima resistenza termica e meccanica sotto carico continuo (in questo caso FDM con Nylon CF o SLS / MJF sono più indicati) o se il pezzo deve essere esposto a UV a lungo senza verniciatura.",
    whyUs:
      "Selezioniamo la resina in base all'applicazione: standard per prototipi generici, resine tecniche per componenti meccanici, resine biocompatibili certificate per dentale, resine calcinabili per fusione. Ogni pezzo viene pulito, asciugato e post-curato secondo le specifiche del materiale, e al cliente consegniamo anche le schede tecniche quando richiesto. Offriamo ritiro in sede a Figino (Lugano) e spedizione in tutta Italia e Svizzera.",
    faqs: [
      {
        question: "Quali sono le dimensioni massime di stampa in SLA?",
        answer:
          "L'area di stampa è 298 × 164 × 300 mm. Pezzi più grandi possono essere stampati in parti e incollati con resina dedicata.",
      },
      {
        question: "Le resine SLA sono sicure per il contatto con la bocca?",
        answer:
          "Solo le resine certificate biocompatibili (classe I / IIa) possono essere usate per dispositivi medicali e dentali. Le applichiamo su richiesta, indicando in fattura il lotto del materiale.",
      },
      {
        question: "La resina stampata è resistente?",
        answer:
          "Dipende dalla formula: esistono resine rigide, resistenti all'impatto (tough), flessibili, termoresistenti. Durante il preventivo suggeriamo la scelta più adatta.",
      },
      {
        question: "Posso avere il pezzo verniciato o lucidato?",
        answer:
          "Sì. Offriamo post-processing con primer, verniciatura a spruzzo e lucidatura per finiture estetiche di alto livello.",
      },
    ],
  },

  "incisione-laser": {
    overview:
      "Il nostro servizio di incisione, marcatura e taglio laser su metalli utilizza tecnologia laser a fibra MOPA da 60 W, ideale per lavorazioni precise su acciaio inossidabile, alluminio, ottone e rame. Realizziamo targhe industriali, marcature seriali, codici QR, componenti meccanici tagliati e personalizzazioni su metallo con area di lavoro di 250 × 250 mm e precisione di 0,1 mm. Lavoriamo su file DXF e PDF e serviamo clienti in Canton Ticino e Lombardia.",
    applications: [
      {
        title: "Marcatura industriale",
        description:
          "Matricole, codici QR, loghi e dati tecnici incisi in modo permanente su componenti meccanici e parti di macchinario.",
      },
      {
        title: "Targhe e plate identificative",
        description:
          "Targhette per macchinari, quadri elettrici, attrezzature industriali e segnaletica tecnica in metallo.",
      },
      {
        title: "Taglio componenti metallici",
        description:
          "Taglio di lamiere e piccoli componenti in acciaio inox, alluminio, ottone e rame per prototipi e assemblaggi.",
      },
      {
        title: "Personalizzazione su metallo",
        description:
          "Incisioni decorative su accessori, gadget promozionali e oggetti personalizzati in metallo.",
      },
      {
        title: "Marcatura seriale e tracciabilità",
        description:
          "Numerazione progressiva, codici a barre e marcature per tracciabilità di produzione e manutenzione.",
      },
    ],
    sectors: [
      {
        name: "Industria e manifattura",
        description:
          "Marcatura di componenti, targhe macchina e parti di ricambio per aziende manifatturiere in Ticino e Lombardia.",
      },
      {
        name: "Elettronica e automazione",
        description:
          "Plate e cover per quadri elettrici, pannelli e componenti identificativi.",
      },
      {
        name: "Meccanica di precisione",
        description:
          "Taglio e marcatura di piccoli componenti metallici per prototipi e piccole serie.",
      },
      {
        name: "Artigianato e gioielleria",
        description:
          "Incisioni decorative su ottone, rame e acciaio per pezzi unici e personalizzazioni.",
      },
    ],
    whenToChoose:
      "Scegli il laser a fibra quando devi marcare, incidere o tagliare metalli come acciaio inox, alluminio, ottone e rame con precisione e permanenza. È la soluzione ideale per targhe, marcature industriali, componenti piani in lamiera e personalizzazioni su metallo. Per geometrie tridimensionali complesse o pezzi plastici, la stampa 3D FDM, SLA o SLS è più adatta.",
    whyUs:
      "Ottimizziamo ogni lavorazione in base al materiale e al risultato richiesto — marcatura, incisione o taglio. Lavoriamo su file DXF e PDF del cliente e possiamo supportare nella preparazione del disegno. Offriamo anche progettazione CAD, post-elaborazione e controllo qualità su richiesta. Ritiro in sede a Figino (Lugano) e spedizione in tutta Italia e Svizzera.",
    faqs: [
      {
        question: "Che formato di file serve per il laser?",
        answer:
          "Lavoriamo con file DXF e PDF vettoriali. Se hai solo un'immagine raster (JPG, PNG) possiamo vettorizzarla: valutiamo il costo in preventivo.",
      },
      {
        question: "Su quali metalli lavorate e quali spessori?",
        answer:
          "Taglio su alluminio fino a 1 mm, acciaio inossidabile e ottone fino a 2 mm. Incisione e marcatura su acciaio inox, alluminio, ottone e rame. Per spessori o materiali particolari valutiamo la fattibilità in fase di preventivo.",
      },
      {
        question: "Qual è l'area di lavoro massima?",
        answer:
          "L'area utile è 250 × 250 mm. Per lavorazioni più grandi valutiamo soluzioni su misura.",
      },
      {
        question: "Offrite anche progettazione e finitura?",
        answer:
          "Sì. Progettazione CAD, post-elaborazione e controllo qualità sono disponibili come servizi complementari su tutti i nostri processi produttivi.",
      },
    ],
  },

  "riparazione-stampanti-3d": {
    overview:
      "Il servizio di riparazione e manutenzione stampanti 3D di 3DMAKES è dedicato a professionisti, aziende, scuole e maker che utilizzano stampanti 3D FDM o SLA e necessitano di supporto tecnico qualificato in Canton Ticino. Interveniamo su tutti i brand più diffusi — Prusa, Bambu Lab, Creality, Anycubic, Elegoo, Artillery, Stratasys, UltiMaker — e offriamo diagnosi, sostituzione componenti, taratura, upgrade firmware e consulenza pre-acquisto. La nostra sede a Figino è a pochi minuti da Lugano e serviamo tutto il Ticino con ritiro e consegna su appuntamento.",
    applications: [
      {
        title: "Diagnosi e riparazione guasti",
        description:
          "Individuiamo la causa di stampe fallite, rumori anomali, errori termici, assi che si bloccano, estrusione irregolare.",
      },
      {
        title: "Sostituzione hot-end e componenti di consumo",
        description:
          "Ugelli, termistori, blocchi riscaldanti, cartucce, belt, ventole: ricambi originali o compatibili, montaggio e test.",
      },
      {
        title: "Calibrazione meccanica e dimensionale",
        description:
          "Livellamento piatto, controllo geometria, verifica step motore, calibrazione e-step, taratura PID, test dimensionale.",
      },
      {
        title: "Upgrade firmware e aggiornamenti",
        description:
          "Installazione firmware Marlin/Klipper, configurazione profili di stampa, input shaping, pressure advance.",
      },
      {
        title: "Consulenza pre-acquisto",
        description:
          "Ti aiutiamo a scegliere la stampante giusta in base all'utilizzo, al budget e ai materiali previsti.",
      },
    ],
    sectors: [
      {
        name: "Scuole e istituti di formazione",
        description:
          "Contratti di manutenzione periodica per fablab scolastici, istituti tecnici e centri di formazione professionale.",
      },
      {
        name: "PMI con stampanti interne",
        description:
          "Assistenza a chiamata per aziende manifatturiere che hanno introdotto la stampa 3D come strumento R&D.",
      },
      {
        name: "Studi professionali e architetti",
        description:
          "Studi che usano stampanti 3D per plastici e prototipi e necessitano di affidabilità operativa.",
      },
      {
        name: "Maker e hobbisti avanzati",
        description:
          "Supporto per modding, upgrade e configurazioni avanzate (Klipper, CoreXY, dual-extruder).",
      },
    ],
    whenToChoose:
      "Il nostro servizio è indicato quando la tua stampante 3D presenta problemi ricorrenti, quando vuoi passare a una configurazione più avanzata (Klipper, CoreXY, testine multiple), quando stai pianificando l'acquisto di una nuova macchina e vuoi una consulenza indipendente, o quando gestisci un parco stampanti e hai bisogno di un partner per manutenzione ordinaria. Se invece la stampante è ancora in garanzia del produttore, spesso conviene prima passare dal canale ufficiale.",
    whyUs:
      "Abbiamo esperienza diretta su oltre 30 modelli di stampanti 3D diversi e gestiamo internamente un parco macchine professionale: conosciamo i problemi ricorrenti per brand e per classe di macchina. Offriamo diagnosi gratuita per problemi semplici, preventivo trasparente prima dell'intervento e garanzia sui componenti sostituiti. Forniamo anche un servizio di noleggio stampante temporaneo quando la macchina del cliente è in riparazione prolungata.",
    faqs: [
      {
        question: "Riparate anche stampanti SLA a resina?",
        answer:
          "Sì — interveniamo su stampanti SLA/MSLA di Anycubic, Elegoo, Phrozen, Formlabs per sostituzione LCD/FEP, calibrazione Z e diagnosi.",
      },
      {
        question: "Potete venire a ritirare la stampante?",
        answer:
          "In Ticino offriamo ritiro e consegna su appuntamento. Per clienti fuori cantone consigliamo spedizione in contrassegno o trasporto diretto.",
      },
      {
        question: "Quanto costa una diagnosi?",
        answer:
          "La diagnosi standard è gratuita per stampanti portate in sede. Se richiede smontaggi estesi o prove di stampa prolungate, concordiamo preventivamente il costo.",
      },
      {
        question: "Vendete ricambi?",
        answer:
          "Su richiesta forniamo ricambi originali e compatibili (ugelli, blocchi hot-end, belt, schede). Possiamo anche installarli per te.",
      },
    ],
  },

  scansione: {
    overview:
      "La scansione 3D professionale di 3DMAKES permette di digitalizzare oggetti reali con precisione sub-millimetrica, ottenendo mesh 3D o modelli CAD pronti per il reverse engineering, l'ispezione dimensionale, il restauro o la replica in stampa 3D. Utilizziamo scanner a luce strutturata e scanner portatili per coprire oggetti dai pochi centimetri fino ai 2 metri di estensione. Il servizio è disponibile sia in sede a Figino (Lugano) sia on-site presso il cliente in tutto il Canton Ticino e Lombardia.",
    applications: [
      {
        title: "Reverse engineering di componenti industriali",
        description:
          "Digitalizziamo pezzi di ricambio non più disponibili per ricostruirne il modello CAD e rigenerarli in stampa 3D o lavorazione meccanica.",
      },
      {
        title: "Ispezione dimensionale e controllo qualità",
        description:
          "Confronto tra pezzo fisico e modello CAD nominale per verificare tolleranze, deformazioni e conformità alle specifiche di progetto.",
      },
      {
        title: "Digitalizzazione per beni culturali e musei",
        description:
          "Acquisizione 3D di reperti, sculture e manufatti per archiviazione digitale, fruizione online o riproduzione in replica.",
      },
      {
        title: "Scansione corpo umano per ortopedia",
        description:
          "Scansione di arti e zone anatomiche per la progettazione di tutori personalizzati, plantari e ausili ortopedici.",
      },
      {
        title: "Digitalizzazione per modellazione e animazione",
        description:
          "Basi mesh di oggetti reali per progetti di design, grafica 3D, rendering e animazione.",
      },
    ],
    sectors: [
      {
        name: "Manifatturiero e meccanica",
        description:
          "Copia e ricostruzione di pezzi da officina meccanica, riproduzione di modelli scocca e validazione post-produzione.",
      },
      {
        name: "Sanità, ortopedia e odontotecnica",
        description:
          "Supporto a ortopedici, laboratori odontotecnici e tecnici sanitari per ausili personalizzati.",
      },
      {
        name: "Beni culturali e restauro",
        description:
          "Musei ticinesi, fondazioni e studi di restauro che necessitano di archiviazione 3D.",
      },
      {
        name: "Design e architettura",
        description:
          "Digitalizzazione di elementi architettonici e oggetti di design per archivio o rielaborazione.",
      },
    ],
    whenToChoose:
      "La scansione 3D è la scelta giusta quando l'oggetto esiste fisicamente ma non ne hai il modello CAD, quando vuoi verificare la conformità dimensionale di un pezzo prodotto, quando devi riprodurre un oggetto che non puoi più reperire sul mercato, o quando hai bisogno di una base digitale fedele per un nuovo progetto. Non è la scelta giusta se il tuo oggetto è trasparente, molto riflettente o in movimento: in quei casi servono spray matteganti o approcci alternativi.",
    whyUs:
      "Eseguiamo in autonomia tutto il workflow: acquisizione, allineamento delle scansioni, mesh cleanup, generazione del modello CAD parametrico se richiesto. Consegniamo file STL, OBJ, PLY, STEP (dopo reverse) e documenti di ispezione dimensionale. Su richiesta eseguiamo la scansione presso il cliente con trasferta in Canton Ticino e in Lombardia.",
    faqs: [
      {
        question: "Quanto è precisa la scansione?",
        answer:
          "La precisione varia in base allo scanner: 0,05 mm su oggetti piccoli in luce strutturata, 0,1–0,2 mm su oggetti medi con scanner portatili. Comunichiamo in preventivo la precisione attesa.",
      },
      {
        question: "Potete scansionare una persona?",
        answer:
          "Sì, eseguiamo scansioni del busto, di arti o del corpo intero. Utile per medicina, ortopedia, gadget personalizzati o avatar 3D.",
      },
      {
        question: "Mi serve un file CAD modificabile o basta la mesh?",
        answer:
          "Dipende dall'uso. Per stampa 3D basta la mesh (STL). Per modifiche ingegneristiche offriamo il reverse engineering che produce un file CAD parametrico (STEP).",
      },
      {
        question: "Venite a scansionare sul posto?",
        answer:
          "Sì, su appuntamento in Ticino, Grigioni italiano e Lombardia. La trasferta viene quotata in base alla distanza e ai tempi previsti.",
      },
    ],
  },

  prototipazione: {
    overview:
      "Il servizio di prototipazione rapida di 3DMAKES copre l'intero percorso dal concept al prototipo funzionale pronto da testare: analisi del progetto, scelta della tecnologia più adatta (FDM, SLA, SLS, MJF, PolyJet, LSAM), produzione, finitura e test. Lavoriamo con aziende manifatturiere, studi di design e startup nel Canton Ticino e in Lombardia per ridurre i cicli di sviluppo da settimane a pochi giorni. La nostra forza è l'accesso multi-tecnologia sotto un unico fornitore: consigliamo la combinazione ideale per risparmiare tempo e costi.",
    applications: [
      {
        title: "Prototipi pre-industriali",
        description:
          "Versione dimostrabile del prodotto prima degli investimenti in stampi e attrezzature per la produzione di massa.",
      },
      {
        title: "Prototipi funzionali per test meccanici",
        description:
          "Pezzi in materiali tecnici (Nylon CF, PETG, TPU) che replicano il comportamento del prodotto finale.",
      },
      {
        title: "Prototipi estetici e modelli di presentazione",
        description:
          "Per fiere, presentazioni a investitori e validazione di design con il committente.",
      },
      {
        title: "Serie pilota (10–100 pezzi)",
        description:
          "Quando lo stampo non è ancora giustificato, produciamo serie brevi con stampa 3D ottimizzata.",
      },
      {
        title: "Prodotti unici e custom",
        description:
          "Componenti su misura per clienti che richiedono personalizzazione o produzione bespoke.",
      },
    ],
    sectors: [
      {
        name: "Startup e spin-off universitari",
        description:
          "Supporto agile al primo ciclo di sviluppo prodotto per realtà imprenditoriali in fase iniziale.",
      },
      {
        name: "PMI manifatturiere lombarde e ticinesi",
        description:
          "Accelerazione di R&D interno, realizzazione di parti funzionali e preserie.",
      },
      {
        name: "Design studio e industrial designer",
        description:
          "Realizzazione di modelli di stile, prototipi aerodinamici, oggetti d'arredo.",
      },
      {
        name: "Settore medicale",
        description:
          "Prototipi di dispositivi medicali prima della certificazione e della produzione in serie.",
      },
    ],
    whenToChoose:
      "Scegli il nostro servizio di prototipazione quando hai bisogno di un prototipo testabile in pochi giorni invece che settimane, quando vuoi esplorare più iterazioni prima di congelare il design, quando devi presentare un concept a investitori o committenti, o quando stai valutando la fattibilità tecnica di un'idea. Se invece produci già in grande serie con stampo, la stampa 3D può essere utilizzata solo per piccoli componenti, ricambi o varianti.",
    whyUs:
      "Siamo un partner tecnico, non solo un service di stampa. Leggiamo il file, poniamo domande sul requisito meccanico o estetico, proponiamo la tecnologia più efficiente per il risultato voluto. Abbiamo tempi di reazione rapidi — preventivo in 24 ore, produzione in 2–5 giorni per la maggior parte dei progetti — e gestiamo tutto in sede a Figino senza subappalto, garantendo riservatezza sui progetti in sviluppo.",
    faqs: [
      {
        question: "Firmate un NDA prima di vedere il progetto?",
        answer:
          "Sì, firmiamo accordi di riservatezza prima di ricevere file CAD, documentazione o prototipi. Per i progetti aziendali è prassi.",
      },
      {
        question: "Aiutate anche nella modellazione CAD?",
        answer:
          "Offriamo supporto alla modellazione e al design for additive manufacturing. Se hai uno sketch o un disegno 2D possiamo partire da lì.",
      },
      {
        question: "Che materiali posso scegliere per un prototipo funzionale?",
        answer:
          "Dipende dal test: PETG e Nylon per resistenza meccanica, TPU per parti flessibili, resine tough per ABS-like, PA12 in SLS per parti ingegneristiche, metallo in SLM per test termici estremi.",
      },
      {
        question: "Posso avere un solo prototipo o devo ordinarne di più?",
        answer:
          "Non abbiamo minimi d'ordine. Un singolo pezzo è il nostro normale punto di partenza.",
      },
    ],
  },

  sls: {
    overview:
      "La stampa 3D SLS (Selective Laser Sintering) sinterizza polveri termoplastiche — nylon e TPU — strato dopo strato tramite laser, producendo pezzi robusti, isotropi e privi di supporti. Con un'area di stampa di 165 × 165 × 300 mm è la tecnologia ideale per componenti meccanici funzionali, geometrie complesse e piccole serie industriali. 3DMAKES offre il servizio SLS in sede, con progettazione CAD, post-elaborazione e controllo qualità disponibili su richiesta.",
    applications: [
      {
        title: "Parti meccaniche funzionali",
        description:
          "Ingranaggi, articolazioni, staffe in PA12 con resistenza paragonabile allo stampaggio a iniezione.",
      },
      {
        title: "Preserie industriali 50–500 pezzi",
        description:
          "Alternativa economica allo stampaggio a iniezione per volumi bassi senza investimento in stampo.",
      },
      {
        title: "Geometrie complesse e lattice",
        description:
          "Strutture interne cave, reticoli ottimizzati per leggerezza, parti consolidate in un singolo pezzo.",
      },
      {
        title: "Prodotti custom e consumer",
        description:
          "Calzature personalizzate, occhiali, accessori tecnici che richiedono personalizzazione di massa.",
      },
      {
        title: "Parti robuste per ambienti gravosi",
        description:
          "Componenti resistenti a sollecitazioni ripetute, vibrazioni e cicli termici moderati.",
      },
    ],
    sectors: [
      {
        name: "Automotive e motorsport",
        description:
          "Prototipi funzionali e pezzi custom per squadre racing e produzione aftermarket.",
      },
      {
        name: "Industriale e automazione",
        description:
          "Parti di macchinari, guide, supporti, cover tecniche.",
      },
      {
        name: "Consumer e sportivo",
        description:
          "Accessori, caschi, protezioni con geometrie personalizzate.",
      },
      {
        name: "Medicale (non invasivo)",
        description:
          "Tutori, protesi esterne, ausili personalizzati.",
      },
    ],
    whenToChoose:
      "Scegli SLS quando servono parti funzionali robuste, geometrie complesse senza supporti, piccole serie a costo competitivo e materiali tecnici di livello industriale. Non è ideale per parti estetiche a vista che richiedano superfici lisce senza post-processing — la finitura SLS è granulosa (anche se verniciabile).",
    whyUs:
      "Gestiamo l'intero processo in sede: preparazione file, scelta del materiale (nylon o TPU), produzione, finitura e controllo qualità. Il cliente ha un unico punto di contatto e può integrare progettazione CAD e post-elaborazione nello stesso ordine.",
    faqs: [
      {
        question: "Quali materiali sono disponibili in SLS?",
        answer:
          "Polvere di nylon (PA12) per parti meccaniche robuste e polvere di poliuretano termoplastico (TPU) per componenti flessibili ed elastici.",
      },
      {
        question: "Qual è l'area di stampa massima?",
        answer:
          "165 × 165 × 300 mm per singolo pezzo.",
      },
      {
        question: "Posso verniciare o tingere un pezzo SLS?",
        answer:
          "Sì, il nylon accetta tinture a bagno e verniciatura a spruzzo dopo primer. Offriamo anche finitura tramite tumbling e sabbiatura come post-elaborazione.",
      },
      {
        question: "Offrite progettazione e controllo qualità?",
        answer:
          "Sì. Progettazione CAD, post-elaborazione e controllo qualità dimensionale sono disponibili come servizi complementari.",
      },
    ],
  },

  slm: {
    overview:
      "La stampa 3D SLM (Selective Laser Melting) fonde polveri metalliche strato dopo strato tramite laser ad alta potenza, producendo parti metalliche dense al 99,9% in titanio, acciaio inox, alluminio, Inconel e cobalto-cromo. È la tecnologia di riferimento per componenti aerospace, medicali, utensili con canali di raffreddamento conformal e parti ad alte prestazioni meccaniche. 3DMAKES offre SLM tramite partnership con service certificati ISO 9001 e AS9100, mantenendo la gestione del progetto dal primo contatto fino alla consegna in Ticino o Lombardia.",
    applications: [
      {
        title: "Componenti aerospace e motorsport",
        description:
          "Parti strutturali leggere in titanio e alluminio per applicazioni ad alte prestazioni.",
      },
      {
        title: "Utensili con raffreddamento conformal",
        description:
          "Stampi per iniezione con canali di raffreddamento ottimizzati, impossibili da realizzare con lavorazioni tradizionali.",
      },
      {
        title: "Impianti medicali e dentali",
        description:
          "Protesi in titanio, impianti spinali e ortopedici, corone in cobalto-cromo certificati per uso medico.",
      },
      {
        title: "Parti di ricambio ad alta responsabilità",
        description:
          "Componenti in Inconel o acciaio resistenti a temperature elevate e ambienti corrosivi.",
      },
      {
        title: "Prototipi metallici funzionali",
        description:
          "Quando serve testare il comportamento reale in metallo prima dell'investimento in attrezzature.",
      },
    ],
    sectors: [
      {
        name: "Aerospace e difesa",
        description:
          "Fornitura di parti certificate per l'industria aeronautica e spaziale.",
      },
      {
        name: "Medicale e dentale",
        description:
          "Impianti e protesi biocompatibili in titanio e cobalto-cromo.",
      },
      {
        name: "Stampisti e utensileria",
        description:
          "Stampi con canali conformal cooling per ridurre i tempi ciclo.",
      },
      {
        name: "Automotive racing e R&D",
        description:
          "Componenti leggeri e ad alte prestazioni per squadre e prototipi.",
      },
    ],
    whenToChoose:
      "Scegli SLM quando serve un vero pezzo in metallo con proprietà meccaniche certificate, geometrie complesse impossibili con lavorazioni meccaniche o fonderia, lotti limitati (1–100 pezzi) dove lo stampo non è giustificato. Non è la scelta giusta per pezzi semplici che possono essere torniti o fresati a costo inferiore.",
    whyUs:
      "Selezioniamo il service più adatto al tuo progetto tra partner certificati ISO e AS9100 in Europa. Ci occupiamo della revisione file, del consiglio sulla scelta del materiale, del trattamento termico post-stampa e della finitura (tornitura dei fori, rettifica di superfici critiche).",
    faqs: [
      {
        question: "Quali metalli disponibili?",
        answer:
          "Principalmente: Titanio Grade 5 (Ti6Al4V), Acciaio inox 316L, Acciaio MS1/M300, Alluminio AlSi10Mg, Inconel 718, Cobalto-Cromo. Su richiesta valutiamo materiali specifici.",
      },
      {
        question: "Il pezzo SLM ha le stesse proprietà di uno fuso?",
        answer:
          "Dopo trattamento termico HIP, le proprietà meccaniche sono paragonabili a quelle di materiali forgiati o fusi. Le schede tecniche sono disponibili su richiesta.",
      },
      {
        question: "Quanto costa una stampa SLM?",
        answer:
          "Il costo dipende molto dal volume e dal materiale. Titanio e Inconel sono i più costosi. Per un preventivo serve il file e un'idea del volume di stampa.",
      },
      {
        question: "Fate il trattamento termico?",
        answer:
          "Sì — il service partner esegue trattamento termico e HIP (Hot Isostatic Pressing) su richiesta per garantire proprietà meccaniche massime.",
      },
    ],
  },

  mjf: {
    overview:
      "La stampa 3D MJF (Multi Jet Fusion) di HP utilizza una testina inkjet per depositare agenti di fusione e dettaglio su un letto di polvere PA12, attivando poi la sinterizzazione con radiazione infrarossa. Produce pezzi leggermente più densi e uniformi dell'SLS, con tempi di ciclo più rapidi ed economicità su serie medie. 3DMAKES offre MJF tramite service certificati, ideale per produzione di 100–5000 pezzi in PA12, PA12 rinforzato vetro e TPU.",
    applications: [
      {
        title: "Produzione seriale industriale",
        description:
          "Alternativa allo stampaggio a iniezione per lotti da 100 a 5000 pezzi senza stampo.",
      },
      {
        title: "Componenti leggeri per automazione",
        description:
          "Pinze, manipolatori, cover tecniche in PA12 robusto.",
      },
      {
        title: "Attrezzi e utensili per linee produttive",
        description:
          "Dime, sagome e porta-pezzo custom per l'industria manifatturiera.",
      },
      {
        title: "Consumer goods custom",
        description:
          "Prodotti personalizzati in serie (accessori, gadget, oggettistica).",
      },
      {
        title: "Parti finali biocompatibili (grado I)",
        description:
          "Alcuni materiali MJF sono certificati per contatto pelle e dispositivi medici.",
      },
    ],
    sectors: [
      {
        name: "Produzione industriale",
        description:
          "Aziende manifatturiere che vogliono snellire la catena di fornitura.",
      },
      {
        name: "Settore consumer",
        description:
          "Brand di accessori, tech, sportivo che producono varianti personalizzate.",
      },
      {
        name: "Automotive aftermarket",
        description:
          "Componenti non strutturali per veicoli, pezzi di ricambio a basso volume.",
      },
      {
        name: "Robotica e automazione",
        description:
          "End-effector, pinze, cover tecniche.",
      },
    ],
    whenToChoose:
      "Scegli MJF quando produci lotti medi (100–5000 pezzi) in poliammide, quando ti serve velocità di ciclo rispetto all'SLS, quando vuoi un buon compromesso tra qualità superficiale e robustezza. Non è la scelta per pezzi singoli di prototipazione rapida (SLS costa meno per 1 pezzo) o per geometrie molto grandi oltre i limiti macchina.",
    whyUs:
      "Coordiniamo la produzione con service partner in Europa, mantenendo il cliente al punto di contatto unico in Ticino. Revisioniamo il file prima della stampa, monitoriamo i tempi di produzione e gestiamo la logistica di consegna.",
    faqs: [
      {
        question: "Differenza pratica tra SLS e MJF?",
        answer:
          "MJF ha superficie leggermente più liscia e tempi di ciclo più rapidi. A livello meccanico PA12 SLS e PA12 MJF sono molto simili. La scelta dipende dal volume e dai costi del service.",
      },
      {
        question: "Il grigio scuro tipico del MJF si può cambiare?",
        answer:
          "Sì — i pezzi MJF possono essere tinti a bagno (nero profondo, altri colori) o verniciati. La colorazione standard del grezzo è grigia scura.",
      },
      {
        question: "Consegnate in Italia con dogana?",
        answer:
          "Sì, gestiamo spedizioni verso l'Italia e l'UE con DDP o DAP a seconda dell'accordo. La Svizzera emette DDV elettronica.",
      },
      {
        question: "Quanto è riciclata la polvere?",
        answer:
          "Il PA12 MJF si usa tipicamente con 30% polvere vergine + 70% refresh riciclato. Su richiesta si può produrre con polvere 100% vergine a costo maggiore.",
      },
    ],
  },

  cff: {
    overview:
      "La stampa 3D CFF (Continuous Fiber Fabrication) combina una matrice polimerica con fibre continue di carbonio, vetro o Kevlar, producendo pezzi con proprietà meccaniche simili all'alluminio ma a frazione del peso. È la tecnologia ideale per parti strutturali funzionali, attrezzaggi industriali pesanti e componenti che richiedono resistenza a trazione o rigidezza elevata. 3DMAKES utilizza macchine compatibili con Markforged per offrire CFF a clienti industriali ticinesi e lombardi.",
    applications: [
      {
        title: "Attrezzaggi industriali robusti",
        description:
          "Porta-pezzo, dime e sagome che sopportano carichi ripetuti senza deformarsi.",
      },
      {
        title: "End-effector per robot industriali",
        description:
          "Pinze leggere ma rigide per bracci robotici e manipolatori.",
      },
      {
        title: "Parti metallo-sostitutive",
        description:
          "Sostituzione di parti metalliche in contesti dove il peso è critico.",
      },
      {
        title: "Componenti aerospace e motorsport",
        description:
          "Parti ad alte prestazioni con rapporto rigidezza/peso elevato.",
      },
      {
        title: "Prototipazione strutturale",
        description:
          "Prototipi che devono sopportare i veri carichi operativi.",
      },
    ],
    sectors: [
      {
        name: "Automazione industriale",
        description:
          "End-effector, pinze, attrezzi per linee di produzione.",
      },
      {
        name: "Motorsport e aftermarket",
        description:
          "Componenti personalizzati ad alte prestazioni.",
      },
      {
        name: "Industria manifatturiera",
        description:
          "Attrezzaggi, stampi a bassa tiratura, utensili custom.",
      },
      {
        name: "R&D e prototipazione avanzata",
        description:
          "Test su parti strutturali prima della produzione definitiva.",
      },
    ],
    whenToChoose:
      "Scegli CFF quando il pezzo deve sopportare carichi strutturali significativi in un volume contenuto, quando cerchi un metallo-sostituto leggero, quando il costo dell'alluminio lavorato è eccessivo per il volume richiesto. Non è la scelta giusta per parti estetiche o per geometrie molto grandi: la fibra continua richiede geometrie studiate ad hoc.",
    whyUs:
      "Eseguiamo DFM review mirato alla fibra: orientamento degli strati rinforzati, posizionamento strategico delle fibre, simulazione del comportamento a carico. Consegniamo pezzo + relazione tecnica dei parametri utilizzati quando richiesto.",
    faqs: [
      {
        question: "Che fibre usate?",
        answer:
          "Fibra di carbonio (la più diffusa), fibra di vetro (economica), Kevlar (resistenza a impatto), HSHT (alta temperatura).",
      },
      {
        question: "Matrici disponibili?",
        answer:
          "Onyx (Nylon + fibra corta di carbonio) è la matrice più comune. Esistono anche matrici Nylon pura e in alcuni casi PEEK-like.",
      },
      {
        question: "Quanto è resistente rispetto all'alluminio?",
        answer:
          "Dipende dall'orientamento della fibra. A parità di peso, una parte CFF ben progettata può raggiungere rigidezza e resistenza comparabili all'alluminio 6061.",
      },
      {
        question: "Serve un file CAD speciale?",
        answer:
          "No, un normale STL basta. Siamo noi a impostare gli strati rinforzati in fase di slicing.",
      },
    ],
  },

  polyjet: {
    overview:
      "La stampa 3D PolyJet di Stratasys deposita gocce di resina fotopolimerica che vengono polimerizzate istantaneamente con luce UV, permettendo la stampa multi-materiale e multi-colore in un singolo pezzo. È la tecnologia più avanzata per modelli realistici con gradienti di durezza, componenti che combinano parti rigide e flessibili, e prototipi estetici con finitura di altissima qualità. 3DMAKES offre PolyJet tramite partnership con service specializzati.",
    applications: [
      {
        title: "Modelli multi-materiale realistici",
        description:
          "Prototipi che combinano rigido e flessibile (es. impugnature con gommatura integrata).",
      },
      {
        title: "Modelli anatomici medicali",
        description:
          "Riproduzione di organi per simulazione chirurgica e didattica medica.",
      },
      {
        title: "Prototipi estetici full-color",
        description:
          "Oggetti con texture, colori sfumati e dettagli realistici per presentazioni e fiere.",
      },
      {
        title: "Stampi prototipo per silicone",
        description:
          "Stampi a bassa tiratura per test di colata di silicone e gomma.",
      },
      {
        title: "Modelli per packaging design",
        description:
          "Prototipi visivi per packaging, etichette e imballaggi.",
      },
    ],
    sectors: [
      {
        name: "Medicale e simulazione chirurgica",
        description:
          "Modelli anatomici realistici per training e pianificazione.",
      },
      {
        name: "Design industriale",
        description:
          "Prototipi di presentazione ad alta fedeltà.",
      },
      {
        name: "Packaging e brand",
        description:
          "Modelli visivi di bottiglie, flaconi, contenitori.",
      },
      {
        name: "Consumer electronics",
        description:
          "Prototipi di gadget, wearable, accessori.",
      },
    ],
    whenToChoose:
      "Scegli PolyJet quando servono pezzi multi-materiale, finiture estetiche di altissimo livello, o quando vuoi simulare l'aspetto reale del prodotto finale. Non è la scelta per parti funzionali sotto carico continuo (le resine PolyJet sono più fragili dei termoplastici) o per pezzi esposti a UV prolungati senza verniciatura.",
    whyUs:
      "Lavoriamo con service partner che hanno l'intera gamma PolyJet (J750, J850) e gestiamo il progetto dal file alla consegna. Il PolyJet è costoso: facciamo DFM review per aiutarti a ottenere il massimo valore per il budget.",
    faqs: [
      {
        question: "Quanti colori può stampare PolyJet?",
        answer:
          "Fino a milioni di combinazioni di colore su macchine J850 con texture fotorealistiche. Su macchine più semplici, fino a 6 materiali simultaneamente.",
      },
      {
        question: "È adatto per prototipi finali?",
        answer:
          "Sì, per prototipi estetici di presentazione, ma non per parti meccaniche sottoposte a carico continuo.",
      },
      {
        question: "Dimensione massima?",
        answer:
          "Tipicamente fino a 490 × 390 × 200 mm su singola stampa. Pezzi più grandi si assemblano da parti stampate.",
      },
      {
        question: "Quanto tempo per produrre un prototipo PolyJet?",
        answer:
          "Tipicamente 5–10 giorni lavorativi inclusa spedizione dal service partner.",
      },
    ],
  },

  lsam: {
    overview:
      "La stampa 3D LSAM (Large Scale Additive Manufacturing) utilizza estrusori a pellet termoplastico montati su braccio robotico o macchina portale per realizzare pezzi di dimensioni molto grandi — da 1 metro fino a oltre 5 metri. È la tecnologia giusta per attrezzaggi industriali di grandi dimensioni, stampi prototipo per compositi, elementi d'arredo e componenti navali. 3DMAKES offre LSAM tramite partnership con service europei specializzati.",
    applications: [
      {
        title: "Attrezzaggi di grandi dimensioni",
        description:
          "Porta-pezzo e dime per aerospace e automotive di dimensioni metriche.",
      },
      {
        title: "Stampi prototipo per compositi",
        description:
          "Master per laminazione carbonio/vetroresina in sostituzione dei master in legno o alluminio.",
      },
      {
        title: "Arredo urbano e elementi architettonici",
        description:
          "Panchine, fioriere, elementi scultorei e arredi custom.",
      },
      {
        title: "Stampi a bassa tiratura per termoformatura",
        description:
          "Alternativa economica agli stampi in alluminio per piccoli lotti.",
      },
      {
        title: "Elementi scenografici e allestimenti",
        description:
          "Scenografie, allestimenti fieristici, prop cinematografici di grandi dimensioni.",
      },
    ],
    sectors: [
      {
        name: "Aerospace e automotive",
        description:
          "Attrezzaggi di grande formato per linee produttive.",
      },
      {
        name: "Composites manufacturing",
        description:
          "Produttori di parti in carbonio/vetroresina.",
      },
      {
        name: "Arredo e design urbano",
        description:
          "Progetti di design per spazi pubblici e privati.",
      },
      {
        name: "Entertainment e retail",
        description:
          "Allestimenti, scenografie, elementi di comunicazione fisica.",
      },
    ],
    whenToChoose:
      "Scegli LSAM quando il pezzo supera i limiti dimensionali dell'FDM tradizionale (>500 mm) e non puoi dividerlo in parti più piccole da assemblare. Non è la scelta per pezzi piccoli o di elevata precisione — la risoluzione di strato è nell'ordine dei millimetri, non dei centesimi.",
    whyUs:
      "Coordiniamo l'intero progetto con partner LSAM europei, gestendo file, tempi, logistica e collaudo. Se necessaria la fresatura CNC post-stampa per migliorare la precisione, la prevediamo nel preventivo.",
    faqs: [
      {
        question: "Dimensione massima?",
        answer:
          "Dipende dal service: tipicamente fino a 5 × 3 × 2 metri. Progetti più grandi sono possibili con suddivisione in sezioni.",
      },
      {
        question: "Che materiali disponibili?",
        answer:
          "ABS, PETG, PC, Nylon in granulo. In alcuni casi compositi rinforzati con fibra di carbonio o vetro corto.",
      },
      {
        question: "È preciso come FDM?",
        answer:
          "No — la risoluzione di strato è nell'ordine di 2–8 mm. Per superfici di precisione si esegue fresatura CNC finale.",
      },
      {
        question: "Tempi di produzione?",
        answer:
          "Variabili: da 1 a 3 settimane a seconda di dimensione, materiale e finitura post-stampa richiesta.",
      },
    ],
  },

  progettazione: {
    overview:
      "La progettazione CAD e il Design for Additive Manufacturing (DfAM) sono il primo passo quando un'idea deve diventare un file e poi un pezzo. In 3DMAKES uniamo modellazione, ottimizzazione e sviluppo prodotto: se il componente esiste lo digitalizziamo e lo miglioriamo; se non esiste ancora lo progettiamo da schizzo, brief o vincoli tecnici. Dalla sede di Figino (Lugano) affianchiamo aziende, professionisti e privati in Ticino e Nord Italia con un unico interlocutore.",
    applications: [
      {
        title: "Modellazione CAD da idea o pezzo",
        description:
          "Partiamo da uno schizzo, un disegno 2D o un oggetto fisico (anche scansionato) e costruiamo un modello 3D pronto per stampa, laser o archivio.",
      },
      {
        title: "Ottimizzazione DfAM",
        description:
          "Adattiamo geometrie, spessori, raccordi e orientamento alla tecnologia scelta — FDM, SLA, SLS, MJF, CFF, SLM o laser — per ridurre scarti e rischi di stampa.",
      },
      {
        title: "Sviluppo prodotto",
        description:
          "Iteriamo concept, prototipo e preserie nello stesso laboratorio, accorciando i cicli di validazione.",
      },
      {
        title: "Revisione file esistenti",
        description:
          "Correggiamo mesh, tolleranze e feature non stampabili su STL, STEP e altri formati industriali.",
      },
    ],
    sectors: [
      {
        name: "Manifatturiero e PMI",
        description: "Attrezzaggi, ricambi e componenti da industrializzare senza partire da zero.",
      },
      {
        name: "Design e product development",
        description: "Studi e startup che hanno bisogno di un partner tecnico, non solo di un service di stampa.",
      },
      {
        name: "Professionisti e privati",
        description: "Progetti unici, replica di pezzi e supporto quando manca il file CAD.",
      },
    ],
    whenToChoose:
      "Scegli la progettazione & DfAM quando non hai ancora un file pronto, quando il pezzo esiste ma va migliorato, o quando vuoi capire quale geometria è sostenibile per la tecnologia scelta. Se hai già un STL verificato e sai esattamente cosa stampare, puoi partire dal catalogo tecnologie.",
    whyUs:
      "Non separiamo il disegno dalla produzione: chi progetta conosce macchine, materiali e limiti reali del laboratorio. Resta un solo referente dal primo confronto al pezzo consegnato.",
    faqs: [
      {
        question: "Posso arrivare solo con uno schizzo o una foto?",
        answer:
          "Sì. Valutiamo il brief, definiamo vincoli e costruiamo il modello CAD. Se serve, integriamo una scansione 3D del pezzo esistente.",
      },
      {
        question: "Cosa significa DfAM in pratica?",
        answer:
          "Significa progettare il pezzo per la stampa 3D o il laser: meno materiale dove non serve, raccordi stampabili, orientamento intelligente e scelta della tecnologia prima di congelare il design.",
      },
      {
        question: "Firmate un NDA sui progetti in sviluppo?",
        answer:
          "Sì, firmiamo accordi di riservatezza prima di ricevere file, brief o prototipi. Per i progetti aziendali è prassi.",
      },
    ],
  },

  consulenza: {
    overview:
      "La consulenza 3DMAKES serve a scegliere il processo giusto e, quando serve, a portare la produzione additiva in azienda. Non partiamo da un catalogo: partiamo dal risultato. Technology transfer, valutazione make-or-buy e coordinamento di una rete di partner restano sotto un unico interlocutore, dal laboratorio di Figino.",
    applications: [
      {
        title: "Scelta di processo e materiale",
        description:
          "Confrontiamo FDM, CFF, SLA, PolyJet, SLS, MJF, LSAM, SLM e laser su costi, tempi, finitura e prestazioni meccaniche.",
      },
      {
        title: "Technology transfer",
        description:
          "Affianchiamo team interni su macchine, materiali, slicing e organizzazione del flusso, senza vincolare il cliente a un brand.",
      },
      {
        title: "Make or buy",
        description:
          "Decidiamo insieme cosa ha senso produrre in sede e cosa conviene esternalizzare al laboratorio o alla rete partner.",
      },
      {
        title: "Interlocutore unico",
        description:
          "Quando serve una capacità extra, coordinamo partner qualificati mantenendo un solo punto di contatto per te.",
      },
    ],
    sectors: [
      {
        name: "Aziende in fase di adozione 3D",
        description: "PMI che vogliono introdurre la stampa 3D senza comprare la macchina sbagliata.",
      },
      {
        name: "R&D e uffici tecnici",
        description: "Team che hanno già un file o un pezzo e devono scegliere il percorso più efficace.",
      },
      {
        name: "Partner e committenti B2B",
        description: "Realtà che cercano un referente unico per più tecnologie, anche oltre il parco macchine interno.",
      },
    ],
    whenToChoose:
      "La consulenza è utile quando non è chiaro quale tecnologia usare, quando stai valutando un investimento in macchina, o quando il progetto attraversa più processi. Se hai già deciso FDM o SLA e hai il file, il calcolatore preventivo è il passo più rapido.",
    whyUs:
      "Siamo contemporaneamente laboratorio e consulenti: conosciamo i limiti reali di ogni processo e non vendiamo una sola tecnologia. La rete partner amplia le capacità, ma il confronto resta con 3DMAKES.",
    faqs: [
      {
        question: "La consulenza è a pagamento?",
        answer:
          "Il primo confronto sul progetto è incluso nella richiesta di preventivo. Percorsi di technology transfer o audit di processo si quotano a parte, in modo trasparente.",
      },
      {
        question: "Potete consigliare anche macchine da acquistare?",
        answer:
          "Sì. Aiutiamo a scegliere classe di macchina, materiali e organizzazione, in modo indipendente dal brand quando possibile.",
      },
      {
        question: "Lavorate solo con tecnologie interne?",
        answer:
          "No. Una rete di partner qualificati amplia le capacità; 3DMAKES resta l'interlocutore unico fino alla consegna.",
      },
    ],
  },

  cnc: {
    overview:
      "La fresatura CNC 3 e 4 assi di 3DMAKES serve a realizzare componenti tecnici, prototipi, dime e piccole serie in metallo, plastica, legno e compositi, direttamente dal file CAD. L'area utile è 200 × 200 × 100 mm in 3 assi; con il 4° asse eseguiamo lavorazioni cilindriche e su più lati fino a Ø80 × 150 mm. Tra i metalli lavoriamo alluminio, ottone e rame; acciaio inox e acciaio solo per lavorazioni leggere, dopo verifica di fattibilità. Dalla sede di Figino gestiamo analisi file, CAM, produzione e controllo dimensionale, con un solo interlocutore.",
    applications: [
      {
        title: "Prototipi funzionali",
        description:
          "Parti da montare e provare sul macchinario o sul prodotto, senza attendere uno stampo.",
      },
      {
        title: "Componenti e attrezzature",
        description:
          "Staffe, supporti, flange, piastre, dime, gusci e carter per officina e linee di assemblaggio.",
      },
      {
        title: "Piccole serie",
        description:
          "Lotti contenuti con ripetibilità, quando la stampa 3D non dà la finitura o il materiale richiesto.",
      },
      {
        title: "Lavorazioni cilindriche e su più lati",
        description:
          "Il 4° asse serve a fresare pezzi rotanti e più facce nello stesso setup, entro Ø80 × 150 mm — non è un optional di catalogo.",
      },
      {
        title: "Dal disegno al pezzo",
        description:
          "Se manca il CAD, progettiamo il componente da misure, disegni o campioni e poi lo fresiamo.",
      },
    ],
    sectors: [
      {
        name: "Officine e PMI manifatturiere",
        description: "Ricambi, attrezzaggi e particolari che servono in tempi brevi.",
      },
      {
        name: "R&D e product development",
        description: "Validazione di geometrie e accoppiamenti prima della produzione in serie.",
      },
      {
        name: "Ticino e Nord Italia",
        description: "Ritiro in sede a Figino o spedizione, con lo stesso referente del resto dei servizi 3DMAKES.",
      },
    ],
    whenToChoose:
      "Scegli la fresatura CNC quando il pezzo sta in 200 × 200 × 100 mm, oppure è un particolare cilindrico entro Ø80 × 150 mm, e ti servono superfici e forature da officina. Acciaio inox e acciaio li valutiamo solo per lavorazioni leggere. Per geometrie interne complesse o lotti in polimero, FDM, SLS o MJF possono restare più efficienti. Per lastre piane e marcature, il laser è spesso la via più diretta.",
    whyUs:
      "CNC, stampa 3D, scansione e progettazione stanno nello stesso laboratorio: ti diciamo se conviene fresare, stampare o combinare i due, senza farti scegliere a catalogo. Per il preventivo bastano file, quantità, materiale e le quote che contano.",
    faqs: [
      {
        question: "Che file mi serve per un preventivo CNC?",
        answer:
          "STEP o STP sono l'ideale. Accettiamo anche IGES, DXF e STL. Insieme al file servono quantità, materiale e eventuali tolleranze o finiture.",
      },
      {
        question: "Quali materiali fresate?",
        answer:
          "Alluminio, ottone, rame, plastiche tecniche (POM, PA, PC, ABS, HDPE, PMMA, PVC e altri), legno, MDF, compensato, fibra di carbonio e FR4. Acciaio inox e acciaio solo per lavorazioni leggere, dopo verifica di fattibilità.",
      },
      {
        question: "Quali sono le dimensioni massime?",
        answer:
          "In 3 assi fino a 200 × 200 × 100 mm. Con il 4° asse fino a Ø80 × 150 mm per lavorazioni cilindriche e su più lati.",
      },
      {
        question: "Non ho il modello 3D: potete partire da un pezzo o da un disegno?",
        answer:
          "Sì. Possiamo modellare il componente e poi fresarlo. Se serve, partiamo da una scansione 3D del campione.",
      },
      {
        question: "A cosa serve il 4° asse?",
        answer:
          "A fresare pezzi cilindrici e più facce nello stesso setup, entro Ø80 × 150 mm. Se il particolare sta in queste quote, lo proponiamo sul serio — non come voce di catalogo.",
      },
    ],
  },
};

export function getExtendedServiceContent(serviceId: string) {
  return serviceExtendedContent[serviceId] ?? null;
}
