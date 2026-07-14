import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
    sendMessage,
    joinDocument,
    leaveDocument,
    diffBroadcast,
} from "../socket/socket.ops.js";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");
        setSocket(socketRef.current);

        if(socketRef.current) {
            socketRef.current.on("connect", () => {
                console.log("Connected to socket server:", socketRef.current);
            }); 
        }

        return () => socketRef.current.disconnect();
    }, []);

    return (
        <SocketContext.Provider
            value={{
                socket,
                sendMessage: (event, data) => sendMessage(socketRef.current, event, data),
                joinDocument: (id) => joinDocument(socketRef.current, id),
                leaveDocument: (id) => leaveDocument(socketRef.current, id),
                diffBroadcast: (documentId, diff) => diffBroadcast(socketRef.current, documentId, diff),
            }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
