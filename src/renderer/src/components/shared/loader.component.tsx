import { Box } from "lucide-react";

export default function Loader() {
  return (
    <main className="overflow-hidden">
      <div className="w-screen h-screen bg-background text-text flex flex-col items-center justify-center">
        <Box className="animate-spin size-32" />
        <span className="text-2xl font-bold">Загрузка...</span>
      </div>
    </main>
  );
}
