import {
  calculatePercentage,
  calculateProportions,
  getPolygonArea,
} from "@/lib/utils";
import { Points } from "@/types";
import {
  Edit,
  EllipsisVertical,
  Eye,
  EyeOff,
  Grip,
  Percent,
  Trash,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useCanvasState } from "@/context/canvas.context";

export default function localHistory() {
  const {
    amount,
    setAmount,
    setPoints,
    setSize,
    setGap,
    setPadding,
    setRotation,
    setArea,
    editIndex,
    setEditIndex,
    imageHistory,
    activeImageId,
    updateActiveImageHistory,
  } = useCanvasState();

  const activeImage = imageHistory.find((img) => img.id === activeImageId);
  const history = activeImage?.editHistory || [];
  const [isHovering, setIsHovering] = useState(false);

  const toggleHistoryVisibility = (index: number) => {
    const newHistory = [...history];
    newHistory[index].visible = !newHistory[index].visible;
    updateActiveImageHistory(newHistory);
  };

  const editHistoryItem = (index: number) => {
    const item = history[index];
    if (!item?.settings) return;

    setAmount(item.dots.length.toString());
    setSize(item.settings.size);
    setGap(item.settings.gap);
    setPadding(item.settings.padding);
    setRotation(item.settings.rotation);
    setPoints(item.settings.points);
    setArea(true);
    setEditIndex(index);
  };

  const getPercentage = useCallback(
    (points: Points[]) => {
      const allAreas = history.map((item) =>
        getPolygonArea(item.settings.points),
      );
      return calculatePercentage(getPolygonArea(points), allAreas);
    },
    [history],
  );

  if (history.length === 0) {
    return <span className="text-2xl text-center">Пока нет данных</span>;
  }

  return history.map((item, index) => (
    <section
      key={index}
      className="flex flex-row w-full h-14 min-h-14 border rounded"
    >
      <span className="font-bold border-r h-full items-center flex p-1">
        Область {index + 1}
      </span>
      <span className="font-bold border-r h-full flex w-16 p-1 items-center justify-between">
        <EllipsisVertical />
        {item.dots.length}
      </span>
      <span
        className="font-bold border-r h-full flex w-16 p-1 items-center justify-center select-none"
        onMouseOver={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {!isHovering ? (
          <div className="flex flex-row w-full items-center justify-between">
            <Percent />
            {getPercentage(item.settings.points)}%
          </div>
        ) : (
          <div className="flex flex-row w-full items-center justify-between">
            <Grip />
            {
              calculateProportions(
                Number(amount),
                history.map((i) => getPercentage(i.settings.points)),
              )[index]
            }
          </div>
        )}
      </span>

      <div className="flex flex-row ml-auto p-2 h-full items-center justify-center gap-2">
        <button
          className={`cursor-pointer ${editIndex === index ? "text-primary" : ""}`}
          onClick={() => editHistoryItem(index)}
        >
          <Edit />
        </button>
        <button
          className="cursor-pointer"
          onClick={() => toggleHistoryVisibility(index)}
        >
          {item.visible ? <Eye /> : <EyeOff />}
        </button>
        <button
          className="cursor-pointer"
          onClick={() => {
            updateActiveImageHistory([
              ...history.slice(0, index),
              ...history.slice(index + 1),
            ]);
          }}
        >
          <Trash />
        </button>
      </div>
    </section>
  ));
}
