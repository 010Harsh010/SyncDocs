# MultiDoc

MultiDoc is a real-time collaborative document editor.
It uses React on the frontend, Express and Socket.IO on the backend, and PostgreSQL for document storage.

## File Structure

```text
MultiDoc
|- backend
|  |- controller
|  |- db
|  |- middleware
|  |- router
|  |- socket
|- frontend
|  |- src
|  |  |- api
|  |  |- components
|  |  |- context
|  |  |- Shadow
|- docker-compose.yml
```

## Current Sync Workflow

The current update flow uses a patch method.
The frontend compares editor text with its shadow text and sends only the changed part as a diff.
The backend applies that diff to the current document text, updates each connected client shadow, and marks the document dirty for PostgreSQL flush.
Other users connected to the same document receive only the diff they need to reach the latest document text.

### Patch Method Detail

The backend keeps document state in three structures:

```js
const documents = new Map();
// docId -> current document text

const shadows = new Map();
// docId -> socketId -> shadow text

const dirtyDocs = new Set();
// docIds waiting to be flushed to PostgreSQL
```

Each socket gets its own shadow copy when it joins a document.
When a user edits, the frontend sends a diff:

```js
{
  start_idx,
  end_idx,
  text
}
```

The backend applies the diff to `documents`, updates the sender shadow, calculates a diff for every other connected user from their own shadow, forwards those diffs, and adds the document id to `dirtyDocs`.
Every 10 seconds, dirty documents are saved to PostgreSQL.

-----

```mermaid
sequenceDiagram
    autonumber
    participant UserA as User A Browser
    participant ShadowA as User A Shadow
    participant Socket as Socket.IO Server
    participant Store as Backend Memory<br/>documents + shadows
    participant DB as PostgreSQL
    participant ShadowB as User B Shadow
    participant UserB as User B Browser

    UserA->>Socket: join-document(documentId)
    Socket->>Store: initShadow(documentId, socketA)
    Store-->>Socket: Load document from DB if not in memory
    Socket->>UserA: User A joins document room

    UserB->>Socket: join-document(documentId)
    Socket->>Store: initShadow(documentId, socketB)
    Store-->>Socket: Copy current document into User B shadow
    Socket->>UserB: User B joins same document room

    UserA->>UserA: Edit document text
    UserA->>ShadowA: Compare editor text with local shadow
    ShadowA-->>UserA: diff { start_idx, end_idx, text }
    UserA->>Socket: diff-broadcast(documentId, diff)

    Socket->>Store: patchShadow(documentId, socketA, diff)
    Store->>Store: Apply diff to User A shadow
    Store->>Store: Update documents[documentId]
    Store->>Store: Mark documentId in dirtyDocs
    Store->>Store: Compare latest document with User B shadow
    Store-->>Socket: Diff needed by User B

    Socket->>UserB: diff-broadcast(diffForUserB)
    UserB->>ShadowB: Apply received diff to shadow
    ShadowB-->>UserB: Updated document text
    UserB->>UserB: Replace editor text with updated text

    loop Every 10 seconds
        Store->>DB: Flush dirty document content
        Store->>DB: Update documents.updated_at
        Store->>Store: Remove documentId from dirtyDocs
    end
```
---
### Neil Fraser: Writing: Differential Synchronization
![Neil Fraser: Writing: Differential Synchronization](./assets/image.png)

## Past Method

The earlier method sent the full document text on every change.
Each client received and replaced the whole editor content.

## Future Work

Work on the versoning and backup features.
For Diff use Dynamic Programming (Edit Distance / Levenshtein).

## Comparison

| Patch Method | Old Full-Text Method |
| --- | --- |
| Sends only changed text. | Sends the full document text. |
| Uses shadow text for each client. | Replaces editor content directly. |
| Better for frequent edits. | Simple but heavier for real-time editing. |
