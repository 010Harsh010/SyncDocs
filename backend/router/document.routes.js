import { Router } from "express";
import {
    createDocument,
    getDocument,
    listDocuments,
    updateDocument,
} from "../controller/document.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/documents", requireAuth, listDocuments);
router.post("/documents", requireAuth, createDocument);
router.get("/documents/:id", requireAuth, getDocument);
router.patch("/documents/:id", requireAuth, updateDocument);

export default router;
