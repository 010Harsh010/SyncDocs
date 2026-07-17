import { Router } from "express";
import {
    getMe,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
} from "../controller/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.post("/auth/refresh", refreshAccessToken);
router.post("/auth/logout", logoutUser);
router.get("/users/me", requireAuth, getMe);

export default router;
