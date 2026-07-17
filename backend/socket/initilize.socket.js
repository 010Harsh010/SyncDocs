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
                // patch dif with shadow
                if(await shadow.patchShadow(documentId, socket.id,diff)){
                    socket.to(documentId).emit("diff-broadcast", diff);
                }else{
                    throw new Error("Document content update failed");
                }
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
