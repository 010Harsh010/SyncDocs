import { Server } from "socket.io";
import shadow from "./shadow.js"

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
            shadow.removeClient(socket.id);
        });
        socket.on("join-document", async (documentId) => {
            try {
                await shadow.initShadow(documentId, socket.id);
                socket.join(documentId);
                console.log("User Join Doc", documentId);
            } catch (error) {
                console.error("Document join failed:", error);
            }
        });
        socket.on("diff-broadcast", async ({ documentId, diff }) => {
            try {
                const clientDiffs = shadow.patchShadow(documentId, socket.id, diff);
                if (clientDiffs === false) {
                    throw new Error("Document content update failed");
                }

                clientDiffs.forEach(({ socketId, diff }) => {
                    io.to(socketId).emit("diff-broadcast", diff);
                });
            } catch (error) {
                console.error("Document content update failed:", error);
            }
        });
        socket.on("leave-document", (documentId) => {
            socket.leave(documentId);
            shadow.removeShadow(documentId, socket.id);
            console.log("User Leave Doc", documentId);
        });
    });

    return io;
}

// export default initializeSocket;
