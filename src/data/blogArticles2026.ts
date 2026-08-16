/**
 * Nuovi articoli blog (agosto 2026) — guide SEO su tecnologie 3DMAKES.
 * Importati e uniti in blogContent.ts.
 */

export const newBlogPostsMeta = [
  {
    id: "fdm-vs-sla-confronto",
    titleKey: "blogPosts.fdmVsSla.title",
    titleFallback: "FDM vs SLA: quale tecnologia di stampa 3D scegliere",
    excerptKey: "blogPosts.fdmVsSla.excerpt",
    excerptFallback:
      "Confronto pratico tra FDM e SLA: costi, dettaglio, resistenza, tempi e casi d’uso. Ti aiutiamo a scegliere la tecnologia giusta per il tuo progetto.",
    imageSrc: "/images/blog/fdm-vs-sla.jpg",
    date: "16 Aug 2026",
    categoryKey: "blog.categories.tutorial",
    categoryFallback: "Tutorial",
    featured: true,
  },
  {
    id: "scansione-3d-reverse-engineering",
    titleKey: "blogPosts.scanningGuide.title",
    titleFallback: "Scansione 3D e reverse engineering: quando serve (e quando no)",
    excerptKey: "blogPosts.scanningGuide.excerpt",
    excerptFallback:
      "Come digitalizzare pezzi reali fino a 2×2×2 m: ricambi fuori produzione, ispezione dimensionale e replica in stampa 3D.",
    imageSrc: "/images/blog/scansione-3d.jpg",
    date: "14 Aug 2026",
    categoryKey: "blog.categories.technology",
    categoryFallback: "Tecnologia",
    featured: true,
  },
  {
    id: "taglio-incisione-laser-metallo",
    titleKey: "blogPosts.laserMetal.title",
    titleFallback: "Taglio e incisione laser su metallo: applicazioni reali",
    excerptKey: "blogPosts.laserMetal.excerpt",
    excerptFallback:
      "Targhe, seriali, QR e componenti: come usiamo il laser a fibra per lavorazioni precise su acciaio, alluminio, ottone e rame.",
    imageSrc: "/images/blog/laser-workshop.jpg",
    date: "12 Aug 2026",
    categoryKey: "blog.categories.technology",
    categoryFallback: "Tecnologia",
    featured: true,
  },
  {
    id: "stampa-3d-metallo-slm",
    titleKey: "blogPosts.slmMetal.title",
    titleFallback: "Stampa 3D in metallo (SLM): pezzi strutturali senza utensili",
    excerptKey: "blogPosts.slmMetal.excerpt",
    excerptFallback:
      "Quando conviene la stampa SLM in metallo per pezzi funzionali, geometrie complesse e piccole serie senza stampi.",
    imageSrc: "/images/blog/stampa-slm-metallo.jpg",
    date: "10 Aug 2026",
    categoryKey: "blog.categories.technology",
    categoryFallback: "Tecnologia",
    featured: false,
  },
  {
    id: "preparare-file-stl-step-checklist",
    titleKey: "blogPosts.fileChecklist.title",
    titleFallback: "Come preparare un file STL o STEP per la stampa 3D (checklist)",
    excerptKey: "blogPosts.fileChecklist.excerpt",
    excerptFallback:
      "Errori comuni, spessori minimi, tolleranze e formati accettati: una checklist pratica prima di richiedere un preventivo.",
    imageSrc: "/images/blog/preparare-file-stl.jpg",
    date: "8 Aug 2026",
    categoryKey: "blog.categories.tutorial",
    categoryFallback: "Tutorial",
    featured: false,
  },
  {
    id: "piccole-serie-sls-mjf",
    titleKey: "blogPosts.slsMjfSeries.title",
    titleFallback: "Piccole serie con SLS e MJF: quando conviene vs stampo",
    excerptKey: "blogPosts.slsMjfSeries.excerpt",
    excerptFallback:
      "Bridge manufacturing da 10 a qualche centinaio di pezzi: tempi, costi e vantaggi di SLS/MJF rispetto allo stampo a iniezione.",
    imageSrc: "/images/blog/serie-sls-mjf.jpg",
    date: "6 Aug 2026",
    categoryKey: "blog.categories.innovation",
    categoryFallback: "Innovazione",
    featured: false,
  },
] as const;

