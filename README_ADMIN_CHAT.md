# Configurazione Chat Utente-Admin

## Panoramica
La chat tra utente e admin permette ai clienti di contattare direttamente il supporto tecnico per assistenza.
Questo sistema è basato su Firebase Firestore e Storage per archiviare conversazioni, messaggi e file allegati.

## Configurazione Firebase

### 1. Utente Admin
L'applicazione utilizza l'utente con email `info@3dmakes.ch` come amministratore.

L'ID dell'amministratore (`8MMcvpMR1COf1ApogXo8c1U5ZlV2`) è impostato nei seguenti file:
- `src/components/ConversationList.tsx` 
- `src/components/MessageChat.tsx`

Se è necessario cambiare l'amministratore, è necessario aggiornare l'ID in entrambi i file.

### 2. Configurare le Regole Firestore
Imposta le seguenti regole Firestore per garantire la sicurezza delle conversazioni:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regole per le conversazioni
    match /conversations/{conversationId} {
      allow read: if request.auth != null && 
                 request.auth.uid in resource.data.participants;
      allow create: if request.auth != null && 
                   request.auth.uid in request.resource.data.participants;
      allow update: if request.auth != null && 
                   request.auth.uid in resource.data.participants;
    }
    
    // Regole per i messaggi
    match /messages/{messageId} {
      allow read: if request.auth != null && 
                 (request.auth.uid == resource.data.senderId || 
                  request.auth.uid == resource.data.receiverId);
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth != null && 
                   (request.auth.uid == resource.data.senderId || 
                    request.auth.uid == resource.data.receiverId);
    }
    
    // Regole per gli utenti
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Configurare le Regole Storage
Imposta le seguenti regole per Firebase Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // File degli utenti
    match /files/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allegati dei messaggi
    match /messages/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Interfaccia di Amministrazione

Per amministrare le chat, è possibile:

1. Accedere con l'account info@3dmakes.ch all'area riservata
2. Andare alla pagina Admin Panel
3. Selezionare la tab "Messaggi"
4. Da qui è possibile vedere tutte le conversazioni attive e rispondere agli utenti

## Note Tecniche

- La chat utilizza Firestore per archiviare messaggi e conversazioni
- Gli allegati sono memorizzati in Firebase Storage
- I messaggi vengono aggiornati in tempo reale tramite Firestore onSnapshot
- Per modificare l'ID dell'admin è necessario aggiornare il codice in:
  - `src/components/ConversationList.tsx`
  - `src/components/MessageChat.tsx`

## Struttura Dati Firestore

### Collezione 'conversations'
```
{
  id: string,
  participants: string[],  // array con gli ID degli utenti partecipanti
  lastMessage: string,     // ultimo messaggio inviato
  lastMessageDate: timestamp,
  unreadCount: number,
  subject: string
}
```

### Collezione 'messages'
```
{
  id: string,
  senderId: string,
  receiverId: string,
  content: string,
  createdAt: timestamp,
  read: boolean,
  subject: string,
  attachmentUrls: string[],
  attachmentNames: string[]
}
``` 