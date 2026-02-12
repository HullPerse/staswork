import { useCanvasState } from "@/context/canvas.context";

import TextSettings from "../features/text.settings";
import DotSettings from "../features/dot.settings";
import CanvasSettings from "../features/canvas.settings";
import HashSettings from "../features/hash.settings";

export default function Toolbox() {
  const { textMode, dotMode, hashMode } = useCanvasState();

  const getSettings = () => {
    if (textMode) return <TextSettings />;
    if (dotMode) return <DotSettings />;
    if (hashMode) return <HashSettings />;

    return <CanvasSettings />;
  };

  return (
    <main className="flex flex-col max-w-90 w-100 h-full gap-2">
      {getSettings()}
    </main>
  );
}
