import { useCanvasState } from "@/context/canvas.context";
import TextSettings from "@/components/shared/text.settings";
import DotSettings from "@/components/shared/dot.settings";
import CanvasSettings from "@/components/shared/canvas.settings";

export default function Toolbox() {
  const { textMode, dotMode } = useCanvasState();

  const getSettings = () => {
    if (textMode) return <TextSettings />;
    if (dotMode) return <DotSettings />;

    return <CanvasSettings />;
  };

  return (
    <main className="flex flex-col max-w-90 w-100 h-full gap-2">
      {getSettings()}
    </main>
  );
}
