import {pool} from "../db/db.js"
import { getDiff } from "./diff.js";

export const documents = new Map();
export const shadows = new Map();
export const dirtyDocs = new Set();

class Shadow {
    constructor() {
        this.isFlushing = false;
        this.checkDoc = setInterval(() => {
            this.updateDoc();
        }, 10000)
    }

    async updateDoc(){
        if (this.isFlushing) return;
        this.isFlushing = true;

        try {
            for (const docId of Array.from(dirtyDocs)) {
                const text = documents.get(docId);

                if (text == null) {
                    dirtyDocs.delete(docId);
                    continue;
                }

                await pool.query(
                    `UPDATE document_content SET content = $1 WHERE document_id = $2`,
                    [text, docId]
                );

                await pool.query(
                    `UPDATE documents SET updated_at = NOW() WHERE id = $1`,
                    [docId]
                );

                dirtyDocs.delete(docId);
            }
        } catch (error) {
            console.error("Document flush failed:", error);
        } finally {
            this.isFlushing = false;
        }
    }

    async initShadow(docId, socketId){
        if (!documents.has(docId)) {
            const { rows } = await pool.query(
                `SELECT content FROM document_content WHERE document_id = $1`,
                [docId]
            );

            documents.set(docId, rows[0]?.content ?? "");
        }

        if (!shadows.has(docId)) {
            shadows.set(docId, new Map());
        }

        shadows.get(docId).set(socketId, documents.get(docId));
    }

    getShadow(docId, socketId) {
        if (!shadows.has(docId)) return null;
        return shadows.get(docId).get(socketId) ?? null;
    }

    patchShadow(docId, socketId, diff) {
        if (!diff || !documents.has(docId)) return false;
        if (!shadows.has(docId)) return false;

        if (!shadows.get(docId).has(socketId)) return false;

        const clients = shadows.get(docId);
        const text = this.applyDiff(clients.get(socketId), diff);

        clients.set(socketId, text);
        documents.set(docId, text);

        dirtyDocs.add(docId);
        return this.diffOthers(docId, socketId);
    }

    diffOthers(docId, socketId){
        const clients = shadows.get(docId);
        const text = documents.get(docId);
        const diffs = [];

        clients.forEach((clientText, clientId) => {
            if (clientId === socketId) return;

            const diff = getDiff(text, clientText);
            if (!diff) return;

            clients.set(clientId, this.applyDiff(clientText, diff));
            diffs.push({ socketId: clientId, diff });
        });

        return diffs;
    }

    applyDiff(text, diff) {
        return (
            text.slice(0, diff.start_idx)
            + diff.text
            + text.slice(diff.end_idx + 1)
        );
    }

    removeShadow(docId, socketId) {
        if (!shadows.has(docId)) return;

        const clients = shadows.get(docId);

        clients.delete(socketId);

        if (clients.size === 0) {
            shadows.delete(docId);
        }
    }

    removeClient(socketId) {
        for (const [docId, clients] of shadows) {
            clients.delete(socketId);

            if (clients.size === 0) {
                shadows.delete(docId);
            }
        }
    }

    getDocumentShadows(docId) {
        return shadows.get(docId) ?? new Map();
    }
}

const shadow = new Shadow();

export default shadow;
