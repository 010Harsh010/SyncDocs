import { useRef,useEffect } from "react";
import {useSocket} from "../../context/SocketContext.jsx";

const Body = () => {
    const documentId = "#Doc-001";
    const { joinDocument, diffBroadcast, socket } = useSocket();
    const editorRef = useRef(null);
    const previousText = useRef("");
    
    useEffect(() => {
        if (!socket) return;

        const handleDiff = (diff) => {
            console.log("Diff Received:", diff);

            if (!editorRef.current) return;
            if (editorRef.current.innerText === diff) return;

            editorRef.current.innerText = diff;
            previousText.current = diff;
        };

        socket.on("diff-broadcast", handleDiff);

        return () => {
            socket.off("diff-broadcast", handleDiff);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        joinDocument(documentId);
    },[socket,documentId]);

    const handleInput = () => {
        const currentText = editorRef.current?.innerText ?? "";
        if (currentText !== previousText.current){
            diffBroadcast(documentId, currentText);
            console.log("Text Updated: ", currentText);
        }
        previousText.current = currentText;
    };

    return (
        <main
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className="min-h-[calc(100vh-73px)] px-6 py-10 outline-none"
        />
    );
};

export default Body;
