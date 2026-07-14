export const sendMessage = (socket, event, data) => {
    if (!socket) return;

    socket.emit(event, data);
};

export const joinDocument = (socket, documentId) => {
    console.log(socket);
    
    if (!socket){
        console.log("Socket not initlized");
        return
    }
    socket.emit("join-document", documentId);
};

export const diffBroadcast = (socket, documentId, diff) => {
    if (!socket) return;

    socket.emit("diff-broadcast", { documentId, diff });
}
export const leaveDocument = (socket, documentId) => {
    if (!socket) return;

    socket.emit("leave-document", documentId);
};