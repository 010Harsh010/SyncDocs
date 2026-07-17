import { useRef,useEffect,useCallback } from "react";
import {useSocket} from "../../context/SocketContext.jsx";
import {Shadow} from "../../Shadow/shadow.js"

const Body = ({ document }) => {
    const documentId = document?.id;
    const { joinDocument, diffBroadcast, socket , leaveDocument} = useSocket();
    const editorRef = useRef(null);
    const previousText = useRef("");
    const shadowRef = useRef(new Shadow(document));

    const check_diff = useCallback(() => {
        if (!editorRef.current || !documentId) return;

        const currText = editorRef.current.innerText;
        const prevText = previousText.current;
        if(currText !== prevText){
            const diff = shadowRef.current.getDiff(currText);
            if(diff === null) return;
            diffBroadcast(documentId, diff);
        }
        previousText.current = currText;
    }, [documentId, diffBroadcast]);

    useEffect(() => {
        const timer = setInterval(() => {
            check_diff();
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, [check_diff])

    useEffect(() => {
        if (!editorRef.current || !document) return;

        editorRef.current.innerText = document.content || "";
        previousText.current = document.content || "";
        shadowRef.current = new Shadow(document);
    }, [document]);
    
    useEffect(() => {
        if (!socket) return;

        const handleDiff = (diff) => {
            console.log("Diff Received:", diff);

            if (!editorRef.current) return;
            const nextText = shadowRef.current.patch(diff);
            if (editorRef.current.innerText === nextText) return;

            editorRef.current.innerText = nextText;
            previousText.current = nextText;
        };

        socket.on("diff-broadcast", handleDiff);

        return () => {
            socket.off("diff-broadcast", handleDiff);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !documentId) return;

        joinDocument(documentId);

        return () => {
            leaveDocument(documentId)
        };
    },[socket,documentId,joinDocument,leaveDocument]);


    return (
        <main
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="min-h-[calc(100vh-73px)] px-6 py-10 outline-none"
        />
    );
};

export default Body;