export const newBlogPostsContent: Record<
  string,
  {
    title: string;
    titleEn: string;
    content: string;
    contentEn: string;
    details: Record<string, string>;
    challenges: string[];
    benefits: string[];
  }
> = {
  "fdm-vs-sla-confronto": {
    title: "FDM vs SLA: quale tecnologia di stampa 3D scegliere",
    titleEn: "FDM vs SLA: which 3D printing technology to choose",
    content: `Quando chiedi un preventivo di stampa 3D, la prima domanda utile non è “quanto costa?”, ma **quale tecnologia serve davvero**. In laboratorio lavoriamo ogni giorno con **FDM** e **SLA**: due processi diversi, con punti di forza opposti. Scegliere male significa pagare di più, aspettare di più o ottenere un pezzo che non regge all’uso.

In 3DMAKES a Figino (Ticino) ti guidiamo in base a **budget, resistenza, dettaglio e quantità**. Qui trovi il confronto pratico che usiamo con i clienti.

## In sintesi
| | **FDM** | **SLA** |
|---|---|---|
| Principio | Filamento fuso depositato a strati | Resina liquida polimerizzata con luce UV |
| Punti di forza | Costo, pezzi grandi, materiali tecnici | Dettaglio fine, superfici lisce |
| Limiti tipici | Linee di layer visibili | Volume più contenuto, post-processing obbligatorio |
| Ideale per | Prototipi funzionali, dime, ricambi | Gioielleria, dentale, mockup estetici |

## Cos’è l’FDM
L’**FDM** (Fused Deposition Modeling) deposita materiale termoplastico strato dopo strato. È la tecnologia più usata per prototipi meccanici, staffe, alloggiamenti e pezzi di prova.

**Quando la consigliamo**
- Ti serve un pezzo **robusto** o da montare/testare
- Dimensioni medio-grandi (con FDM arriviamo fino a **800×800×1000 mm**)
- Budget contenuto o più iterazioni rapide
- Materiali come PLA, PETG, ABS, ASA, TPU, Nylon o filamenti caricati fibra

**Cosa sapere**
- Le linee di layer si vedono (si possono levigare o verniciare)
- La resistenza dipende molto da **orientamento** e parametri di stampa
- Ideale per pezzi funzionali “da officina”

Scopri di più sulla nostra pagina [Stampa 3D FDM](/services/fdm).

## Cos’è l’SLA
L’**SLA** (Stereolithography) solidifica una resina liquida con luce UV. È la scelta quando contano **precisione e finitura**.

**Quando la consigliamo**
- Dettagli fini, superfici lisce, geometrie minute
- Prototipi estetici, modelli presentabili, applicazioni dentali/gioielleria
- Quote strette e aspetto “quasi stampo”

**Cosa sapere**
- Serve lavaggio e post-cura UV
- Volume di stampa tipicamente più piccolo rispetto all’FDM grande formato
- Materiali resinosi specifici (tough, flexible, castable, biocompatibili)

Vedi anche [Stampa 3D SLA](/services/sla).

## Come decidiamo insieme (in 4 domande)
1. **A cosa serve il pezzo?** Estetica, prova di forma, o carico meccanico?
2. **Quanto può costare?** Spesso l’FDM è più economico a parità di volume.
3. **Quanto deve essere bello?** Se la finitura è critica → SLA.
4. **Quanto è grande?** Pezzi grandi → FDM; pezzi piccoli e dettagliati → SLA.

Non esiste una risposta unica: a volte stampiamo un **prototipo estetico in SLA** e la **versione funzionale in FDM**, oppure usiamo SLS/MJF/SLM quando servono piccole serie o metallo.

## Esempi tipici dal laboratorio
- **Staffa macchina / dima**: FDM in PETG o Nylon
- **Mockup prodotto da mostrare al cliente**: SLA
- **Gomma / paraurti / bumper**: FDM in TPU
- **Modello dentale / gioiello**: SLA
- **Ricambio fuori produzione**: spesso FDM, a volte scansione + stampa

## Prossimo passo
Carica il file sul [calcolatore preventivo](/calculator) oppure scrivici: ti indichiamo tecnologia e materiale in base al progetto. Hai dubbi generali? Consulta le [FAQ](/faq).`,
    contentEn: `When you request a 3D printing quote, the useful first question is not only “how much?”, but **which technology you really need**. At 3DMAKES in Figino (Ticino) we work daily with **FDM** and **SLA** — two different processes with opposite strengths.

**FDM** is ideal for functional parts, larger sizes (up to 800×800×1000 mm), technical materials and tighter budgets. **SLA** wins on fine detail and smooth surfaces for aesthetic, dental or jewelry applications.

We guide you based on budget, strength, finish and quantity. Explore [FDM](/services/fdm), [SLA](/services/sla), the [quote calculator](/calculator) or our [FAQ](/faq).`,
    details: {
      tecnologie: "FDM / SLA",
      formatoMax: "fino a 800×800×1000 mm (FDM)",
      sede: "Figino (Ticino)",
      preventivo: "Online + conferma tecnica",
    },
    challenges: [
      "Scegliere la tecnologia sbagliata per budget o finitura",
      "Sottovalutare orientamento e post-processing",
      "Confondere prototipo estetico e pezzo funzionale",
    ],
    benefits: [
      "Confronto chiaro costi / dettaglio / resistenza",
      "Scelta guidata in base al progetto reale",
      "Link diretti a FDM, SLA, preventivo e FAQ",
    ],
  },

  "scansione-3d-reverse-engineering": {
    title: "Scansione 3D e reverse engineering: quando serve (e quando no)",
    titleEn: "3D scanning and reverse engineering: when you need it (and when you don’t)",
    content: `Hai un pezzo fisico ma **non hai il file CAD**. Oppure hai un ricambio fuori produzione, un componente usurato, un oggetto da ispezionare. In questi casi la **scansione 3D** è spesso il percorso più rapido per tornare a un modello digitale utile.

Nel laboratorio 3DMAKES digitalizziamo oggetti reali con precisione fino a circa **0,1 mm** e, per pezzi grandi, arriviamo a volumi intorno a **2×2×2 metri** unendo più scansioni.

## A cosa serve davvero
- **Reverse engineering**: ricostruire un pezzo per ristamparlo o modificarlo
- **Ricambi non più disponibili**: digitalizzare e riprodurre in stampa 3D
- **Ispezione / confronto**: verificare quote rispetto a un modello nominale
- **Replica e restauro**: oggetti artistici, meccanici o storici
- **Base per CAD**: partire da una mesh e ricostruire solide pulite

Scopri il servizio completo su [Scansione 3D](/services/scansione).

## Quando la scansione è la scelta giusta
- Non esiste un disegno aggiornato
- Il pezzo ha superfici organiche o forme difficili da misurare a mano
- Serve una copia fedele in tempi brevi
- Vuoi stampare o lavorare un ricambio “come l’originale”

## Quando invece NON conviene
- Hai già un STEP/CAD aggiornato e affidabile
- Il pezzo è un parallelepipedo semplice misurabile con calibro
- Servono tolleranze estreme tipiche di metrologia da sala CMM (valutiamo caso per caso)
- La superficie è molto riflettente/nera e non può essere trattata (a volte si risolve con spray opaco)

## Cosa ricevi alla fine
A seconda del progetto consegnamo:
- mesh **STL/OBJ** pronta per stampa
- file lavorati per **CAD / reverse engineering**
- indicazioni su materiali e tecnologie di riproduzione (FDM, SLA, SLS, laser…)

## Flusso tipico in 3DMAKES
1. Analisi pezzo e obiettivo (replica, modifica, ispezione)
2. Scansione in sede a Figino o on-site quando serve
3. Allineamento e pulizia della mesh
4. (Opzionale) ricostruzione CAD
5. Produzione: stampa 3D, laser o altra tecnologia

## Casi d’uso frequenti in Ticino e Nord Italia
- Macchinari industriali con ricambi introvabili
- Alloggiamenti plastici rotti
- Componenti automotive / moto
- Oggetti design da riprodurre in piccola serie

## Prossimo passo
Porta o spedisci il pezzo, oppure inviaci foto e dimensioni indicative. Possiamo combinare scansione + [prototipazione](/services/prototipazione) + stampa. Per domande rapide: [FAQ](/faq) o [preventivo](/calculator).`,
    contentEn: `When you have a physical part but **no CAD file**, 3D scanning is often the fastest path back to a usable digital model. At 3DMAKES we scan with precision around **0.1 mm** and can cover large objects up to about **2×2×2 m** by merging multiple scans.

Typical uses: reverse engineering, obsolete spare parts, dimensional checks and replication. See [3D scanning](/services/scansione), [FAQ](/faq) or request a [quote](/calculator).`,
    details: {
      precisione: "fino a ~0,1 mm",
      volume: "fino a ~2×2×2 m",
      output: "STL / OBJ / CAD su richiesta",
      sede: "Figino + on-site",
    },
    challenges: [
      "Superfici scure o riflettenti",
      "Pezzi molto grandi da scansionare a sezioni",
      "Passare da mesh a CAD solido affidabile",
    ],
    benefits: [
      "Ricambi fuori produzione recuperabili",
      "Tempo ridotto rispetto al ridisegno da zero",
      "Collegamento diretto a stampa e prototipazione",
    ],
  },

  "taglio-incisione-laser-metallo": {
    title: "Taglio e incisione laser su metallo: applicazioni reali",
    titleEn: "Laser cutting and engraving on metal: real applications",
    content: `Oltre alla stampa 3D, in 3DMAKES lavoriamo metalli con **taglio e incisione laser**. È una tecnologia complementare: quando serve una targa, un codice seriale, un QR, un profilo tagliato o una marcatura permanente, il laser è spesso più rapido e preciso di metodi tradizionali.

## Cosa facciamo con il laser
- **Incisione e marcatura** su acciaio inox, alluminio, ottone, rame
- **Targhe industriali** e identificazione pezzi
- **Codici QR / barcode** permanenti
- **Personalizzazioni** e elementi tecnici
- **Taglio** su spessori compatibili con il processo

Dettagli e materiali: [Incisione e taglio laser](/services/laser).

## Perché le aziende lo scelgono
- Marcatura **indelebile** e professionale
- Ripetibilità su piccole serie
- File da CAD/DXF/PDF, workflow digitale
- Ideale per tracciabilità, ricambi, kit e allestimenti

## Laser + stampa 3D: combo tipiche
Molti progetti uniscono le due tecnologie:
1. Corpo/staffa stampata in FDM o SLS
2. Targhetta o piastrina metallica marcata a laser
3. Assemblaggio finale e consegna

Oppure: pezzo scansionato → ristampato → marcato con lotto/seriale.

## Cosa ci serve per partire
- File vettoriale o CAD (DXF, PDF, SVG, STEP quando utile)
- Materiale e spessore
- Quantità e finitura desiderata
- Testo/logo/QR da marcare

## Limiti da conoscere
- Non tutti gli spessori e leghe si tagliano allo stesso modo
- L’estetica dell’incisione cambia tra inox, alluminio e ottone
- Per pezzi strutturali complessi in metallo valutiamo anche **SLM**

## Per chi è utile
Officine, produttori, studi di design, manutentori e maker professionali in **Ticino, Svizzera e Nord Italia**.

Richiedi un preventivo dal [calcolatore](/calculator) o dal [modulo contatti](/#contact). Altre risposte in [FAQ](/faq).`,
    contentEn: `Besides 3D printing, 3DMAKES offers **laser cutting and engraving on metal** — ideal for plates, serials, QR codes and permanent markings on stainless steel, aluminium, brass and copper.

It often complements FDM/SLS parts with metal labels or identification. See [laser services](/services/laser), [FAQ](/faq) or [contact](/#contact).`,
    details: {
      materiali: "Inox, alluminio, ottone, rame",
      usi: "Targhe, seriali, QR, taglio",
      file: "DXF / PDF / SVG / CAD",
      area: "Ticino · Svizzera · Nord Italia",
    },
    challenges: [
      "Scegliere lega e spessore corretti",
      "Preparare file vettoriali puliti",
      "Integrare marcatura e pezzi stampati",
    ],
    benefits: [
      "Marcatura permanente e professionale",
      "Piccole serie ripetibili",
      "Sinergia con stampa 3D e scansione",
    ],
  },

  "stampa-3d-metallo-slm": {
    title: "Stampa 3D in metallo (SLM): pezzi strutturali senza utensili",
    titleEn: "Metal 3D printing (SLM): structural parts without tooling",
    content: `La stampa **SLM** (Selective Laser Melting) fonde polveri metalliche strato dopo strato con laser. Il risultato sono pezzi metallici densi, adatti a applicazioni strutturali o funzionali dove plastica e resina non bastano.

Per aziende in Ticino e Nord Italia è una leva potente: **geometrie complesse senza utensili**, leggeri ottimizzati, prototipi metallici e piccole serie senza aprire uno stampo.

## Quando ha senso lo SLM
- Serve **metallo**, non un sostituto plastico
- Geometrie interne, canali, lattice, forme impossibili al CNC tradizionale
- Prototipo funzionale metallico prima di produzione
- Piccole quantità dove lo stampo non conviene

Pagina dedicata: [Stampa 3D SLM](/services/slm).

## Quando invece valutare altro
- Pezzo semplice lavorabile bene al CNC da billetta
- Solo mockup estetico → SLA/FDM
- Serie medie in nylon → SLS/MJF spesso più economiche
- Solo marcatura/taglio piastra → laser

## Vantaggi concreti
- Libertà geometrica elevata
- Iterazioni di design più rapide rispetto a utensileria classica
- Possibilità di consolidare più componenti in un pezzo unico
- Ideale per R&D, tooling e pezzi speciali

## Cosa valutare prima di partire
1. **Requisiti meccanici** (carichi, temperatura, corrosione)
2. **Materiale** richiesto dal progetto
3. **Post-processing** (rimozione supporti, trattamenti, finitura)
4. **Tolleranze** e superfici critiche
5. **Quantità** e roadmap verso produzione

## SLM nel flusso 3DMAKES
Spesso il percorso è:
- Concept / CAD
- (Eventuale) prototipo plastico in FDM/SLA per validare ingombri
- Pezzo metallico SLM
- Finitura e controllo

Oppure partiamo da [scansione 3D](/services/scansione) di un ricambio metallico esistente.

## Prossimo passo
Se pensi che il tuo pezzo richieda metallo, inviaci CAD o bozza: ti diciamo se SLM è la strada giusta o se conviene CNC, SLS o FDM tecnico. [Preventivo](/calculator) · [FAQ](/faq) · [Contatti](/#contact).`,
    contentEn: `**SLM** metal 3D printing melts metal powders with a laser to build dense structural parts — useful when plastics are not enough and tooling is not justified.

Typical uses: complex geometries, functional metal prototypes and small series. Learn more on [SLM](/services/slm) or ask via the [calculator](/calculator).`,
    details: {
      tecnologia: "SLM (metallo)",
      uso: "Pezzi strutturali / funzionali",
      alternativa: "CNC · SLS · FDM tecnico",
      sede: "Figino (Ticino)",
    },
    challenges: [
      "Definire correttamente carichi e materiale",
      "Pianificare supporti e post-processing",
      "Capire quando CNC resta più conveniente",
    ],
    benefits: [
      "Metallo senza stampi",
      "Geometrie complesse realizzabili",
      "Iterazioni R&D più veloci",
    ],
  },

  "preparare-file-stl-step-checklist": {
    title: "Come preparare un file STL o STEP per la stampa 3D (checklist)",
    titleEn: "How to prepare an STL or STEP file for 3D printing (checklist)",
    content: `Un preventivo accurato e una stampa riuscita partono dal **file**. Molti ritardi e extra-costi nascono da mesh aperte, spessori troppo sottili, tolleranze ignorate o formati sbagliati.

Questa checklist è quella che consigliamo ai clienti prima di caricare un modello sul [calcolatore](/calculator) o di inviarcelo.

## Formati che accettamo
- **STL** — standard per mesh di stampa
- **OBJ** — mesh con eventuali texture
- **STEP / STP** — preferibile per pezzi tecnici/CAD (più pulito da modificare)
- Altri formati (3MF, IGES, SolidWorks…): spesso convertibili, chiedici

## Checklist rapida (prima di inviare)
### 1. Modello chiuso (watertight)
Niente buchi, shell aperte o facce mancanti. Una mesh non manifold crea errori in slicing.

### 2. Scale e unità
Verifica millimetri vs pollici. Un pezzo “10 volte più grande” è un errore classico.

### 3. Spessori minimi
Pareti troppo sottili si spezzano o non stampano. Indicativamente:
- FDM: evita pareti sotto ~1–1,2 mm se non motivate
- SLA: dettagli fini ok, ma parti fragili restano fragili

### 4. Tolleranze e accoppiamenti
Fori, snap-fit, viti e incastro richiedono gioco. Se stampi “a zero” spesso non entra.

### 5. Orientamento pensato
La direzione degli strati cambia resistenza e finitura. Se hai vincoli (estetica su una faccia, carico su un asse), segnalacelo.

### 6. Testo e dettagli minuti
Caratteri troppo piccoli spariscono in FDM; in SLA reggono meglio.

### 7. Parti multiple
Meglio un assieme chiaro o pezzi separati etichettati, non 20 corpi confusi nello stesso file.

## Errori più comuni che vediamo
- STL a bassa risoluzione (facce triangolari grosse su curve)
- Pezzo progettato “come CNC” senza pensare agli strati
- Supporti inevitabili non considerati nel costo
- Materiale richiesto non adatto alla geometria

## Come lavoriamo noi sul file
Se serve, ottimizziamo:
- spessori e raccordi
- orientamento e supporti
- split in sezioni per pezzi oltre il volume macchina
- scelta tecnologia (FDM/SLA/SLS/…)

Ne parliamo anche nelle [FAQ](/faq) e in [prototipazione](/services/prototipazione).

## Mini workflow consigliato
1. Esporta STEP (se hai CAD) oppure STL di qualità alta
2. Controlla dimensioni reali
3. Scrivi 3 info: materiale desiderato, uso del pezzo, quantità
4. Carica sul calcolatore o inviaci il file
5. Confermiamo tecnologia, tempi e prezzo

Pronto? Vai al [preventivo online](/calculator).`,
    contentEn: `A good quote starts with a **clean file**. Before uploading to our [calculator](/calculator), check: watertight mesh, correct units, minimum wall thickness, clearances for fits, and a suitable format (STL/OBJ/STEP).

We can help optimize orientation, supports and technology choice. See also our [FAQ](/faq).`,
    details: {
      formati: "STL · OBJ · STEP",
      focus: "Spessori · tolleranze · unità",
      output: "File stampabile + preventivo",
      tool: "Calcolatore online",
    },
    challenges: [
      "Mesh aperte o non manifold",
      "Unità/scala errate",
      "Accoppiamenti senza gioco",
    ],
    benefits: [
      "Meno errori di stampa",
      "Preventivi più affidabili",
      "Tempi di avvio più rapidi",
    ],
  },

  "piccole-serie-sls-mjf": {
    title: "Piccole serie con SLS e MJF: quando conviene vs stampo",
    titleEn: "Small series with SLS and MJF: when it beats injection moulding",
    content: `Hai validato il prototipo e ti servono **10, 50, 200 pezzi**. Aprire uno stampo a iniezione costa tempo e denaro; stampare uno a uno in FDM può non scalare. Qui entrano **SLS** e **MJF**: tecnologie a polvere ideali per **piccole e medie serie** (bridge manufacturing).

## Cosa sono SLS e MJF (in pratica)
- **SLS**: laser che sinterizza polvere (tipicamente nylon/TPU)
- **MJF**: processo HP a polvere per pezzi robusti e ripetibili

Entrambe permettono geometrie complesse, spesso **senza supporti** come nell’FDM, con buone proprietà isotrope.

Pagine: [SLS](/services/sls) · [MJF](/services/mjf).

## Quando conviene rispetto allo stampo
| Scenario | Meglio |
|---|---|
| 1–5 pezzi di prova | FDM / SLA |
| 10–300 pezzi, design ancora fluido | **SLS / MJF** |
| Migliaia di pezzi stabili | Stampo a iniezione |
| Geometrie impossibili allo stampo | **SLS / MJF** (o SLM se metallo) |

## Vantaggi per l’azienda
- Nessun costo utensile iniziale
- Modifiche al CAD tra un lotto e l’altro
- Lead time più corti in fase di lancio
- Magazzino snello: ristampi al bisogno
- Ideale per ricambi, cover, staffe, componenti tecnici in PA12

## Limiti da conoscere
- Costo unitario più alto dello stampo su grandi volumi
- Finitura diversa dall’iniezione (spesso sabbiata/tecnica)
- Colori e texture vanno pianificati
- Non sostituisce sempre un metallo strutturale (valutare SLM)

## Come decidiamo il lotto giusto
Ti chiediamo:
1. Quantità oggi e nei 6–12 mesi
2. Materiale / resistenza richiesta
3. Estetica vs funzione
4. Stabilità del design
5. Budget e data di consegna

A volte la strategia migliore è: **prototipo FDM/SLA → pre-serie SLS/MJF → stampo** solo se i numeri crescono.

## Casi tipici che vediamo
- Startup hardware in pre-lancio
- Manifattura con ricambi a domanda
- Cover e componenti interni macchina
- Lotti promozionali o versioni custom

## Prossimo passo
Inviaci CAD e quantità target: ti proponiamo il mix tecnologia/costo più sensato. [Preventivo](/calculator) · [FAQ](/faq) · [Tecnologie](/services).`,
    contentEn: `When you need **10–300 parts** and tooling is not justified yet, **SLS** and **MJF** powder technologies are often the sweet spot versus injection moulding.

Benefits: no mould cost, design flexibility, faster launch lots in PA12 and similar materials. See [SLS](/services/sls), [MJF](/services/mjf) or get a [quote](/calculator).`,
    details: {
      tecnologie: "SLS / MJF",
      volumi: "tipicamente 10–300+",
      materiali: "PA12 · TPU (varie)",
      alternativa: "Stampo se volumi alti",
    },
    challenges: [
      "Stimare correttamente il volume annuale",
      "Allineare finitura attesa e processo a polvere",
      "Decidere quando passare allo stampo",
    ],
    benefits: [
      "Nessun costo utensile",
      "Iterazioni di design ancora possibili",
      "Lancio prodotto più rapido",
    ],
  },
};
