import express from 'express';
import bodyParser from 'body-parser';
import documentRoutes from "./router/document.routes.js";
import userRoutes from "./router/user.routes.js";


const app = express();
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});
app.use(bodyParser.json());
app.use("/api", userRoutes);
app.use("/api", documentRoutes);


export default app;
