import app from './app.js'
import http from 'http';
import {initializeSocket} from "./socket/initilize.socket.js";

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
    // Init Socket.io
    try{
        initializeSocket(server);
    } catch (error) {
        console.error("Socket Connection Error: ", error);
    }
    console.log(`Server is running on port ${PORT}`);
});