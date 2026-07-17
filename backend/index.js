import app from './app.js'
import http from 'http';
import {initializeSocket} from "./socket/initilize.socket.js";
import {connectDB} from "./db/db.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try{
        await connectDB();
        const server = http.createServer(app);
        initializeSocket(server);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server Startup Error: ", error);
    }
};

startServer();
