import { useCanvasState } from "@/context/canvas.context";
import { Button } from "../ui/button.component";
import { Input } from "../ui/input.component";
import { Slider } from "../ui/slider.component";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.component";
import LocalTab from "@/components/shared/local.component";
import GlobalTab from "@/components/shared/global.component";
import { Switch } from "../ui/switch.component";

export default function CanvasSettings() {
  const {
    amount,
    setAmount,
    setPoints,
    size,
    setSize,
    gap,
    setGap,
    padding,
    setPadding,
    rotation,
    setRotation,
    results,
    area,
    setArea,
    editIndex,
    setEditIndex,
    points,
    imageHistory,
    activeImageId,
    updateActiveImageHistory,
    textMode,
    dotMode,
    texts,
    setTexts,
    setSelectedTextId,
    standaloneDots,
    setStandaloneDots,
    randomJitter,
    setRandomJitter,
  } = useCanvasState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];
  const image = activeImage?.file || null;
  const disabled = !image || (!area && !textMode && !dotMode);

  return (
    <main className="flex flex-col gap-2 h-full">
      <section className="flex flex-col gap-3 flex-1 overflow-hidden">
        {/* amount */}
        <Input
          type="text"
          placeholder="Количество точек"
          className=""
          value={amount}
          onChange={(e) => {
            const value = e.target.value;

            const numericValue = value.replace(/\D/g, "");
            setAmount(numericValue);
          }}
          arrows
        />

        {/* size */}
        <>
          <div className="flex flex-row w-full items-center justify-between">
            <span
              className={`${disabled ? "text-white/30 select-none" : "text-text"}`}
            >
              Размер точки:
            </span>
            <span>{size}</span>
          </div>
          <Slider
            min={1}
            max={30}
            step={1}
            className=""
            value={size}
            onValueChange={(e) => setSize(e as number)}
            disabled={disabled}
          />
        </>

        {/* gap */}
        <>
          <div className="flex flex-row w-full items-center justify-between">
            <span
              className={`${disabled ? "text-white/30 select-none" : "text-text"}`}
            >
              Расстояние между точками:
            </span>
            <span>{gap}</span>
          </div>
          <Slider
            min={1}
            max={100}
            step={1}
            className=""
            value={gap}
            onValueChange={(e) => setGap(e as number)}
            disabled={disabled}
          />
        </>

        {/* pading */}
        <>
          <div className="flex flex-row w-full items-center justify-between">
            <span
              className={`${disabled ? "text-white/30 select-none" : "text-text"}`}
            >
              Расстояние от края:
            </span>
            <span>{padding}</span>
          </div>
          <Slider
            min={1}
            max={100}
            step={1}
            className=""
            value={padding}
            onValueChange={(e) => setPadding(e as number)}
            disabled={disabled}
          />
        </>

        {/* rotation */}
        <>
          <div className="flex flex-row w-full items-center justify-between">
            <span
              className={`${disabled ? "text-white/30 select-none" : "text-text"}`}
            >
              Поворот:
            </span>
            <span>{rotation}</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            className=""
            value={rotation}
            onValueChange={(e) => setRotation(e as number)}
            disabled={disabled}
          />
        </>

        {/* random jitter */}
        <>
          <div className="flex flex-row w-full items-center justify-between">
            <span
              className={`${disabled ? "text-white/30 select-none" : "text-text"}`}
            >
              Случайное смещение:
            </span>
            <Switch
              checked={randomJitter}
              onCheckedChange={setRandomJitter}
              disabled={disabled}
            />
          </div>
        </>

        {/* info box */}
        {!disabled && area && results && (
          <section className="flex flex-col gap-1 border rounded p-2 mt-2">
            <div className="flex flex-row w-full items-center justify-between">
              <span>Точек в области:</span>
              <span className="font-medium text-foreground wrap-anywhere">
                {results.length} / {amount || 0}
              </span>
            </div>
          </section>
        )}

        <section className="border rounded flex-1 overflow-hidden">
          <Tabs defaultValue="local" className="flex flex-col h-full">
            <TabsList className="flex flex-row w-full items-center justify-center p-1 rounded-none border-x-0 border-t-0 shrink-0">
              <TabsTrigger value="local">Локальная</TabsTrigger>
              <TabsTrigger value="global">Глобальная</TabsTrigger>
            </TabsList>
            <TabsContent
              value="local"
              className="flex flex-col px-1 gap-2 overflow-y-auto flex-1 mt-2"
            >
              <LocalTab />
            </TabsContent>
            <TabsContent
              value="global"
              className="flex flex-col px-1 gap-2 overflow-y-auto flex-1 mt-2"
            >
              <GlobalTab />
            </TabsContent>
          </Tabs>
        </section>
      </section>

      <section className="flex flex-col w-full gap-2 mb-12">
        <Button
          className="bg-red-500/20 border-red-500 hover:bg-red-500/60"
          onClick={() => {
            if (textMode) {
              setSelectedTextId(null);
              setTexts([]);
            } else {
              setPoints([]);
              setArea(false);
            }
            setEditIndex(-1);
          }}
          disabled={!area && !textMode}
        >
          {editIndex !== -1 ? "Отменить" : "Сбросить"}
        </Button>
        <Button
          className="bg-green-500/20 border-green-500 hover:bg-green-500/60"
          onClick={() => {
            if (!area && !textMode) return;

            const newHistoryItem = {
              dots: results,
              texts: texts,
              standaloneDots: standaloneDots,
              visible: true,
              size: size,
              settings: {
                points: points,
                size: size,
                gap: gap,
                padding: padding,
                rotation: rotation,
              },
            };

            if (editIndex !== -1) {
              const newHistory = [...history];
              newHistory[editIndex] = newHistoryItem;
              updateActiveImageHistory(newHistory);
              setEditIndex(-1);
            } else {
              updateActiveImageHistory([...history, newHistoryItem]);
            }

            setPoints([]);
            setArea(false);
            setTexts([]);
            setStandaloneDots([]);
          }}
          disabled={!area && !textMode}
        >
          {editIndex !== -1 ? "Обновить" : "Сохранить"}
        </Button>
      </section>
    </main>
  );
}
