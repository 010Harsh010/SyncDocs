import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const accessSecret = process.env.ACCESS_TOKEN_SECRET || "dev-access-secret";
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret";

const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

const decode = (value) =>
    JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const sign = (data, secret) =>
    createHmac("sha256", secret).update(data).digest("base64url");

const createToken = (user, type, expiresInSeconds) => {
    const header = encode({ alg: "HS256", typ: "JWT" });
    const payload = encode({
        type,
        sub: user.id,
        email: user.email,
        name: user.name,
        jti: randomUUID(),
        exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });
    const data = `${header}.${payload}`;

    return `${data}.${sign(data, type === "refresh" ? refreshSecret : accessSecret)}`;
};

export const createAccessToken = (user) => createToken(user, "access", 15 * 60);

export const createRefreshToken = (user) =>
    createToken(user, "refresh", 7 * 24 * 60 * 60);

export const hashToken = (token) =>
    createHmac("sha256", refreshSecret).update(token).digest("hex");

export const verifyToken = (token, expectedType = "access") => {
    const [header, payload, signature] = token?.split(".") || [];
    if (!header || !payload || !signature)
         throw new Error("Invalid token");

    const data = `${header}.${payload}`;
    const secret = expectedType === "refresh" ? refreshSecret : accessSecret;
    const expectedSignature = sign(data, secret);

    if (
        signature.length !== expectedSignature.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
        throw new Error("Invalid token");
    }

    const decoded = decode(payload);
    if (decoded.type !== expectedType) throw new Error("Invalid token type");
    if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error("Token expired");

    return decoded;
};

export const requireAuth = (req, res, next) => {
    try {
        const [type, token] = req.headers.authorization?.split(" ") || [];
        if (type !== "Bearer" || !token) {
            return res.status(401).json({ message: "Access token required" });
        }

        req.user = verifyToken(token, "access");
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired access token" });
    }
};
