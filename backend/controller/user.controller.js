import {pool} from "../db/db.js";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import {
    createAccessToken,
    createRefreshToken,
    hashToken,
    verifyToken,
} from "../middleware/auth.middleware.js";

const scrypt = promisify(scryptCallback);

const Query = {
    Insert_User: "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
    Exists_User: "SELECT * FROM users WHERE email = $1",
    Find_User_By_Id: "SELECT id, name, email, created_at FROM users WHERE id = $1",
    Save_Refresh_Token: "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days')",
    Find_Refresh_Token: "SELECT id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()",
    Delete_Refresh_Token: "DELETE FROM refresh_tokens WHERE token_hash = $1"
}

const hashPassword = async (password) => {
    const salt = randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);
    return `${salt}:${hash.toString("hex")}`;
};

const comparePassword = async (password, savedPassword) => {
    const [salt, savedHash] = savedPassword.split(":");
    const hash = await scrypt(password, salt, 64);
    return timingSafeEqual(Buffer.from(savedHash, "hex"), hash);
};

const authResponse = async (user) => {
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    await pool.query(Query.Save_Refresh_Token, [user.id, hashToken(refreshToken)]);
    return { user, accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password) return res.status(400).json({
            message: "All fields are required"
        });
        
        const user = await pool.query(Query.Exists_User, [email.toLowerCase()]);
        if(user.rows.length > 0){
            return res.status(409).json({
                message: "User already exists"
            })
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await pool.query(Query.Insert_User, [name, email.toLowerCase(), hashedPassword]);
        const data = await authResponse(newUser.rows[0]);

        res.status(201).json({
            message: "User created successfully",
            ...data
        })
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const result = await pool.query(Query.Exists_User, [email.toLowerCase()]);
        const user = result.rows[0];
        if (!user || !(await comparePassword(password, user.password_hash))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const data = await authResponse({
            id: user.id,
            name: user.name,
            email: user.email,
            created_at: user.created_at,
        });

        res.status(200).json({ message: "Login successful", ...data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: "Refresh token is required" });

        const payload = verifyToken(refreshToken, "refresh");
        const savedToken = await pool.query(Query.Find_Refresh_Token, [
            payload.sub,
            hashToken(refreshToken),
        ]);
        if (!savedToken.rows.length) return res.status(401).json({ message: "Invalid refresh token" });

        const user = { id: payload.sub, name: payload.name, email: payload.email };
        res.status(200).json({ accessToken: createAccessToken(user) });
    } catch {
        res.status(401).json({ message: "Invalid or expired refresh token" });
    }
};

export const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;
    if (refreshToken) await pool.query(Query.Delete_Refresh_Token, [hashToken(refreshToken)]);
    res.sendStatus(204);
};

export const getMe = async (req, res) => {
    const { rows } = await pool.query(Query.Find_User_By_Id, [req.user.sub]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user: rows[0] });
};
