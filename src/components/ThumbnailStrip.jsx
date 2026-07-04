import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const VISIBLE = 4;
const GAP = 12; // px, matches gap-3

export default function ThumbnailStrip({
  songs,
  currentIndex,
  onSelect,
  accentColor,
}) {
  const containerRef = useRef(null);
  const [itemWidth, setItemWidth] = useState(0);
  const [x, setX] = useState(0);

  // measure container to compute item width for exactly 4 visible
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const w = (width - GAP * (VISIBLE - 1)) / VISIBLE;
      setItemWidth(w);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const trackWidth = songs.length * itemWidth + (songs.length - 1) * GAP;
  const containerWidth = itemWidth * VISIBLE + GAP * (VISIBLE - 1);
  const maxDrag = Math.min(0, containerWidth - trackWidth);

  // keep current thumbnail within the visible 4-window whenever it changes
  useEffect(() => {
    if (!itemWidth) return;
    const itemLeft = currentIndex * (itemWidth + GAP);
    const itemRight = itemLeft + itemWidth;
    const visibleLeft = -x;
    const visibleRight = visibleLeft + containerWidth;

    let newX = x;
    if (itemLeft < visibleLeft) {
      newX = -itemLeft;
    } else if (itemRight > visibleRight) {
      newX = -(itemRight - containerWidth);
    }
    newX = Math.max(maxDrag, Math.min(0, newX));
    setX(newX);
  }, [currentIndex, itemWidth]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="overflow-hidden">
      <motion.div
        className="flex"
        style={{ gap: GAP }}
        drag="x"
        dragConstraints={{ left: maxDrag, right: 0 }}
        dragElastic={0.15}
        animate={{ x }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        onDragEnd={(e, info) => {
          const newX = Math.max(maxDrag, Math.min(0, x + info.offset.x));
          setX(newX);
        }}
      >
        {songs.map((song, i) => (
          <button
            key={song.id}
            onClick={() => onSelect(i)}
            className="flex flex-col items-center gap-1.5 shrink-0"
            style={{ width: itemWidth }}
          >
            <div
              className="w-full aspect-square rounded-2xl overflow-hidden border-2 pointer-events-none"
              style={{
                borderColor: i === currentIndex ? accentColor : "transparent",
              }}
            >
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <span className="text-[11px] text-gray-500 truncate w-full text-center pointer-events-none">
              {song.title}
            </span>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
