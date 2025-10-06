# Istruzioni per risolvere i problemi CORS di Firebase Storage

Abbiamo effettuato i seguenti miglioramenti nel codice:

1. Semplificato la gestione degli URL per i modelli 3D
2. Aggiunto un metodo alternativo con link diretto quando il caricamento automatico fallisce
3. Migliorato la visualizzazione degli errori

Per risolvere definitivamente i problemi CORS, è necessario configurare correttamente Firebase Storage seguendo queste istruzioni:

## 1. Configurazione CORS tramite Google Cloud Console

1. Vai alla [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona il tuo progetto (dmakes-a2c74)
3. Nel menu di navigazione, vai a "Storage" -> "Browser"
4. Seleziona il bucket "dmakes-a2c74.appspot.com"
5. Vai alla scheda "Autorizzazioni"
6. Cerca la sezione "CORS configuration" o vai su "Edit CORS configuration"
7. Incolla la seguente configurazione:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": [
      "Content-Type", 
      "Content-Length", 
      "Content-Range", 
      "Content-Encoding", 
      "Content-Disposition", 
      "Authorization", 
      "Cache-Control", 
      "Accept", 
      "Accept-Encoding", 
      "Accept-Language", 
      "Access-Control-Allow-Origin", 
      "Access-Control-Allow-Headers", 
      "ETag", 
      "Last-Modified", 
      "Pragma"
    ],
    "maxAgeSeconds": 86400
  }
]
```

8. Salva le modifiche

## 2. Configurazione CORS tramite comando gsutil

In alternativa, se hai accesso a Google Cloud SDK, puoi eseguire questo comando:

```bash
gsutil cors set cors.json gs://dmakes-a2c74.appspot.com
```

## 3. Verifica della configurazione

Per verificare che la configurazione CORS sia stata applicata correttamente:

```bash
gsutil cors get gs://dmakes-a2c74.appspot.com
```

## 4. Configurazione aggiuntiva dei Metadata per file STL

Può essere utile anche impostare i metadata corretti per i file STL:

1. Vai al bucket di Storage nella console
2. Seleziona un file STL
3. Vai a "Edit metadata"
4. Aggiungi queste intestazioni personalizzate:
   - `Content-Type`: `application/octet-stream`
   - `Content-Disposition`: `inline`
   - `Access-Control-Allow-Origin`: `*`

## Note aggiuntive

Se i problemi persistono:

1. Assicurati che le regole di sicurezza del bucket permettano l'accesso pubblico in lettura
2. Verifica che i file siano accessibili direttamente tramite URL
3. In caso di problemi con specifici browser, considera di utilizzare una soluzione di proxy CORS come cors-anywhere

La soluzione implementata nel codice ora fornisce un'alternativa all'utente per visualizzare i modelli direttamente quando l'approccio automatico fallisce. 