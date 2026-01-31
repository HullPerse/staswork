import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { CanvasProvider } from "./context/canvas.context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CanvasProvider>
      <App />
    </CanvasProvider>
  </StrictMode>,
);
