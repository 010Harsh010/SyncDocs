import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ModeProvider } from "./context/Mode.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SocketProvider>
      <ModeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ModeProvider>
    </SocketProvider>
  </StrictMode>,
);
