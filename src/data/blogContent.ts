import i18n from '@/i18n';
import { newBlogPostsMeta, newBlogPostsContent } from '@/data/blogArticles2026';

/** Autori ufficiali del blog 3DMAKES (E-E-A-T e schema.org). */
export const BLOG_AUTHORS = ["Marco Pagani", "Matteo Verdicchio"] as const;

/** Retrocompatibilità: nome autore di default (primo della lista). */
export const BLOG_AUTHOR_NAME = BLOG_AUTHORS[0];

/**
 * Restituisce in modo deterministico uno degli autori in base all'id del post.
 * Usando un hash dell'id, la distribuzione appare casuale ma rimane stabile
 * tra i render (importante per SSR, SEO e schema.org).
 */
export const getAuthorForPost = (postId: string): string => {
  let hash = 0;
  for (let i = 0; i < postId.length; i++) {
    hash = (hash * 31 + postId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % BLOG_AUTHORS.length;
  return BLOG_AUTHORS[index];
};

// Helper function to get translated blog content with fallback
const t = (key: string, fallback?: string) => {
  const translation = i18n.t(key);
  return translation !== key ? translation : (fallback || key);
};

export const getBlogPosts = () => [
  ...newBlogPostsMeta.map((post) => ({
    id: post.id,
    title: t(post.titleKey, post.titleFallback),
    excerpt: t(post.excerptKey, post.excerptFallback),
    imageSrc: post.imageSrc,
    author: getAuthorForPost(post.id),
    date: post.date,
    category: t(post.categoryKey, post.categoryFallback),
    featured: Boolean(post.featured),
  })),
  {
    id: "drone-fpv-aether4-stampa-3d",
    title: t(
      'blogPosts.droneAether4.title',
      'Stampa 3D e assemblaggio di un drone FPV: il progetto Aether4'
    ),
    excerpt: t(
      'blogPosts.droneAether4.excerpt',
      "Nel laboratorio 3DMAKES abbiamo assemblato un drone FPV da 4 pollici con telaio stampato in 3D: l'Aether4. Materiali tecnici, processo di stampa, montaggio dell'elettronica e primi test di volo."
    ),
    imageSrc:
      "https://images.unsplash.com/photo-1508444845599-5c89863b1c44?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: getAuthorForPost("drone-fpv-aether4-stampa-3d"),
    date: "19 Apr 2026",
    category: t('blog.categories.casestudy', 'Caso Studio'),
    featured: true
  },
  {
    id: "riciclaggio-filamento-fdm",
    title: t(
      'blogPosts.recycling.title',
      'Riciclaggio dei materiali di stampa 3D FDM: zero scarti con 3DMAKES'
    ),
    excerpt: t(
      'blogPosts.recycling.excerpt',
      'Abbiamo integrato una tecnologia di riciclaggio interno che recupera il 100% degli scarti FDM: PLA, ABS, PETG, ASA e PA tornano filamento nuovo, pronto per prototipi e oggetti estetici.'
    ),
    imageSrc:
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: getAuthorForPost("riciclaggio-filamento-fdm"),
    date: "18 Apr 2026",
    category: t('blog.categories.innovation', 'Innovazione'),
    featured: true
  },
  {
    id: "stampa-3d-odontotecnica",
    title: t('blogPosts.dental.title', 'Stampa 3D in Odontotecnica'),
    excerpt: t('blogPosts.dental.excerpt', 'Esplorando come la produzione additiva sta rivoluzionando i metodi di produzione tradizionali nel settore dentale.'),
    imageSrc: "/images/projects/dental.png",
    author: getAuthorForPost("stampa-3d-odontotecnica"),
    date: "20 Apr 2023",
    category: t('blog.categories.technology', 'Tecnologia'),
    featured: true
  },
  {
    id: "ciotole-personalizzabili",
    title: t('blogPosts.petBowls.title', 'Ciotole Personalizzabili per Animali'),
    excerpt: t('blogPosts.petBowls.excerpt', 'Collezione di ciotole e accessori per animali domestici realizzati con stampa 3D.'),
    imageSrc: "/images/projects/ciotole.png",
    author: getAuthorForPost("ciotole-personalizzabili"),
    date: "15 Mar 2023",
    category: t('blog.categories.innovation', 'Innovazione')
  },
  {
    id: "cuscinetti-tpu-ferrature-equine",
    title: t('blogPosts.horseshoe.title', 'Cuscinetti in TPU per Ferrature Equine'),
    excerpt: t('blogPosts.horseshoe.excerpt', 'Cuscinetti in TPU stampati in 3D su misura per ferrature dei cavalli.'),
    imageSrc: "/images/projects/horseshoe.png",
    author: getAuthorForPost("cuscinetti-tpu-ferrature-equine"),
    date: "5 Feb 2023",
    category: t('blog.categories.casestudy', 'Caso Studio')
  },
  {
    id: "gadget-aziendali-nfc",
    title: t('blogPosts.nfcGadgets.title', 'Gadget Aziendali NFC Smart'),
    excerpt: t('blogPosts.nfcGadgets.excerpt', 'Gadget aziendali smart con tecnologia NFC integrata.'),
    imageSrc: "/images/projects/nfc-gadgets.png",
    author: getAuthorForPost("gadget-aziendali-nfc"),
    date: "28 Jan 2023",
    category: t('blog.categories.innovation', 'Innovazione')
  },
  {
    id: "accessori-ristorativi",
    title: t('blogPosts.restaurant.title', 'Collezione Accessori Ristorativi'),
    excerpt: t('blogPosts.restaurant.excerpt', 'Accessori innovativi e personalizzabili per ristoranti.'),
    imageSrc: "/images/projects/restaurant-accessories.png",
    author: getAuthorForPost("accessori-ristorativi"),
    date: "12 Jan 2023",
    category: t('blog.categories.casestudy', 'Caso Studio')
  },
  {
    id: "componenti-meccanici",
    title: t('blogPosts.mechanical.title', 'Componenti Meccanici Personalizzati'),
    excerpt: t('blogPosts.mechanical.excerpt', 'Componenti meccanici di alta precisione stampati in PETG.'),
    imageSrc: "/images/projects/comp.png",
    author: getAuthorForPost("componenti-meccanici"),
    date: "5 Dec 2022",
    category: t('blog.categories.technology', 'Tecnologia')
  },
  {
    id: "protesi-mediche",
    title: t('blogPosts.prosthetics.title', 'Protesi Mediche Personalizzate'),
    excerpt: t('blogPosts.prosthetics.excerpt', 'Dispositivi protesici personalizzati stampati con materiali biocompatibili.'),
    imageSrc: "/images/projects/medical.jpg",
    author: getAuthorForPost("protesi-mediche"),
    date: "18 Nov 2022",
    category: t('blog.categories.technology', 'Tecnologia')
  },
  {
    id: "come-funziona-stampa-3d",
    title: t('blogPosts.how3dWorks.title', 'Come funziona realmente la stampa 3D: guida completa'),
    excerpt: t('blogPosts.how3dWorks.excerpt', 'Una spiegazione dettagliata dei principi di funzionamento della stampa 3D.'),
    imageSrc: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    author: getAuthorForPost("come-funziona-stampa-3d"),
    date: "15 Oct 2022",
    category: t('blog.categories.tutorial', 'Tutorial'),
    featured: true
  },
  {
    id: "materiali-stampa-3d",
    title: t('blogPosts.materials.title', 'I migliori materiali per la stampa 3D nel 2026'),
    excerpt: t('blogPosts.materials.excerpt', 'Confronto tra PLA, ABS, PETG e resine: caratteristiche, vantaggi e applicazioni.'),
    imageSrc: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    author: getAuthorForPost("materiali-stampa-3d"),
    date: "16 Aug 2026",
    category: t('blog.categories.tutorial', 'Tutorial')
  },
  {
    id: "prototipazione-rapida",
    title: t('blogPosts.rapidPrototyping.title', 'Prototipazione rapida: velocizzare lo sviluppo prodotto'),
    excerpt: t('blogPosts.rapidPrototyping.excerpt', 'Come la stampa 3D sta rivoluzionando il processo di sviluppo prodotto.'),
    imageSrc: "/images/projects/prototipazione.png",
    author: getAuthorForPost("prototipazione-rapida"),
    date: "8 Aug 2022",
    category: t('blog.categories.innovation', 'Innovazione')
  },
  {
    id: "applicazioni-creative-stampa-3d",
    title: t('blogPosts.creativeApplications.title', 'Applicazioni creative della stampa 3D nel design'),
    excerpt: t('blogPosts.creativeApplications.excerpt', 'Esplorando le infinite possibilità creative offerte dalla stampa 3D.'),
    imageSrc: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    author: getAuthorForPost("applicazioni-creative-stampa-3d"),
    date: "3 Jul 2022",
    category: t('blog.categories.innovation', 'Innovazione')
  },
  {
    id: "stampanti-3d-confronto",
    title: t('blogPosts.printerComparison.title', 'Le migliori stampanti 3D per uso professionale'),
    excerpt: t('blogPosts.printerComparison.excerpt', 'Analisi comparativa delle migliori stampanti 3D professionali.'),
    imageSrc: "/images/projects/printers.png",
    author: getAuthorForPost("stampanti-3d-confronto"),
    date: "15 Jun 2022", 
    category: t('blog.categories.tutorial', 'Tutorial')
  }
];

// Export the translated version as the default
export const blogPosts = getBlogPosts();

// Blog content with full details - Expanded content for all posts
export const blogPostsContent = {
  ...newBlogPostsContent,
  "stampa-3d-odontotecnica": {
    title: "Stampa 3D in Odontotecnica",
    titleEn: "3D Printing in Dentistry",
    content: `Il settore odontoiatrico è uno dei primi ad aver adottato la stampa 3D su scala reale. Oggi consente di realizzare modelli, guide e dispositivi con una precisione e una ripetibilità difficilmente raggiungibili con i metodi tradizionali, riducendo allo stesso tempo tempi e margini di errore.

In questa guida vediamo come viene applicata la produzione additiva in odontotecnica, quali sono i servizi più richiesti e perché sempre più studi dentistici e laboratori si stanno orientando in questa direzione.

## 1) A cosa serve davvero la stampa 3D in odontoiatria
Non è una moda tecnologica: è un cambio di processo. Grazie alla scansione digitale e alla modellazione CAD, il flusso diventa interamente digitale e permette di produrre:
- guide chirurgiche personalizzate con precisione millimetrica
- modelli anatomici dettagliati per la pianificazione operatoria
- prototipi di dispositivi ortodontici per test e validazione
- componenti protesici temporanei biocompatibili
- impronte digitali per ortodonzia invisibile

## 2) Tecnologia SLA e precisione medicale
Per l'odontoiatria utilizziamo principalmente la tecnologia SLA (stereolitografia), che garantisce uno spessore dello strato fino a 0.05 mm e superfici lisce pronte per l'uso clinico. I materiali sono resine biocompatibili certificate, scelte specificatamente per l'applicazione: provvisori, guide chirurgiche, modelli, splint.

## 3) I vantaggi concreti per dentisti e laboratori
Passare a un flusso additivo significa ottenere benefici misurabili:
- riduzione dei tempi di produzione fino al 70%
- maggiore comfort per il paziente grazie al fitting digitale
- precisione superiore ai metodi tradizionali
- personalizzazione totale paziente per paziente
- tracciabilità digitale di ogni lavoro

## 4) Come lavoriamo in 3DMAKES
Dal file digitale (scansione o STL) al pezzo finito, gestiamo ogni fase: preparazione del modello, orientamento ottimale, scelta del materiale, stampa SLA, lavaggio, post-curing e controllo dimensionale.

Il futuro dell'odontoiatria è digitale: la stampa 3D è lo strumento che rende questa trasformazione davvero operativa.`,
    contentEn: `Dentistry is one of the first sectors to adopt 3D printing at real scale. It allows production of models, guides and devices with a precision and repeatability that traditional methods can hardly match, while reducing both lead times and error margins.

This guide explains how additive manufacturing is applied in dental labs, which services are most requested and why more studios are moving in this direction.

## 1) What 3D printing actually brings to dentistry
It's not just a trend: it's a process shift. Thanks to digital scanning and CAD modelling, the full workflow becomes digital and enables production of:
- custom surgical guides with millimetric precision
- detailed anatomical models for surgical planning
- orthodontic prototypes for testing and validation
- biocompatible temporary prosthetic components
- digital impressions for invisible orthodontics

## 2) SLA technology and medical precision
For dental work we mainly rely on SLA (stereolithography): layer thickness down to 0.05 mm, smooth surfaces, ready for clinical use. We work with certified biocompatible resins, chosen for each application: provisionals, surgical guides, models, splints.

## 3) Concrete advantages for dentists and labs
An additive workflow delivers measurable benefits:
- up to 70% reduction in production time
- better patient comfort thanks to digital fitting
- higher precision than traditional methods
- complete patient-by-patient customization
- fully digital traceability for every job

## 4) How we work at 3DMAKES
From the digital file (scan or STL) to the finished part, we handle every stage: model preparation, orientation, material selection, SLA printing, washing, post-curing and dimensional check.

The future of dentistry is digital: 3D printing is the tool that makes this transformation operational.`,
    details: {
      material: 'Resine biocompatibili certificate CE, PETG medical grade',
      printTime: '2-8 ore a seconda della complessità',
      quality: 'Strato 0.05-0.1mm per massima precisione',
      size: 'Personalizzato secondo necessità cliniche specifiche'
    },
    challenges: [
      'Mantenere precisione entro tolleranze cliniche rigorose',
      'Utilizzo esclusivo di materiali biocompatibili certificati',
      'Rispetto delle normative mediche e sanitarie vigenti',
      'Sterilizzazione e tracciabilità dei componenti'
    ],
    benefits: [
      'Riduzione significativa dei tempi di produzione (fino al 70%)',
      'Maggiore precisione rispetto ai metodi tradizionali',
      'Personalizzazione completa per ogni singolo paziente',
      'Miglioramento del comfort e dell\'esperienza del paziente'
    ]
  },
  "ciotole-personalizzabili": {
    title: "Ciotole Personalizzabili per Animali",
    titleEn: "Customizable Pet Bowls",
    content: `Una ciotola non è solo un contenitore: incide sul modo in cui l'animale mangia, beve e vive i suoi momenti quotidiani. Grazie alla stampa 3D possiamo progettare ciotole e accessori su misura, combinando funzionalità, design e una personalizzazione completa.

## 1) Progettate per il comfort dell'animale
Ogni ciotola viene pensata in base alla taglia, alla postura e alle abitudini dell'animale, non solo a un'estetica generica. I punti chiave del nostro design sono:
- forma ergonomica adatta al muso dell'animale
- base stabile e antiscivolo
- bordi studiati per non infastidire vibrisse e orecchie
- altezza corretta per cani anziani o con problemi articolari

## 2) Materiali sicuri e facili da pulire
Utilizziamo esclusivamente PETG food-grade certificato: un materiale resistente, lavabile in lavastoviglie e sicuro per il contatto con gli alimenti. Per gli accessori decorativi scegliamo PLA+ o finiture dedicate, sempre compatibili con un uso quotidiano.

## 3) La gamma: una ciotola per ogni esigenza
La personalizzazione permette di coprire scenari molto diversi:
- ciotole per cani di tutte le taglie (da 150 ml a 2 L)
- ciotole rialzate per cani anziani o con problemi articolari
- ciotole slow-feeding per rallentare l'alimentazione e aiutare la digestione
- ciotole per gatti con profilo ribassato
- accessori coordinati: portasacchetti, porta guinzaglio, scodelline da viaggio

## 4) Personalizzazione: il nome non è un dettaglio
Su ogni ciotola possiamo incidere il nome dell'animale, motivi decorativi, loghi, colori coordinati. È la parte che fa la differenza tra un oggetto utile e un oggetto a cui si affeziona il proprietario.

## 5) Dalla misura alla consegna
Il flusso è semplice: richiesta, scelta modello e taglia, personalizzazione, stampa, controllo qualità e spedizione. Se hai esigenze particolari (formati speciali, collaborazioni per petshop o studi veterinari), possiamo progettare soluzioni dedicate.

Ogni prodotto è testato per resistenza e sicurezza, per un risultato durevole, pulibile e davvero pensato per i nostri amici a quattro zampe.`,
    contentEn: `A bowl is not just a container: it affects how an animal eats, drinks and lives its daily routine. With 3D printing we can design custom bowls and accessories combining functionality, design and full personalization.

## 1) Designed around the animal's comfort
Every bowl is designed based on size, posture and habits of the animal, not just on generic aesthetics. Key design points:
- ergonomic shape suited to the animal's muzzle
- stable, non-slip base
- edges designed to avoid disturbing whiskers and ears
- correct height for senior dogs or those with joint issues

## 2) Safe, easy-to-clean materials
We use exclusively certified food-grade PETG: resistant, dishwasher safe and safe for food contact. For decorative accessories we use PLA+ or dedicated finishes, always compatible with daily use.

## 3) The range: a bowl for every need
Personalization covers very different scenarios:
- dog bowls of all sizes (150 ml to 2 L)
- raised bowls for senior dogs or with joint issues
- slow-feeding bowls to slow down eating and aid digestion
- low-profile cat bowls
- matching accessories: bag holders, leash holders, travel bowls

## 4) Personalization: the name is not a detail
We can engrave the animal's name, decorative motifs, logos and matching colors on every bowl. This is what turns a useful object into something the owner gets attached to.

## 5) From spec to delivery
The workflow is simple: request, model and size selection, personalization, printing, QA and shipping. For special needs (custom formats, collaborations with petshops or vet clinics), we can design dedicated solutions.

Every product is tested for resistance and safety, for a durable, cleanable result truly designed around our four-legged friends.`,
    details: {
      material: 'PETG food-grade certificato, PLA+ per accessori decorativi',
      printTime: '2-6 ore per pezzo a seconda delle dimensioni',
      quality: 'Strato 0.2-0.3mm per superficie liscia',
      size: 'Da XS (150ml) a XL (2000ml) personalizzabili'
    },
    challenges: [
      'Garantire totale sicurezza alimentare dei materiali utilizzati',
      'Creare design antiscivolo efficace su diverse superfici',
      'Assicurare resistenza alle sollecitazioni quotidiane e al lavaggio',
      'Bilanciare estetica e funzionalità pratica'
    ],
    benefits: [
      'Personalizzazione completa del design e delle dimensioni',
      'Materiali certificati sicuri per uso alimentare animale',
      'Facilità di pulizia e manutenzione quotidiana',
      'Design ergonomico che migliora l\'esperienza alimentare'
    ]
  },
  "cuscinetti-tpu-ferrature-equine": {
    title: "Cuscinetti in TPU per Ferrature Equine",
    titleEn: "TPU Cushions for Equine Horseshoes",
    content: `La stampa 3D sta entrando anche nel mondo equino, offrendo soluzioni su misura per uno dei problemi più delicati: l'ammortizzazione dello zoccolo. Grazie al TPU (poliuretano termoplastico) possiamo realizzare cuscinetti personalizzati che migliorano il comfort del cavallo e la durata della ferratura.

## 1) Perché un cuscinetto fa la differenza
Lo zoccolo del cavallo subisce impatti continui: terreno irregolare, lavoro prolungato, sollecitazioni articolari. Un buon cuscinetto:
- riduce lo stress sulle articolazioni
- assorbe urti e vibrazioni
- protegge la zona sensibile dal contatto con sassi e detriti
- aumenta l'aderenza su superfici scivolose

## 2) Perché il TPU
Il TPU è un materiale flessibile, resistente all'abrasione e stabile nel tempo. Rispetto a soluzioni tradizionali offre:
- buona elasticità e ritorno elastico controllato
- resistenza all'umidità e agli agenti atmosferici
- ottima resistenza all'usura
- possibilità di modulare la durezza (Shore A 85-95) in base al cavallo e al tipo di lavoro

## 3) Personalizzazione tramite scansione 3D
Ogni cuscinetto viene realizzato partendo da una scansione 3D accurata dello zoccolo. Il file viene poi ottimizzato in CAD per garantire:
- un adattamento perfetto alla forma reale
- una distribuzione uniforme del peso
- geometrie interne (lattice o canali di flusso) impossibili con metodi tradizionali

Il risultato è un prodotto letteralmente "su misura", non un compromesso standard.

## 4) Collaborazione con maniscalchi esperti
I nostri cuscinetti sono progettati insieme a maniscalchi, che contribuiscono con esperienza pratica sulle patologie podali più comuni e sulle esigenze specifiche di ogni cavallo (da lavoro, sportivo, anziano, in riabilitazione).

## 5) Vantaggi per il cavallo
Una ferratura con cuscinetto ben progettato porta benefici concreti:
- riduzione significativa dello stress articolare
- migliore aderenza su superfici difficili
- protezione superiore da sassi e detriti
- comfort aumentato durante il movimento
- prevenzione di diverse patologie podali

## 6) Installazione e sostituzione
Il cuscinetto in TPU è pensato per essere facile da installare per il maniscalco e semplice da sostituire quando necessario, senza interventi invasivi sulla ferratura tradizionale.

La stampa 3D, in questo caso, non è un vezzo tecnologico: è lo strumento che permette di creare geometrie e proprietà meccaniche altrimenti impossibili, a beneficio diretto del cavallo.`,
    contentEn: `3D printing is entering the equine world too, offering tailor-made solutions for one of the most delicate problems: hoof cushioning. Using TPU (thermoplastic polyurethane) we can produce custom pads that improve horse comfort and the lifetime of the shoeing.

## 1) Why a pad makes a difference
A horse's hoof constantly absorbs impacts: uneven ground, long work sessions, joint stress. A good pad:
- reduces joint stress
- absorbs impacts and vibrations
- protects the sensitive area from stones and debris
- improves grip on slippery surfaces

## 2) Why TPU
TPU is a flexible, abrasion-resistant and long-term stable material. Compared to traditional options it offers:
- good elasticity and controlled elastic return
- resistance to humidity and weather
- excellent wear resistance
- tunable hardness (Shore A 85-95) based on the horse and its workload

## 3) Personalization via 3D scanning
Every pad is made starting from an accurate 3D scan of the hoof. The file is then optimized in CAD to ensure:
- perfect adaptation to the real shape
- uniform weight distribution
- internal geometries (lattice or flow channels) impossible with traditional methods

The outcome is a literally "tailor-made" product, not a standard compromise.

## 4) Working with expert farriers
Our pads are designed together with farriers, who bring hands-on experience on common hoof pathologies and specific needs of each horse (working, sport, senior, rehabilitation).

## 5) Benefits for the horse
A well-designed pad delivers concrete benefits:
- significant reduction in joint stress
- better grip on difficult surfaces
- superior protection from stones and debris
- increased comfort during movement
- prevention of several hoof pathologies

## 6) Installation and replacement
The TPU pad is designed to be easy for the farrier to install and simple to replace when needed, without invasive changes to traditional shoeing.

Here, 3D printing is not a tech gimmick: it is the tool that enables geometries and mechanical properties otherwise impossible, for the direct benefit of the horse.`,
    details: {
      material: 'TPU Shore A 85-95, resistente e flessibile',
      printTime: '4-8 ore per set completo',
      quality: 'Strato 0.3mm per resistenza ottimale',
      size: 'Personalizzato su misura per ogni zoccolo'
    }
  },
  "gadget-aziendali-nfc": {
    title: "Gadget Aziendali NFC Smart",
    titleEn: "Smart NFC Corporate Gadgets",
    content: `Il networking aziendale sta cambiando. Il biglietto da visita tradizionale si perde in un cassetto, i gadget da fiera finiscono nei rifiuti, e le aziende cercano strumenti più moderni per comunicare il proprio brand. Qui entrano in gioco i gadget NFC stampati in 3D: oggetti unici che uniscono design personalizzato e tecnologia contactless.

## 1) Cos'è NFC e perché è rilevante oggi
NFC (Near Field Communication) è la stessa tecnologia dei pagamenti contactless. Basta avvicinare lo smartphone al gadget per attivare un'azione digitale: aprire un sito, salvare un contatto, collegarsi al WiFi, scaricare un'app. Nessuna installazione, nessun QR da inquadrare, solo un gesto naturale.

## 2) La nostra gamma di gadget NFC
Grazie alla stampa 3D possiamo realizzare oggetti unici, con forma, colore e finitura su misura. Le soluzioni più richieste includono:
- biglietti da visita smart con chip NFC integrato
- portachiavi aziendali con link diretti al sito web
- supporti per smartphone con funzioni contactless
- badge e portabadge per eventi e fiere
- gadget promozionali interattivi per campagne marketing

## 3) Azioni programmabili
Ogni gadget può essere configurato per un'azione specifica, e può essere anche riprogrammato in un secondo momento. Alcuni esempi:
- apertura automatica del sito aziendale
- condivisione diretta del contatto (vCard)
- download diretto di un'app
- connessione automatica al WiFi dell'ufficio
- apertura di un video, una landing o una pagina di offerta

## 4) Design personalizzato: è lì che vinci
Il valore reale di un gadget NFC nasce dal design. Stampando in 3D possiamo:
- riprodurre fedelmente il logo aziendale
- usare i colori del brand
- creare forme esclusive, non replicabili in serie tradizionali
- inserire texture, incisioni o rilievi

Il risultato è un oggetto che viene conservato, non buttato.

## 5) Vantaggi per l'azienda
Utilizzare gadget NFC porta benefici concreti:
- condivisione istantanea delle informazioni
- eliminazione dei biglietti cartacei
- tracciamento delle interazioni per analisi marketing
- aggiornamento remoto dei contenuti collegati
- maggiore impatto e memorabilità del brand

## 6) Sostenibilità e modernità
Un biglietto NFC è riutilizzabile, aggiornabile e riduce sprechi cartacei. Per un'azienda è un modo concreto per mostrare attenzione all'ambiente senza rinunciare a uno strumento di comunicazione efficace.

Se stai progettando un evento, una campagna o semplicemente vuoi modernizzare i tuoi biglietti da visita, possiamo aiutarti a costruire un gadget NFC completo: design, stampa 3D, programmazione del chip e test funzionali.`,
    contentEn: `Corporate networking is changing. Traditional business cards end up lost in drawers, trade-show giveaways in the trash. Companies are looking for modern tools to communicate their brand. That's where 3D-printed NFC gadgets come in: unique objects combining custom design and contactless technology.

## 1) What NFC is and why it matters today
NFC (Near Field Communication) is the same technology behind contactless payments. Just tap a smartphone on the gadget to trigger a digital action: open a website, save a contact, connect to WiFi, download an app. No install, no QR to scan, just a natural gesture.

## 2) Our NFC gadget range
Thanks to 3D printing we can create unique objects, with custom shape, color and finish. Most requested solutions include:
- smart business cards with integrated NFC chip
- corporate keychains with direct website links
- smartphone stands with contactless features
- badges and holders for events and trade shows
- interactive promotional gadgets for marketing campaigns

## 3) Programmable actions
Each gadget can be configured for a specific action, and can also be reprogrammed later. Examples:
- auto-open of the corporate website
- direct contact sharing (vCard)
- direct app download
- auto-connect to the office WiFi
- open a video, landing page or offer page

## 4) Custom design: that's where you win
The real value of an NFC gadget is the design. With 3D printing we can:
- reproduce the company logo faithfully
- use brand colors
- create exclusive shapes, not reproducible with traditional mass production
- add textures, engravings or reliefs

The result is an object people keep instead of discard.

## 5) Advantages for the company
Using NFC gadgets brings concrete benefits:
- instant information sharing
- paper business cards eliminated
- interaction tracking for marketing analytics
- remote update of linked content
- greater brand impact and recall

## 6) Sustainability and modern image
An NFC card is reusable, updatable and reduces paper waste. For a company it's a real way to show environmental awareness without giving up an effective communication tool.

If you're planning an event, a campaign or just want to modernize your business cards, we can help you build a complete NFC gadget: design, 3D printing, chip programming and functional tests.`,
    details: {
      material: 'PLA+, PETG, ABS per diversi utilizzi',
      printTime: '1-3 ore per gadget standard',
      quality: 'Strato 0.2mm per finitura professionale',
      size: 'Formato standard o completamente personalizzato'
    }
  },
  "accessori-ristorativi": {
    title: "Collezione Accessori Ristorativi",
    titleEn: "Restaurant Accessories Collection",
    content: `Un ristorante, un bar o un hotel non si distinguono solo per il menù: ogni dettaglio comunica il brand, dalle tovaglie al sottobicchiere. La stampa 3D permette di creare accessori completamente personalizzati, resistenti e coerenti con l'identità visiva del locale, senza dover acquistare grandi quantità in stock.

## 1) La nostra collezione per il settore Ho.Re.Ca.
Progettiamo soluzioni pensate per la vita quotidiana di un locale:
- sottobicchieri personalizzati con logo del ristorante
- portamenù resistenti e facilmente lavabili
- organizer per tavoli e banconi
- supporti per tablet e dispositivi POS
- accessori per la presentazione dei piatti
- dispenser personalizzati per tovaglioli e condimenti

Ogni pezzo è progettato per essere robusto, pulibile e coerente con l'estetica del locale.

## 2) Materiali certificati per uso alimentare
La scelta del materiale è fondamentale. Utilizziamo:
- PETG food-grade per accessori a contatto con alimenti
- ABS per componenti strutturali più sollecitati
- PLA+ biodegradabile per articoli monouso o di breve durata

La nostra priorità è la sicurezza: tutti i materiali sono compatibili con le normative igienico-sanitarie del settore.

## 3) Personalizzazione totale: il brand visibile ovunque
Stampando in 3D non sei più legato a cataloghi generici. Puoi richiedere:
- forme esclusive
- loghi in rilievo o incisi
- colori perfettamente coordinati al brand
- serie numerate per eventi e menu speciali

Un locale con accessori coordinati trasmette cura, professionalità e unicità. Il cliente lo percepisce, e lo ricorda.

## 4) Produzione su misura, senza magazzino
Con la stampa 3D puoi ordinare esattamente quello che ti serve, nei tempi che ti servono:
- 20 sottobicchieri per un evento privato
- 50 portamenù per la nuova stagione
- 5 supporti POS custom per il tuo sistema
- 200 dispenser personalizzati per una catena

Niente minimi d'ordine impossibili, niente avanzi in magazzino.

## 5) Manutenzione e resistenza
Tutti gli accessori sono progettati per resistere all'uso quotidiano: lavaggi frequenti, urti, calore moderato, prodotti di pulizia comuni. Quando un pezzo si rompe, lo rimpiazziamo rapidamente senza dover riordinare l'intera collezione.

Se stai aprendo un nuovo locale, rinnovando il concept o preparando un evento speciale, possiamo aiutarti a costruire una collezione coordinata che rafforza il tuo brand dal primo piatto all'ultimo caffè.`,
    contentEn: `A restaurant, bar or hotel is not defined only by the menu: every detail communicates the brand, from tablecloths to coasters. 3D printing makes it possible to create fully custom, durable accessories aligned with the venue's visual identity, without buying large stock quantities.

## 1) Our Ho.Re.Ca. collection
We design solutions tailored to the daily life of a venue:
- custom coasters with restaurant logo
- durable, easily washable menu holders
- organizers for tables and counters
- stands for tablets and POS devices
- accessories for plate presentation
- custom dispensers for napkins and condiments

Every piece is built to be sturdy, cleanable and consistent with the venue's aesthetics.

## 2) Food-safe certified materials
Material choice is critical. We use:
- food-grade PETG for food-contact accessories
- ABS for more stressed structural components
- biodegradable PLA+ for disposable or short-life items

Safety comes first: all materials comply with sector hygiene regulations.

## 3) Full customization: your brand, everywhere
With 3D printing you're no longer stuck with generic catalogs. You can request:
- exclusive shapes
- embossed or engraved logos
- colors perfectly matched to the brand
- numbered editions for events and special menus

A venue with coordinated accessories communicates care, professionalism and uniqueness. The customer notices, and remembers.

## 4) On-demand production, no warehouse
With 3D printing you order exactly what you need, when you need it:
- 20 coasters for a private event
- 50 menu holders for the new season
- 5 custom POS stands for your system
- 200 personalized dispensers for a chain

No impossible minimum orders, no leftover stock.

## 5) Maintenance and durability
Every accessory is designed for daily use: frequent washing, impacts, moderate heat, common cleaning products. When a piece breaks, we quickly replace it without reordering the whole collection.

If you're opening a new venue, refreshing your concept or preparing a special event, we can help you build a coordinated collection that strengthens your brand from the first plate to the last coffee.`,
    details: {
      material: 'PETG food-grade, ABS, PLA+ biodegradabile',
      printTime: '1-6 ore a seconda della complessità',
      quality: 'Strato 0.2-0.3mm per uso intensivo',
      size: 'Standard o personalizzato secondo esigenze'
    }
  },
  "componenti-meccanici": {
    title: "Componenti Meccanici Personalizzati",
    titleEn: "Custom Mechanical Components",
    content: `La produzione additiva non serve più solo per prototipi estetici. Oggi è una tecnologia matura che permette di realizzare componenti meccanici funzionali, con tolleranze controllate e prestazioni adatte a test reali, piccole serie e applicazioni industriali.

In questa guida vediamo in quali settori la stampa 3D sta sostituendo o affiancando i metodi tradizionali, e come sfruttarla al meglio per componenti meccanici personalizzati.

## 1) Dove la stampa 3D fa davvero la differenza
La produzione additiva è particolarmente efficace quando servono:
- geometrie complesse impossibili con fresatura o stampaggio
- leggerezza senza perdere resistenza (strutture lattice)
- pezzi su misura in piccole tirature
- iterazioni rapide tra una versione e la successiva
- riduzione dei tempi di attrezzaggio

## 2) Settori di applicazione
Lavoriamo con realtà che operano in ambiti molto diversi. Alcuni esempi tipici:
- **Automotive**: prototipi funzionali, componenti di ricambio, parti per racing
- **Aerospaziale**: parti leggere ad alta resistenza, elementi di staffaggio custom
- **Robotica**: giunti, supporti, custodie, flangie personalizzate
- **Automazione industriale**: guide, supporti, adattatori, afferraggi
- **Prototipazione funzionale**: test reali prima della produzione di serie

## 3) Materiali tecnici selezionati
Non ogni pezzo può essere stampato con un PLA di base. Per componenti meccanici utilizziamo materiali selezionati in base al carico reale:
- PETG rinforzato, per parti robuste e resistenti agli urti
- PC (policarbonato), quando servono resistenza e stabilità a temperature elevate
- ABS e ASA per parti tecniche con buona lavorabilità post-stampa
- compositi in fibra di carbonio per rigidezza e leggerezza
- TPU quando serve flessibilità o assorbimento vibrazioni

## 4) Progettazione ottimizzata per la stampa
Un buon risultato nasce prima della stampa, in fase CAD. Ogni componente viene progettato tenendo conto di:
- orientamento ottimale per direzione di carico
- spessori minimi e raggi di raccordo
- tolleranze per accoppiamenti (fori, perni, guide)
- posizione dei supporti e accessibilità per la rimozione
- simulazioni FEA per verificare punti critici

## 5) Vantaggi concreti della produzione additiva
Rispetto ai metodi tradizionali, una parte stampata può offrire:
- geometrie impossibili con fresatura o stampaggio
- riduzione del peso fino al 40%
- tempi di produzione ridotti per prototipi e piccole serie
- integrazione di più funzioni in un singolo pezzo
- personalizzazione completa senza costi di attrezzaggio

## 6) Come lavoriamo su un componente meccanico
Il nostro processo tipico:
1. Analisi del file CAD e del carico di utilizzo
2. Selezione tecnologia e materiale
3. Ottimizzazione geometrica per stampa (orientamento, supporti, tolleranze)
4. Stampa e post-processing
5. Controllo dimensionale con strumenti di misura

Se hai un componente da prototipare o una piccola serie da produrre, possiamo analizzare il progetto e consigliarti l'approccio più adatto. L'obiettivo non è "usare la stampa 3D a tutti i costi", ma scegliere la tecnologia giusta per il tuo risultato.`,
    contentEn: `Additive manufacturing is no longer just for aesthetic prototypes. Today it's a mature technology that allows production of functional mechanical components with controlled tolerances and performance suitable for real tests, small batches and industrial applications.

This guide explains where 3D printing is replacing or complementing traditional methods, and how to leverage it for custom mechanical components.

## 1) Where 3D printing really makes a difference
Additive manufacturing shines when you need:
- complex geometries impossible with milling or molding
- lightweight parts without losing strength (lattice structures)
- custom parts in small batches
- fast iterations between versions
- reduced tooling times

## 2) Application sectors
We work with companies from very different fields. Typical examples:
- **Automotive**: functional prototypes, spare parts, racing components
- **Aerospace**: lightweight high-strength parts, custom brackets
- **Robotics**: custom joints, supports, housings, flanges
- **Industrial automation**: guides, supports, adapters, grippers
- **Functional prototyping**: real tests before series production

## 3) Selected technical materials
Not every part can be printed in basic PLA. For mechanical components we use materials selected based on the real load:
- reinforced PETG, for robust, impact-resistant parts
- PC (polycarbonate), when you need strength and stability at higher temperatures
- ABS and ASA for technical parts with good post-processing
- carbon-fiber composites for stiffness and lightness
- TPU when flexibility or vibration damping is needed

## 4) Design optimized for 3D printing
A good result starts before printing, in CAD. Each component is designed accounting for:
- optimal orientation based on load direction
- minimum thicknesses and fillets
- tolerances for fits (holes, pins, guides)
- support placement and accessibility for removal
- FEA simulations to verify critical points

## 5) Concrete advantages of additive manufacturing
Compared to traditional methods, a printed part can offer:
- geometries impossible with milling or molding
- weight reduction up to 40%
- shorter production times for prototypes and small batches
- multiple functions integrated in a single piece
- complete customization with no tooling costs

## 6) How we approach a mechanical component
Our typical process:
1. CAD file and load case analysis
2. Technology and material selection
3. Geometry optimization for printing (orientation, supports, tolerances)
4. Printing and post-processing
5. Dimensional control with measurement tools

If you have a component to prototype or a small batch to produce, we can analyze the project and recommend the best approach. The goal isn't "use 3D printing at all costs", but choosing the right technology for your result.`,
    details: {
      material: 'PETG rinforzato, PC, ABS-CF (fibra di carbonio)',
      printTime: '4-24 ore a seconda della complessità',
      quality: 'Strato 0.1-0.3mm per precisione meccanica',
      size: 'Fino a 300x300x400mm in singolo pezzo'
    }
  },
  "protesi-mediche": {
    title: "Protesi Mediche Personalizzate",
    titleEn: "Custom Medical Prosthetics",
    content: `La stampa 3D sta rivoluzionando il settore delle protesi mediche, offrendo soluzioni personalizzate che migliorano significativamente la qualità di vita dei pazienti.

**Vantaggi delle protesi stampate in 3D:**
- Personalizzazione totale basata sulla scansione anatomica del paziente
- Riduzione drastica dei tempi di produzione (da settimane a giorni)
- Costi significativamente inferiori rispetto alle protesi tradizionali
- Possibilità di creare geometrie complesse e funzionali
- Materiali biocompatibili certificati per uso medico

**Il nostro processo di produzione:**
1. **Scansione 3D precisa** del residuo anatomico del paziente
2. **Modellazione CAD personalizzata** con software medici specializzati
3. **Prototipazione rapida** per test di vestibilità e comfort
4. **Stampa finale** con materiali biocompatibili certificati
5. **Finitura e assemblaggio** per un risultato estetico e funzionale

Utilizziamo materiali all'avanguardia come PETG medical grade, TPU per parti flessibili e resine biocompatibili per dettagli precisi. Ogni protesi viene progettata considerando non solo l'aspetto funzionale, ma anche quello estetico e psicologico.

**Settori di applicazione:**
- Protesi di arti superiori con meccanismi di presa personalizzati
- Protesi di arti inferiori con distribuzione ottimizzata del peso
- Dispositivi ortopedici su misura per supporto articolare
- Protesi maxillo-facciali per ricostruzione estetica
- Dispositivi di riabilitazione personalizzati

La collaborazione con medici specialisti e protesisti esperti garantisce risultati che rispettano le più rigorose normative mediche, offrendo ai pazienti dispositivi sicuri, funzionali e personalizzati.`,
    contentEn: `3D printing is revolutionizing the medical prosthetics sector, offering personalized solutions that significantly improve patients' quality of life.

**Advantages of 3D printed prosthetics:**
- Total customization based on patient's anatomical scanning
- Drastic reduction in production times (from weeks to days)
- Significantly lower costs compared to traditional prosthetics
- Ability to create complex and functional geometries
- Certified biocompatible materials for medical use

**Our production process:**
1. **Precise 3D scanning** of the patient's anatomical residue
2. **Personalized CAD modeling** with specialized medical software
3. **Rapid prototyping** for fit and comfort testing
4. **Final printing** with certified biocompatible materials
5. **Finishing and assembly** for an aesthetic and functional result

We use cutting-edge materials such as medical grade PETG, TPU for flexible parts and biocompatible resins for precise details. Each prosthetic is designed considering not only the functional aspect, but also the aesthetic and psychological one.

**Application sectors:**
- Upper limb prosthetics with personalized gripping mechanisms
- Lower limb prosthetics with optimized weight distribution
- Custom orthopedic devices for joint support
- Maxillofacial prosthetics for aesthetic reconstruction
- Personalized rehabilitation devices

Collaboration with specialist doctors and expert prosthetists guarantees results that respect the most rigorous medical regulations, offering patients safe, functional and personalized devices.`,
    details: {
      material: 'PETG medical grade, TPU biocompatibile, resine certificate',
      printTime: '8-24 ore a seconda della complessità',
      quality: 'Strato 0.1-0.2mm per precisione medica',
      size: 'Completamente personalizzato su anatomia paziente'
    },
    challenges: [
      'Rispetto rigoroso delle normative mediche internazionali',
      'Garantire biocompatibilità e sicurezza a lungo termine',
      'Bilanciare funzionalità, estetica e comfort per il paziente',
      'Integrazione con sistemi di controllo mio-elettrici avanzati'
    ],
    benefits: [
      'Riduzione costi fino al 70% rispetto a protesi tradizionali',
      'Tempi di consegna ridotti da settimane a pochi giorni',
      'Personalizzazione totale per massimo comfort e funzionalità',
      'Possibilità di aggiornamenti e modifiche rapide'
    ]
  },
  "prototipazione-rapida": {
    title: "Prototipazione rapida: velocizzare lo sviluppo prodotto",
    titleEn: "Rapid Prototyping: Accelerating Product Development",
    content: `La prototipazione rapida attraverso la stampa 3D ha rivoluzionato il modo in cui le aziende sviluppano nuovi prodotti, riducendo drasticamente i tempi e i costi del processo di sviluppo.

**Vantaggi della prototipazione 3D:**
- **Velocità**: Da concept a prototipo fisico in 24-48 ore
- **Iterazione rapida**: Modifiche e miglioramenti in tempo reale
- **Riduzione costi**: Eliminazione di stampi e attrezzature costose
- **Test funzionali**: Validazione immediata di design e meccanismi
- **Comunicazione efficace**: Prototipi tangibili per stakeholder e clienti

**Il nostro processo di prototipazione:**
1. **Analisi del concept** e definizione dei requisiti tecnici
2. **Modellazione CAD ottimizzata** per stampa 3D
3. **Selezione materiali** in base alle proprietà richieste
4. **Stampa del prototipo** con tecnologie appropriate (FDM/SLA)
5. **Test e validazione** funzionale e estetica
6. **Iterazione e perfezionamento** basato sui feedback

**Settori di applicazione:**
- **Automotive**: Componenti di interni, parti motore, accessori
- **Elettronica**: Custodie, supporti, dissipatori personalizzati
- **Medicale**: Dispositivi, strumenti, modelli anatomici
- **Aerospace**: Componenti leggeri, parti complesse, strumenti
- **Consumer goods**: Prodotti di design, elettrodomestici, giocattoli

**Materiali specializzati per prototipazione:**
- **PLA+**: Prototipazione rapida e modelli estetici
- **PETG**: Prototipi funzionali resistenti e trasparenti  
- **ABS**: Parti meccaniche e test di resistenza
- **TPU**: Componenti flessibili e guarnizioni
- **Resine tecniche**: Dettagli precisi e superfici lisce

La prototipazione rapida permette di identificare e risolvere problemi di design prima della produzione, riducendo significativamente il time-to-market e i costi di sviluppo.`,
    contentEn: `Rapid prototyping through 3D printing has revolutionized the way companies develop new products, drastically reducing development process times and costs.

**Advantages of 3D prototyping:**
- **Speed**: From concept to physical prototype in 24-48 hours
- **Rapid iteration**: Real-time modifications and improvements
- **Cost reduction**: Elimination of expensive molds and tooling
- **Functional testing**: Immediate validation of design and mechanisms
- **Effective communication**: Tangible prototypes for stakeholders and clients

**Our prototyping process:**
1. **Concept analysis** and technical requirements definition
2. **Optimized CAD modeling** for 3D printing
3. **Material selection** based on required properties
4. **Prototype printing** with appropriate technologies (FDM/SLA)
5. **Testing and validation** functional and aesthetic
6. **Iteration and refinement** based on feedback

**Application sectors:**
- **Automotive**: Interior components, engine parts, accessories
- **Electronics**: Cases, supports, custom heat sinks
- **Medical**: Devices, instruments, anatomical models
- **Aerospace**: Lightweight components, complex parts, tools
- **Consumer goods**: Design products, appliances, toys

**Specialized materials for prototyping:**
- **PLA+**: Rapid prototyping and aesthetic models
- **PETG**: Resistant and transparent functional prototypes
- **ABS**: Mechanical parts and resistance testing
- **TPU**: Flexible components and gaskets
- **Technical resins**: Precise details and smooth surfaces

Rapid prototyping allows identifying and solving design problems before production, significantly reducing time-to-market and development costs.`,
    details: {
      material: 'PLA+, PETG, ABS, TPU, resine tecniche specializzate',
      printTime: '6-48 ore a seconda di complessità e dimensioni',
      quality: 'Strato 0.1-0.3mm ottimizzato per applicazione',
      size: 'Da modelli scala 1:10 a prototipi full-size'
    },
    challenges: [
      'Selezione del materiale ottimale per ogni test specifico',
      'Bilanciamento tra velocità di produzione e qualità richiesta',
      'Gestione delle iterazioni multiple in tempi stretti',
      'Simulazione accurata delle proprietà del materiale finale'
    ],
    benefits: [
      'Riduzione del time-to-market fino al 50%',
      'Abbattimento costi di sviluppo del 60-80%',
      'Identificazione precoce di problemi di design',
      'Miglioramento della comunicazione con stakeholder e clienti'
    ]
  },
  "applicazioni-creative-stampa-3d": {
    title: "Applicazioni creative della stampa 3D nel design",
    titleEn: "Creative Applications of 3D Printing in Design",
    content: `La stampa 3D ha aperto infinite possibilità creative nel mondo del design, permettendo ai designer di superare i limiti delle tecnologie di produzione tradizionali e di esplorare forme, strutture e funzionalità completamente nuove.

**Rivoluzione nel design contemporaneo:**
- **Forme organiche complesse**: Geometrie impossibili con metodi tradizionali
- **Strutture parametriche**: Design generativi e algoritmi creativi
- **Personalizzazione di massa**: Prodotti unici su scala industriale
- **Integrazione funzionale**: Multiple funzioni in un singolo oggetto
- **Sostenibilità**: Produzione on-demand e riduzione sprechi

**Settori creativi trasformati:**
- **Design d'arredamento**: Lampade, sedie, tavoli con geometrie organiche
- **Gioielleria**: Pezzi unici con dettagli intricati impossibili a mano
- **Architettura**: Modelli, componenti strutturali, elementi decorativi
- **Fashion**: Accessori, calzature, tessuti flessibili innovativi
- **Arte**: Sculture, installazioni, opere interattive

**Tecniche creative avanzate:**
1. **Design generativo**: Algoritmi che creano forme ottimizzate
2. **Stampa multi-materiale**: Combinazione di proprietà diverse
3. **Strutture lattice**: Geometrie leggere ma resistenti
4. **Superfici testurizzate**: Effetti tattili e visivi unici
5. **Meccanismi integrati**: Parti mobili stampate assemblate

**Materiali per applicazioni creative:**
- **PLA colorato**: Vasta gamma di colori e finiture speciali
- **PETG trasparente**: Effetti cristallini e giochi di luce
- **Materiali compositi**: Fibra di carbonio, legno, metallo
- **Materiali flessibili**: TPU per texture morbide e flessibili
- **Resine specializzate**: Superfici ultra-lisce e dettagli finissimi

**Case study di successo:**
- Lampade parametriche che ottimizzano la diffusione della luce
- Sedie ergonomiche personalizzate sulla biomeccanica individuale
- Gioielli con geometrie fractali e strutture impossibili
- Elementi architettonici che integrano funzioni multiple
- Calzature sportive con suole ottimizzate per ogni atleta

La stampa 3D democratizza l'innovazione nel design, permettendo a creativi e aziende di sperimentare rapidamente e a costi contenuti, trasformando idee audaci in prodotti reali.`,
    contentEn: `3D printing has opened infinite creative possibilities in the design world, allowing designers to overcome the limits of traditional production technologies and explore completely new shapes, structures and functionalities.

**Revolution in contemporary design:**
- **Complex organic forms**: Geometries impossible with traditional methods
- **Parametric structures**: Generative design and creative algorithms
- **Mass customization**: Unique products on industrial scale
- **Functional integration**: Multiple functions in a single object
- **Sustainability**: On-demand production and waste reduction

**Transformed creative sectors:**
- **Furniture design**: Lamps, chairs, tables with organic geometries
- **Jewelry**: Unique pieces with intricate details impossible by hand
- **Architecture**: Models, structural components, decorative elements
- **Fashion**: Accessories, footwear, innovative flexible fabrics
- **Art**: Sculptures, installations, interactive works

**Advanced creative techniques:**
1. **Generative design**: Algorithms that create optimized forms
2. **Multi-material printing**: Combination of different properties
3. **Lattice structures**: Lightweight but resistant geometries
4. **Textured surfaces**: Unique tactile and visual effects
5. **Integrated mechanisms**: Mobile parts printed assembled

**Materials for creative applications:**
- **Colored PLA**: Wide range of colors and special finishes
- **Transparent PETG**: Crystalline effects and light plays
- **Composite materials**: Carbon fiber, wood, metal
- **Flexible materials**: TPU for soft and flexible textures
- **Specialized resins**: Ultra-smooth surfaces and finest details

**Success case studies:**
- Parametric lamps that optimize light diffusion
- Ergonomic chairs personalized on individual biomechanics
- Jewelry with fractal geometries and impossible structures
- Architectural elements that integrate multiple functions
- Sports footwear with soles optimized for each athlete

3D printing democratizes innovation in design, allowing creatives and companies to experiment rapidly and at low costs, transforming bold ideas into real products.`,
    details: {
      material: 'PLA colorato, PETG, materiali compositi, TPU, resine speciali',
      printTime: '2-72 ore a seconda della complessità artistica',
      quality: 'Strato 0.1-0.4mm ottimizzato per estetica',
      size: 'Da miniature dettagliate a installazioni artistiche'
    },
    challenges: [
      'Bilanciamento tra creatività e vincoli tecnici di stampa',
      'Gestione di geometrie complesse e supporti necessari',
      'Ottimizzazione per diversi materiali e finiture',
      'Integrazione di funzionalità in design esteticamente piacevoli'
    ],
    benefits: [
      'Libertà creativa totale senza vincoli di produzione tradizionale',
      'Prototipazione rapida di concept creativi innovativi',
      'Personalizzazione estrema per ogni cliente specifico',
      'Possibilità di creare prodotti artistici unici e irripetibili'
    ]
  }
  ,
  "come-funziona-stampa-3d": {
    title: "Come funziona realmente la stampa 3D: guida completa",
    titleEn: "How 3D Printing Really Works: A Complete Guide",
    content: `La stampa 3D è diventata un ponte tra il mondo dei progetti digitali e quello dei prodotti fisici. In pratica, trasforma un modello CAD in un oggetto reale “a strati”, usando materiali diversi a seconda della tecnologia scelta. Anche se oggi sembra semplice, dietro c’è un processo preciso: preparazione del modello, “slicing”, impostazioni di stampa, produzione, finitura e controllo qualità.

In questa guida vediamo come funziona davvero la stampa 3D, quali sono le fasi principali e cosa cambia tra tecnologie come FDM, SLA e (in ambito professionale) SLS, MJF o SLM.

## 1) Dall’idea al modello digitale (CAD)
Tutto parte da un file digitale. I laboratori e le aziende lavorano tipicamente con:
- Modelli 3D creati in CAD (solido o mesh)
- File esportati da software di modellazione o scansione 3D (STL/OBJ/3MF)
- Modelli modificati e ripuliti (mesh “water-tight”, dimensioni corrette, spessori minimi)

Qui si decide già gran parte del risultato finale. Un modello ben progettato è più facile da stampare, costa meno in lavorazione e riduce gli errori durante la stampa.

## 2) Preparazione del modello per la stampa
Prima di stampare, il file deve essere “stampabile”. In questa fase si controllano:
- Orientamento: come posizionare il pezzo sul piano di stampa per migliorare qualità e resistenza
- Supporti: se servono, dove inserirli e come renderli facili da rimuovere
- Scala e tolleranze: dimensioni reali, tolleranze per accoppiamenti e fori
- Spessori minimi e pareti: per evitare parti fragili o deformazioni

Un errore comune è voler stampare un progetto “perfetto” in CAD senza considerare come si comporta fisicamente un materiale durante la deposizione o la solidificazione.

## 3) Lo “slicing”: la traduzione in istruzioni di stampa
Il passo fondamentale è lo slicing. In un software (come Cura, PrusaSlicer, o tool specifici per altre tecnologie) il modello viene convertito in strati con:
- Spessore dello strato (layer height)
- Velocità di stampa
- Temperatura e parametri del materiale
- Compensazioni (flusso, retrazione, ecc.)
- Strategie di riempimento (infill) e perimetri

Lo slicing decide anche il compromesso tra:
- qualità estetica e dettagli
- resistenza meccanica
- tempo di produzione e consumo materiale

Per la prototipazione rapida spesso si ottimizza il tempo, mentre per parti funzionali e produzione in serie si privilegia ripetibilità e prestazioni.

## 4) Stampa: come nasce l’oggetto strato dopo strato
La stampa cambia in base alla tecnologia.

### FDM (Filamento)
Nell’FDM un filamento termoplastico viene fuso e depositato tramite un estrusore. L’oggetto cresce strato dopo strato seguendo le traiettorie definite dallo slicer. La resistenza e la qualità dipendono molto da:
- orientamento delle fibre/strati
- adesione tra layer
- temperatura e raffreddamento

### SLA (Resina)
Nella stampa SLA un laser polimerizza una resina liquida, solidificando il pezzo con precisione elevata. Il vantaggio principale è la finitura: dettagli molto fini e superfici più lisce rispetto a molte stampe FDM.

### SLS / MJF / SLM (ambito professionale)
Per applicazioni industriali possono entrare in gioco polveri e processi di sinterizzazione o fusione laser, utili quando servono:
- parti complesse
- proprietà meccaniche superiori
- ottima libertà geometrica

Anche qui i parametri di processo sono determinanti per ottenere risultati coerenti.

## 5) Post-processing: finire il pezzo (non solo “staccarlo”)
La stampa non è la fine. Quasi sempre serve un passaggio successivo:

### Per FDM
- Rimozione supporti (se presenti)
- Eventuali lavorazioni di finitura (levigatura, preparazione verniciatura)
- Controllo dimensionale e rifinitura di tolleranze

### Per SLA
- Lavaggio della resina in eccesso
- Asciugatura e rimozione supporti
- Cura aggiuntiva (se richiesta dal materiale) per massimizzare resistenza e stabilità

### Per tecnologie a polvere (SLS/MJF/SLM)
- Rimozione della polvere non sinterizzata
- Eventuale depowder e rifinitura
- Trattamenti termici o finitura superficiale quando necessari

In molti casi, proprio il post-processing è ciò che trasforma un prototipo “visibile” in una parte davvero pronta all’uso.

## 6) Controllo qualità e validazione
Un processo professionale include verifiche:
- Controllo dimensionale (calibri e misure sulle quote critiche)
- Verifica della qualità superficiale
- Controllo delle tolleranze per accoppiamenti o componenti funzionali

Per lavori industriali e parti con requisiti specifici, la qualità non è un dettaglio: è parte del servizio.

## 7) Tempi e costi: cosa influenza davvero
Il tempo e il costo non dipendono solo dalla dimensione. Le variabili principali sono:
- complessità geometrica
- numero di pezzi e dimensione del lotto
- tecnologia richiesta (FDM vs SLA vs processi a polvere)
- necessità di supporti e lavorazioni post stampa
- finitura finale (verniciatura, assemblaggio, ecc.)

Un vantaggio della prototipazione è poter iterare rapidamente. Spesso il vero risparmio arriva perché si riducono errori e modifiche “tardi” in sviluppo prodotto.

## 8) Esempi pratici: cosa conviene stampare con quale tecnologia
In generale, come regola:
- FDM: ottimo per prototipi funzionali, componenti robusti e iterazioni rapide
- SLA: ideale quando servono dettagli e superfici lisce
- SLS/MJF/SLM: utili per parti complesse e requisiti meccanici avanzati

La scelta giusta è quella che bilancia prestazioni, estetica, tempo e costi. Per questo, spesso il valore aggiunto sta nella consulenza: capire cosa stampare e come progettare il pezzo per ottenere risultati concreti.

## 9) Il ruolo del servizio: dalla consulenza alla consegna
Quando si lavora con un laboratorio come 3DMAKES, il flusso tipico è:
- Analisi del progetto e fattibilità
- Suggerimento tecnologia e materiali
- Preparazione (slicing/supporti) e gestione delle tolleranze
- Produzione e post-processing
- Consegna + eventuali ottimizzazioni su feedback

Se ti serve un prototipo pronto per test o una parte per un uso specifico, la stampa 3D non è solo “macchina”: è un processo guidato dall’esperienza.

Alla fine, la stampa 3D funziona bene quando ogni fase è coerente: modello, parametri, materiale, finitura e controllo. Con queste basi, puoi trasformare un’idea in un risultato fisico davvero utilizzabile. `,
    contentEn: `3D printing turns digital designs into real objects by building them layer by layer. While the idea is simple, the process involves careful preparation: CAD/model checks, slicing into printable instructions, production with the right technology, post-processing and quality control. This guide explains the full workflow and what changes between FDM, SLA and advanced industrial processes like SLS/MJF/SLM.

The key takeaway: the best results come from a consistent chain of decisions—model, orientation, slicing parameters, materials, finishing and verification—supported by real-world expertise.`,
    details: {
      material: "FDM: PLA/ABS/PETG/TPU | SLA: resine tecniche | Processi industriali: a seconda del requisito",
      printTime: "2-72 ore (variabile in base a dimensioni, tecnologia e complessità)",
      quality: "Stabilità e precisione definite da tecnologia + orientamento + parametri di stampa",
      size: "Da piccoli prototipi a componenti su richiesta"
    },
    challenges: [
      "Gestire correttamente supporti e orientamento per ridurre difetti e tempi",
      "Bilanciare velocità di stampa e qualità superficiale",
      "Creare tolleranze realistiche tra CAD e pezzo finito",
      "Scegliere materiali coerenti con l’uso finale (meccanico, estetico, chimico)"
    ],
    benefits: [
      "Riduzione dei tempi di sviluppo prodotto grazie a iterazioni rapide",
      "Possibilità di realizzare geometrie complesse con meno vincoli",
      "Prototipi funzionali e test prima della produzione tradizionale",
      "Personalizzazione senza costi proibitivi di attrezzaggio"
    ]
  },
  "materiali-stampa-3d": {
    title: "I migliori materiali per la stampa 3D nel 2026",
    titleEn: "Best 3D Printing Materials in 2026",
    content: `Scegliere il materiale giusto è una delle decisioni più importanti nella stampa 3D. Anche con una buona stampante e un modello perfetto, un materiale inadatto può portare a pezzi fragili, deformazioni, scarsa resistenza all’uso o finiture non all’altezza.

In questa guida analizziamo i materiali più comuni e il modo pratico di scegliere in base all’applicazione: meccanica, calore, resistenza chimica, flessibilità, estetica o requisiti specifici.

## 1) Materiali FDM (filamento): PLA, PETG, ABS, TPU e nylon
I materiali FDM sono tra i più accessibili e versatili. In generale, cambiano per:
- resistenza meccanica
- resistenza al calore
- comportamento in ambienti esterni
- flessibilità e resilienza

### PLA
Il PLA è spesso la scelta “entry level”. È facile da stampare, ha buona rigidità e finitura discreta. È ideale quando l’obiettivo è:
- prototipazione rapida
- modelli estetici
- componenti non stressati termicamente

Limiti tipici: resistenza al calore e non è la scelta migliore per uso continuo in ambienti caldi o con esposizione prolungata.

### PETG
Il PETG rappresenta spesso un buon equilibrio tra facilità di stampa e prestazioni. È più tenace del PLA e tende a offrire maggiore resistenza e affidabilità.
È indicato per:
- parti funzionali di uso pratico
- componenti che devono resistere meglio a urti e flessioni
- prototipi che richiedono più robustezza

### ABS (e famiglie simili)
L’ABS è noto per una migliore resistenza a temperature superiori rispetto al PLA, ma richiede attenzioni di stampa (ambiente controllato, stabilità termica, eventuale camera).
È adatto quando servono:
- parti più resistenti
- componenti con migliori prestazioni termiche rispetto a PLA

### TPU (flessibile)
Il TPU è il materiale per la flessibilità. È elastico e assorbe meglio urti e vibrazioni rispetto ai materiali rigidi.
Tipicamente conviene per:
- parti morbide o con funzione ammortizzante
- guarnizioni, componenti flessibili e supporti
- soluzioni che richiedono elasticità

### Nylon (e materiali tecnici)
I nylon (spesso rafforzati in ambito professionale) sono scelti quando servono:
- buona resistenza meccanica
- tenacità
- prestazioni migliori su parti soggette a usura

## 2) Materiali SLA (resine): dettaglio e finitura
La tecnologia SLA offre un vantaggio enorme: precisione e superfici più lisce, spesso perfette per:
- modelli estetici di alta qualità
- componenti con dettagli fini
- prototipi che richiedono precisione dimensionale visibile

Le resine possono variare (in base al fornitore) per caratteristiche come:
- resistenza meccanica
- rigidità o “toughness”
- trasparenza (dove disponibile)
- resine tecniche specifiche per applicazioni particolari

## 3) Materiali per applicazioni industriali (a polvere)
Per requisiti avanzati, possono essere usati processi e materiali a polvere, adatti a:
- parti complesse
- proprietà meccaniche elevate
- iterazioni dove la geometria è “difficile” per altre tecnologie

In questi casi la scelta materiale diventa parte del progetto. Non è solo “che materiale metto in stampa”, ma “quale proprietà serve davvero” (resistenza, durezza, comportamento a fatica, ecc.).

## 4) Come scegliere il materiale in modo pratico (checklist)
Per scegliere bene, poni queste domande:
- Qual è l’uso finale del pezzo? (estetico, funzionale, meccanico, esterno, interno)
- Quali sollecitazioni subisce? (urti, flessione, vibrazioni)
- Serve resistenza al calore? A quale temperatura?
- Serve flessibilità? (ammortizzazione, movimento, assorbimento)
- Serve resistenza chimica? (contatto con solventi, detergenti, oli)
- Quali tolleranze sono critiche?
- È necessario un buon livello di finitura superficiale?

Rispondere a queste domande riduce gli errori e velocizza lo sviluppo.

## 5) Consigli “rapidi” per applicazioni comuni
Ecco alcune linee guida spesso utili:
- Supporti e componenti funzionali: PETG o nylon (a seconda di resistenza e uso)
- Parti che devono essere flessibili: TPU
- Prototipi estetici o dettagli: SLA
- Parti rigide e prototipi veloci: PLA (se non ci sono vincoli termici)
- Componenti con maggiori prestazioni termiche: ABS/ASA e materiali tecnici

## 6) Materiali e processo: come impatta sulla qualità
Il materiale non influenza solo “la resistenza”. Influenza anche:
- adesione tra layer
- rischio di deformazione
- necessità di supporti
- finitura superficiale
- necessità di post-processing

Per questo, una consulenza tecnica è fondamentale: l’obiettivo non è scegliere “il materiale più famoso”, ma quello più adatto al tuo pezzo.

## 7) Il nostro approccio: materiali scelti per obiettivi reali
In 3DMAKES lavoriamo per obiettivi. Prima capiamo:
- per cosa serve il pezzo
- che tipo di test o utilizzo deve superare
- tempi desiderati e vincoli di consegna

Poi suggeriamo la tecnologia e il materiale coerenti, e prepariamo il progetto per ottenere risultati ripetibili.

La stampa 3D è un ecosistema: tecnologia, slicing, materiale e finitura sono interdipendenti. Quando scegli bene il materiale, non “migliori la qualità”: ottieni prestazioni reali nel mondo reale.`,
    contentEn: `Choosing the right material is critical in 3D printing. This guide explains common FDM filaments (PLA, PETG, ABS, TPU, nylon), SLA resins and how to pick based on the final application: mechanical load, temperature, flexibility, surface finish and constraints. The best material is the one aligned with your real-world requirements.`,
    details: {
      material: "PLA, PETG, ABS, TPU, nylon + resine SLA (in base al progetto)",
      printTime: "Variabile (2-72 ore in base a dimensioni, tecnologia e complessità)",
      quality: "Precisione e finitura determinate da tecnologia + parametri + post-processing",
      size: "Da piccoli accessori a componenti su richiesta"
    },
    challenges: [
      "Bilanciare facilità di stampa con prestazioni reali",
      "Gestire deformazioni e supporti in base al materiale scelto",
      "Adattare tolleranze e aspettative tra CAD e pezzo finito",
      "Assicurare compatibilità tra finitura richiesta e tecnologia/materia"
    ],
    benefits: [
      "Pezzi più affidabili per test e utilizzo funzionale",
      "Riduzione di scarti e rilavorazioni",
      "Migliore rapporto qualità/tempo per prototipazione rapida",
      "Maggiore controllo sul risultato finale grazie a una scelta consapevole"
    ]
  },
  "stampanti-3d-confronto": {
    title: "Le migliori stampanti 3D per uso professionale",
    titleEn: "Best 3D Printers for Professional Use",
    content: `Non esiste una “migliore stampante 3D” in assoluto. Per uso professionale, la scelta dipende da ciò che vuoi ottenere: precisione, resistenza meccanica, velocità, finitura superficiale, materiali disponibili e tipo di produzione (prototipazione singola o piccoli lotti).

In questa guida facciamo un confronto ragionato tra le tecnologie più importanti e ti proponiamo un metodo semplice per scegliere la piattaforma giusta.

## 1) Tecnologie principali: FDM, SLA e processi a polvere
### FDM (Filamento)
È una delle tecnologie più diffuse. Deposita materiale fuso tramite estrusore e costruisce il pezzo a strati. In ambito professionale è utile per:
- prototipi funzionali
- componenti robusti
- iterazioni rapide

La qualità dipende da parametri come orientamento, layer height e raffreddamento.

### SLA (Resina)
È preferita quando serve dettaglio e finitura. Offre in genere:
- alta precisione
- superfici più lisce
- ottima resa di dettagli piccoli

In prototipazione estetica e in applicazioni dove la forma conta molto, spesso conviene rispetto a molte stampe FDM.

### SLS / MJF / SLM (processi a polvere)
Quando entrano in gioco requisiti più avanzati, i processi a polvere permettono:
- geometrie complesse
- parti con prestazioni meccaniche elevate
- produzione di componenti più “engineering” rispetto a molte tecnologie consumer

La scelta tra SLS/MJF/SLM è legata al tipo di proprietà richieste (durezza, resistenza, comportamento e destinazione d’uso).

## 2) Cosa conta davvero per chi usa la stampa 3D in modo professionale
Per decidere, valuta questi criteri:
- Precisione dimensionale e ripetibilità
- Resistenza del materiale a carichi, urti e fatica
- Resistenza termica e chimica
- Finitura superficiale (serve verniciatura o è già utilizzabile?)
- Tempi di produzione
- Post-processing richiesto (lavaggio/cura/supporti/pulizia polvere)
- Costi totali (non solo macchina): consumi, scarti, tempo di preparazione e finitura

## 3) Confronto pratico: quale scegliere in base al caso
### Se ti serve un prototipo funzionale veloce
Spesso conviene una soluzione FDM o un flusso che mantenga iterazioni rapide. La priorità è stampare, testare, modificare.

### Se ti serve un dettaglio estetico o componenti “visibili”
SLA tende a offrire un salto qualitativo nella resa. Utile per modelli che devono essere presentati o montati con componenti finiti.

### Se ti serve una parte con requisiti tecnici avanzati
Valuta i processi a polvere. In questo scenario la scelta non è solo “estetica”, ma proprietà meccaniche e affidabilità in uso.

## 4) Materiali e prestazioni: perché cambiano tutto
La tecnologia definisce cosa “puoi fare”, ma il materiale definisce cosa “ottieni davvero”.
Per esempio:
- PETG e nylon sono spesso scelti quando serve robustezza e maggiore affidabilità in ambienti reali
- TPU è perfetto per elementi flessibili
- le resine tecniche SLA possono essere preferite quando serve precisione e finitura

Per applicazioni professionali la scelta materiale deve essere coerente con test e condizioni di esercizio.

## 5) Tempi, costi e scalabilità
Per professionisti contano soprattutto:
- lead time (tempo fino al pezzo)
- capacità di produrre più parti o lotti piccoli
- facilità di ripetizione della qualità tra una stampa e l’altra

Un laboratorio o un servizio con processo strutturato riesce spesso ad accorciare tempi e a ridurre il rischio di errori.

## 6) Il criterio migliore: partire dagli obiettivi (non dalla macchina)
Un metodo efficace:
1. Definisci l’uso finale (estetico, funzionale, tecnico)
2. Definisci carichi e vincoli (meccanici/termici/chimici)
3. Definisci tolleranze e requisiti di finitura
4. Scegli la tecnologia che risponde meglio, poi il materiale coerente
5. Pianifica post-processing e controllo qualità

Così eviti di acquistare o scegliere una tecnologia “sbagliata” solo perché è popolare.

## 7) Come lavoriamo in 3DMAKES
Quando un cliente porta un progetto, il nostro lavoro non è solo “stampare”. È:
- valutare fattibilità e orientamento
- proporre tecnologia e materiale adeguati
- impostare slicing e supporti per qualità e affidabilità
- gestire post-processing e controlli
- consegnare un pezzo che superi i test (e non solo un prototipo “quasi ok”)

## 8) Conclusione
Se vuoi davvero “le migliori stampanti 3D per uso professionale”, la risposta corretta è: quelle che supportano il tuo flusso di produzione e i requisiti del tuo prodotto. FDM, SLA e i processi a polvere sono strumenti diversi. La scelta migliore è quella guidata da obiettivi concreti, non da mode o impressioni.

Se mi racconti il pezzo che vuoi ottenere (dimensioni, funzione, materiali e tempistiche), possiamo indicarti la tecnologia più adatta e aiutarti a progettare per il risultato reale.`,
    contentEn: `There is no single “best” 3D printer for professionals. The right choice depends on the end goal: precision, mechanical performance, speed, surface finish, materials and post-processing. This guide compares FDM, SLA and powder-based processes (SLS/MJF/SLM) and provides a practical decision method based on requirements.`,
    details: {
      material: "Dipende dal progetto: PLA/PETG/ABS/TPU (FDM), resine tecniche (SLA), a polvere (SLS/MJF/SLM)",
      printTime: "Variabile in base a tecnologia, dimensioni e finitura richiesta",
      quality: "Ripetibilità e precisione definite da tecnologia + parametri + controllo",
      size: "Dal prototipo alle parti tecniche su richiesta"
    },
    challenges: [
      "Scegliere correttamente tecnologia e materiale senza compromessi inutili",
      "Gestire post-processing e finitura per raggiungere il livello richiesto",
      "Evitare errori di progettazione che generano scarti o rilavorazioni",
      "Garantire consistenza tra stampe e versioni"
    ],
    benefits: [
      "Lead time più prevedibili grazie a un processo strutturato",
      "Migliore rapporto qualità/tempo per prototipazione e produzione",
      "Prestazioni reali grazie a materiale e processo coerenti",
      "Riduzione dei rischi durante lo sviluppo prodotto"
    ]
  }
  ,
  "drone-fpv-aether4-stampa-3d": {
    title: "Stampa 3D e assemblaggio di un drone FPV: il progetto Aether4",
    titleEn: "3D Printing and assembly of an FPV drone: the Aether4 project",
    content: `> **Nota redazionale**: questo articolo è una prima stesura. Verrà aggiornato con i dati definitivi, le foto del nostro Aether4 montato in officina, i parametri di stampa verificati e il video dei primi voli di test.

Nel laboratorio 3DMAKES a Figino (Lugano) abbiamo voluto portare la stampa 3D in uno dei contesti in cui viene naturalmente messa alla prova: il mondo del **drone FPV**. Il risultato è l'**Aether4**, un quadricottero da 4 pollici con **telaio interamente stampato in 3D** nei materiali tecnici che utilizziamo ogni giorno per applicazioni industriali.

Un drone FPV (First Person View) è una piattaforma in cui ogni grammo, ogni millimetro e ogni vibrazione conta: se il telaio è troppo morbido, la struttura flette e il pilota perde controllo; se è troppo rigido, gli impatti si propagano all'elettronica; se è troppo pesante, l'autonomia crolla. È il banco di prova perfetto per dimostrare fino a dove possiamo spingere la stampa 3D con materiali compositi e design ottimizzato.

## Perché stampare in 3D il telaio di un drone

La scelta della stampa 3D per il telaio Aether4 nasce da una valutazione concreta, non da una moda tecnologica:

- **Personalizzazione completa**: ogni pilota ha esigenze diverse — angolo della camera, posizione del VTX, spazio per la batteria. Un telaio stampato si adatta alla build specifica invece di costringere la build al telaio.
- **Riparabilità in giornata**: un crash che rompe un braccio si risolve ristampando in poche ore il pezzo danneggiato al costo di pochi franchi, invece di ordinare un ricambio.
- **Iterazione rapida del design**: possiamo modificare forma, posizionamento dei fori, aggiungere rinforzi in zone che abbiamo visto cedere. In una settimana di sviluppo abbiamo testato più versioni di quanto un ciclo di produzione CNC renderebbe possibile.
- **Leggerezza e rigidità su misura**: scegliendo materiali caricati fibra e pattern di infill mirati, otteniamo un rapporto rigidezza/peso competitivo con i telai commerciali in carbonio laminato.

## I materiali tecnici dell'Aether4

Per un telaio FPV la selezione dei materiali è la decisione più importante. Sull'Aether4 lavoriamo con tre polimeri diversi, ciascuno per la funzione a cui è più adatto:

### PA-CF (Nylon + fibra di carbonio)
È il materiale del corpo principale e delle braccia. Il nylon caricato con fibre corte di carbonio offre un rapporto **rigidezza/peso** tra i migliori disponibili per la stampa FDM e una buona **resistenza all'impatto** — critica considerando che in un uso tipico gli atterraggi bruschi e i contatti con ostacoli sono la norma.

### TPU 95A
Usato per gli elementi **ammortizzanti**: supporti del flight controller, bumper di protezione della batteria, anelli di tenuta per le antenne. Il TPU assorbe le vibrazioni ad alta frequenza generate dai motori, proteggendo il giroscopio e migliorando la qualità del video registrato.

### PETG
Per la **canopy** (la cupola che copre l'elettronica) e per eventuali accessori estetici. È il materiale più economico, facile da verniciare e personalizzare, meno critico dal punto di vista strutturale.

## Parametri di stampa studiati per ogni parte

L'orientamento di stampa, l'altezza layer e la percentuale di riempimento non sono dettagli tecnici: sulla resistenza finale del pezzo cambiano di molto. Per l'Aether4 abbiamo definito uno standard:

- **Braccia del telaio** (PA-CF): altezza layer 0,15 mm, infill 100%, perimetri 4, orientamento lungo l'asse del braccio per massimizzare la resistenza a flessione.
- **Piastra centrale e top plate** (PA-CF): altezza layer 0,2 mm, infill 60% con pattern gyroid per rigidezza torsionale.
- **Gommini e bumper** (TPU 95A): infill 30%, velocità ridotta, ventilazione controllata.
- **Canopy** (PETG): altezza layer 0,2 mm, infill 20%, finitura verniciabile.

Le parti in PA-CF richiedono un **ugello in acciaio temprato**: il filamento carbonato consuma rapidamente un ugello in ottone standard. Lavoriamo sempre con una stampante dedicata ai materiali caricati fibra per evitare contaminazioni.

## L'elettronica di bordo

L'Aether4 nella configurazione base integra una selezione di componenti consolidati nel mondo FPV competitivo:

- **Flight controller** F722 con Betaflight aggiornato
- **ESC 4-in-1** da 45A a switch DShot600
- **Motori** brushless 2306 a 1960 KV
- **Eliche bipala** da 4 pollici
- **Ricevitore** ExpressLRS 2.4 GHz per latenza minima
- **VTX** DJI O3 Air Unit (versione digitale) oppure Runcam Link / analogico 5.8 GHz (versione più economica)
- **Telecamera** FPV integrata con angolo regolabile tra 15° e 45°
- **Batteria** 4S LiPo 1300-1500 mAh

## Il processo di assemblaggio passo passo

Un drone FPV non si assembla: si **costruisce**. Ogni passaggio incide sul comportamento in volo. Il nostro workflow tipico:

1. Controllo dimensionale di tutte le parti stampate e sbavatura dei fori M3.
2. Montaggio motori sulle braccia con viti appropriate (attenzione alla lunghezza: viti troppo lunghe toccano il rotore) e threadlocker blu sui filetti.
3. Saldatura dei fili motore agli ESC, curando la lunghezza minima per ridurre il peso.
4. Installazione della stack FC+ESC con gommini in silicone per isolare meccanicamente dall'elettronica.
5. Collegamento di VTX, ricevitore e telecamera; fissaggio dei cavi con zip tie.
6. Configurazione firmware: Betaflight (assi, failsafe, rates), binding ExpressLRS, taratura PID di base.
7. **Bench test a motori in aria** per verificare direzione di rotazione e risposta ai comandi.
8. **Primo volo** in zona aperta e controllata, con batteria di capacità ridotta per limitare i rischi.

## Cosa abbiamo imparato durante il progetto

Durante lo sviluppo dell'Aether4 abbiamo raccolto indicazioni che ora stiamo applicando anche a telai per altre classi di drone:

- Le braccia stampate in PA-CF mostrano **comportamento diverso** da quelle in carbonio laminato: più elastiche, meno fragili, assorbono meglio gli urti ma flettono di più sotto carico continuo.
- L'**orientamento di stampa** delle braccia è il singolo parametro più importante: un errore qui può dimezzare la resistenza a flessione.
- Il **TPU 95A** non è solo un accessorio: montare l'elettronica su isolatori stampati ha ridotto in modo misurabile il noise sul giroscopio (confronto log Betaflight).

## Prossimi passi del progetto Aether4

Questo articolo verrà aggiornato nelle prossime settimane con:

- **Video del primo volo** dell'Aether4 nella configurazione definitiva
- **Dati di telemetria** reali (noise, vibrazioni, corrente assorbita)
- **File STL del telaio** messi a disposizione della community dei piloti FPV
- **Variante 5"** per chi preferisce un drone più rapido e performante
- **Guida di build** passo passo con foto di ciascun passaggio

## Servizio stampa 3D per piloti FPV in Ticino

Se sei un pilota FPV in Canton Ticino, Grigioni o Lombardia e vuoi un telaio su misura, un ricambio stampato con materiali tecnici o una versione custom di un telaio esistente, possiamo aiutarti: stampiamo su ordinazione in PA-CF, TPU e PETG nella nostra sede di Figino (Lugano). Ritiro in sede, spedizione in tutta Italia e Svizzera.`,
    contentEn: `> **Editorial note**: this is an early draft. It will be updated with the final data, pictures of the assembled Aether4, verified printing parameters and the video of the first test flights.

In the 3DMAKES lab in Figino (Lugano) we wanted to put 3D printing to the test in one of the most demanding contexts: the **FPV drone** world. The result is the **Aether4**, a 4-inch quadcopter with a frame **entirely 3D-printed** using the same technical materials we use daily for industrial applications.

An FPV (First Person View) drone is a platform where every gram, every millimeter and every vibration matters. It's the perfect benchmark to show how far we can push FDM 3D printing with composite materials and optimized design.

This article will be expanded with build pictures, measured flight data and the video of the first flights.`,
    details: {
      telaio: "Aether4 4\"",
      materiale: "PA-CF / TPU / PETG",
      peso: "TBD (da confermare)",
      tempoStampa: "8-10 h",
      tipoStampa: "FDM"
    },
    challenges: [
      "Bilanciare rigidezza e resistenza all'impatto nelle braccia",
      "Ridurre il noise del giroscopio tramite isolatori stampati",
      "Ottimizzare l'orientamento di stampa per la massima resistenza a flessione",
      "Scegliere parametri di stampa compatibili con PA-CF senza saturare l'ugello"
    ],
    benefits: [
      "Telaio personalizzabile sulla configurazione elettronica del pilota",
      "Ricambi stampabili in giornata dopo un crash",
      "Costo inferiore rispetto a telai commerciali in carbonio laminato",
      "Iterazione rapida del design per migliorare le prestazioni"
    ]
  }
  ,
  "riciclaggio-filamento-fdm": {
    title: "Riciclaggio dei materiali di stampa 3D FDM: zero scarti con 3DMAKES",
    titleEn: "Recycling FDM 3D printing materials: zero waste at 3DMAKES",
    content: `La stampa 3D FDM, per sua natura, genera **scarti**: supporti di stampa, skirt, brim, pezzi falliti, prototipi scartati dopo la validazione, bobine quasi finite che nessuno vuole più usare. In un laboratorio di produzione continuativa questi scarti possono rappresentare facilmente il **10-20% del materiale acquistato ogni anno**.

Per un settore che si presenta come sinonimo di "produzione efficiente" e a basso impatto, questo è un paradosso difficile da ignorare. In 3DMAKES ci lavoriamo da tempo e a un certo punto abbiamo smesso di considerarlo un problema "esterno". Abbiamo integrato nel nostro processo una **tecnologia di riciclaggio interno** che ci permette di recuperare il **100% del materiale** che entra in officina. Niente smaltimento, niente pattumiera: ogni stampa fallita, ogni supporto rimosso e ogni bobina terminata torna a essere **materia prima nuova**.

## Quali materiali riusciamo a riciclare

La nostra tecnologia di triturazione ed estrusione è compatibile con i **principali polimeri termoplastici** usati nella stampa 3D FDM:

- **PLA** (acido polilattico) — il materiale più diffuso, derivato da fonti vegetali (mais, canna da zucchero). Si ricicla molto bene.
- **ABS** (acrilonitrile-butadiene-stirene) — resistente agli urti e alle alte temperature, utilizzato in componenti tecnici.
- **PETG** (polietilene tereftalato glicole) — combinazione di lavorabilità e resistenza chimica.
- **ASA** (acrilonitrile-stirene-acrilato) — resistente agli UV e agli agenti atmosferici, ideale per applicazioni esterne.
- **PA** (poliammide/Nylon non caricato) — tenace, resistente all'abrasione, con buona tenacità meccanica.

### Cosa NON riusciamo a riciclare

Per trasparenza, non tutti i filamenti possono essere reinseriti nel ciclo di riciclaggio:

- **Materiali rinforzati con fibra continua** (PA-CF, PETG-CF, PA-GF) — la presenza di fibre di carbonio o vetro compromette l'omogeneità del riestruso e rischia di abradere le macchine.
- **Materiali caricati con additivi abrasivi** (metalli, ceramica, legno) — stessi problemi dei fibrati.
- **Resine e materiali SLA** — il riciclaggio della resina richiede processi chimici diversi, non affrontati da questa tecnologia.
- **Supporti solubili (PVA, HIPS)** — ciclo di riciclaggio dedicato, non ancora integrato.

Per questi materiali mantiamo una tracciabilità separata e valutiamo caso per caso lo smaltimento responsabile o il recupero tramite partner specializzati.

## Come funziona il processo di riciclaggio interno

Il ciclo di riciclaggio in 3DMAKES segue cinque fasi principali:

### 1. Raccolta selezionata
Gli scarti vengono separati **per tipologia di materiale e per colore**. Una stampante PETG verde non può finire nello stesso flusso di una PLA blu: il filamento riciclato risulterebbe un grigio-marrone indistinto. Nel nostro laboratorio abbiamo contenitori dedicati per ciascun materiale e ciascuna famiglia cromatica.

### 2. Triturazione
Un **trituratore industriale** a coltelli riduce i pezzi in frammenti di dimensioni controllate (tipicamente 3-5 mm). Questa fase è critica: la granulometria determina il comportamento del materiale nelle fasi successive.

### 3. Essiccazione
I frammenti vengono **asciugati in forno** a temperatura controllata. Molti termoplastici — in particolare PETG, Nylon e ASA — assorbono umidità dall'aria. Se riestrusi da bagnati, il filamento risulterebbe poroso, fragile e ingovernabile durante la stampa. Questa fase richiede da 4 a 12 ore a seconda del materiale.

### 4. Estrusione del nuovo filamento
Un **estrusore specializzato** rifonde il materiale a temperatura controllata e produce nuovo filamento da **1,75 mm**, calibrato entro tolleranze compatibili con le normali stampanti FDM. Un sistema di controllo ottico in tempo reale misura il diametro ad alta frequenza, scartando automaticamente tratti fuori specifica.

### 5. Avvolgimento e controllo qualità
Il filamento viene **avvolto in bobine** standard, etichettato con lotto, materiale, colore e percentuale di riciclato, e stoccato per l'uso interno o per la consegna al cliente finale.

## Quando scegliere il filamento riciclato

Il filamento prodotto dal nostro ciclo di riciclaggio mantiene **buone proprietà meccaniche ed estetiche** per applicazioni non strutturali. Lo consigliamo quando il progetto rientra in una di queste categorie:

- **Prototipi dimensionali e di validazione** — per verificare forma, ergonomia, incastri.
- **Oggetti estetici** — modellini, gadget, portaoggetti, complementi d'arredo.
- **Prototipi di design industriale** per presentazioni, fiere e validazione concept.
- **Attrezzature di laboratorio non critiche** — supporti, organizer, fixture leggere.
- **Progetti didattici** — scuole, workshop, fablab, corsi di stampa 3D.
- **Stampe di grande volume** dove il costo del materiale incide molto sul totale.

### Quando invece consigliamo materiale vergine

Non tutte le applicazioni sono adatte al riciclato. Per queste raccomandiamo materiale vergine certificato:

- **Parti strutturali** soggette a carichi meccanici continui o fatica.
- **Componenti critici** che non possono fallire (medicali, aerospace, sicurezza).
- **Pezzi esposti a cicli termici intensi** o a ambienti chimicamente aggressivi.
- **Applicazioni certificate** (alimentare, farmaceutico, giocattoli) — dove serve tracciabilità del lotto vergine.
- **Parti con tolleranze dimensionali molto strette** dove la variabilità del riciclato può essere un limite.

Essere onesti su questa distinzione è fondamentale: il riciclato è una **soluzione concreta per la maggior parte dei progetti**, non una scorciatoia universale.

## L'impegno 3DMAKES: **100% del materiale utilizzato**

Questa frase non è marketing. È il principio operativo del nostro laboratorio.

Ogni progetto che entra in produzione viene quotato con **tre opzioni trasparenti** che il cliente può scegliere in fase di preventivo:

- **Vergine 100%** — per applicazioni tecniche, certificate o critiche. Materiale tracciato per lotto.
- **Mix vergine + riciclato** — soluzione bilanciata che mantiene buone prestazioni riducendo costo e impatto ambientale.
- **Riciclato 100%** — per prototipi e oggetti estetici, a frazione del costo del materiale vergine.

Questo approccio si inserisce nella filosofia che ci guida da sempre: fare stampa 3D in modo **onesto** e **sostenibile**, senza accumulare plastica inutile, senza ignorare l'impatto del nostro lavoro sull'ambiente e senza vendere come "green" ciò che green non è.

## Servizio di ritiro scarti per clienti ricorrenti

Per aziende, studi di design e fablab che stampano regolarmente, offriamo un **servizio di ritiro scarti**: raccogliamo periodicamente il materiale di scarto dal cliente, lo processiamo nel nostro ciclo di riciclaggio e possiamo restituire al cliente stesso il filamento ricavato dalle sue stesse stampe.

È l'**economia circolare applicata alla stampa 3D**, in una forma molto concreta: non un certificato verde da appendere al muro, ma un filamento di colore riconoscibile sul carrello della tua stampante che ti ricorda che quello che stai producendo oggi nasce da quello che ieri sarebbe finito in discarica.

## Domande frequenti sul filamento riciclato

**Il filamento riciclato si comporta come quello vergine in stampa?**
Nella maggior parte dei casi sì, con parametri leggermente regolati (temperatura, flusso). Per materiali come PLA e PETG la differenza è minima. Per Nylon e ASA richiede più cura nell'essiccazione.

**Posso ottenere un colore specifico?**
Dipende dalla disponibilità di scarti di quel colore. Per lotti grandi possiamo aggiungere masterbatch colorato. Per piccoli lotti consigliamo di accettare la varietà cromatica del riciclato o di orientarsi su nero / grigio scuro (colori molto forgiving).

**Quanto costa rispetto al vergine?**
Tipicamente tra il 30% e il 50% meno del filamento vergine equivalente, a seconda del materiale e della disponibilità.

**Le proprietà meccaniche si degradano cicli dopo cicli?**
Sì, ma in modo contenuto per PLA, PETG e ABS. Dopo 3-4 cicli di riciclaggio consigliamo di miscelare con vergine per mantenere il livello qualitativo stabile. Tracciamo internamente il numero di cicli di ogni lotto.

**Posso portare io stesso degli scarti di stampa 3D?**
Sì — se sei in Ticino possiamo ritirarli o puoi portarli in sede a Figino. Per clienti ricorrenti organizziamo ritiri programmati.

## Contattaci

Se sei un'azienda, uno studio di design o un fablab interessato a produzioni più sostenibili, possiamo studiare insieme il **mix di materiali ideale** per il tuo progetto e integrare il nostro servizio di riciclaggio nel tuo flusso di lavoro. La stampa 3D può essere uno strumento potente non solo per produrre meglio, ma anche per produrre in modo più responsabile.`,
    contentEn: `FDM 3D printing naturally produces waste: supports, failed prints, brims, discarded prototypes, almost-empty spools. In a lab that runs continuous production this can easily reach **10-20% of the material purchased every year**.

At 3DMAKES we integrated an in-house recycling technology that lets us recover **100% of the material** entering our workshop: PLA, ABS, PETG, ASA and unreinforced PA all become new filament, ready to be printed again.

The process goes through five stages: sorting by type and color, shredding, drying, extrusion of new 1.75 mm filament with real-time diameter control, and spooling. Recycled filament performs well for prototypes, aesthetic parts, educational projects and non-structural production. For certified, medical or structural applications we still recommend virgin material — we believe in being honest about the trade-offs.

Every quote we issue includes three transparent material options: 100% virgin, virgin + recycled blend, or 100% recycled. For recurring clients we also offer a waste pickup service: we collect their print scrap, process it, and can return the resulting filament for closed-loop production.`,
    details: {
      materiali: "PLA, ABS, PETG, ASA, PA",
      resa: "100% del materiale di scarto",
      cicli: "3-4 prima di reintegro vergine",
      tipoStampa: "FDM"
    },
    challenges: [
      "Separare gli scarti per tipologia e colore per ottenere riciclato uniforme",
      "Gestire l'essiccazione dei materiali igroscopici (PETG, PA, ASA)",
      "Mantenere la tolleranza dimensionale del filamento riestruso (1,75 mm)",
      "Comunicare con trasparenza i limiti del riciclato vs vergine"
    ],
    benefits: [
      "100% del materiale in ingresso recuperato, zero scarti in smaltimento",
      "Costo del filamento riciclato fino al 50% inferiore al vergine",
      "Economia circolare reale con servizio di ritiro scarti per clienti",
      "Scelta tra vergine, mix o riciclato per ogni singolo progetto"
    ]
  }
};

export default blogPosts;
