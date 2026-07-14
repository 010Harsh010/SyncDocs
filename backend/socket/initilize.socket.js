import { Server } from "socket.io";

export const initializeSocket = (server) => {
    const io = new Server(server,{
        cors:{
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        }
    });

    io.on("connection", (socket) => {
        console.log("A user connected: ", socket.id);
        socket.on("disconnect", () => {
            console.log("A user disconnected: ", socket.id);
        });
        socket.on("join-document", (documentId) => {
            socket.join(documentId);
            console.log("User Join Doc", documentId);
            // io.to(documentId).emit("diff-broadcast", msg);
        });
        socket.on("diff-broadcast", ({ documentId, diff }) => {
            io.to(documentId).emit("diff-broadcast", diff);
        });
        socket.on("leave-document", (documentId) => {
            socket.leave(documentId);
            console.log("User Leave Doc", documentId);
        });
    });

    return io;
}

// export default initializeSocket;
