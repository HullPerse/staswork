import { lazy, StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";

import { CanvasProvider } from "./context/canvas.context";
import { TextProvider } from "./context/text.context";
import { DotProvider } from "./context/dot.context";
import Loader from "./components/shared/loader.component";

import "./index.css";
const App = lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <CanvasProvider>
      <TextProvider>
        <DotProvider>
          <Suspense fallback={<Loader />}>
            <App />
          </Suspense>
        </DotProvider>
      </TextProvider>
    </CanvasProvider>
  </StrictMode>,
);
