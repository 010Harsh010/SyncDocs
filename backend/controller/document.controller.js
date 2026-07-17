import { pool } from "../db/db.js";

export const listDocuments = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT d.id, d.title, d.created_at, d.updated_at
             FROM documents d
             WHERE d.owner_id = $1
             ORDER BY d.updated_at DESC`,
            [req.user.sub],
        );

        res.status(200).json({ documents: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const createDocument = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const title = req.body?.title || "Untitled document";
        const document = await client.query(
            `INSERT INTO documents (title, owner_id)
             VALUES ($1, $2)
             RETURNING id, title, created_at, updated_at`,
            [title, req.user.sub],
        );

        await client.query(
            "INSERT INTO document_content (document_id, content) VALUES ($1, '')",
            [document.rows[0].id],
        );

        await client.query(
            `INSERT INTO document_permissions (document_id, user_id, role)
             VALUES ($1, $2, 'OWNER')`,
            [document.rows[0].id, req.user.sub],
        );

        await client.query("COMMIT");

        res.status(201).json({
            document: {
                ...document.rows[0],
                content: "",
            },
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        client.release();
    }
};

export const getDocument = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT d.id, d.title, dc.content, d.created_at, d.updated_at
             FROM documents d
             JOIN document_content dc ON dc.document_id = d.id
             WHERE d.id = $1 AND d.owner_id = $2`,
            [req.params.id, req.user.sub],
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json({ document: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateDocument = async (req, res) => {
    const title = req.body?.title?.trim();

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }

    try {
        const { rows } = await pool.query(
            `UPDATE documents
             SET title = $1, updated_at = NOW()
             WHERE id = $2 AND owner_id = $3
             RETURNING id, title, created_at, updated_at`,
            [title, req.params.id, req.user.sub],
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Document not found" });
        }

        res.status(200).json({ document: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
