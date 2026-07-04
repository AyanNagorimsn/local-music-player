import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimation,
} from "framer-motion";
import { useRef, useEffect } from "react";

const TRACK_HEIGHT = 120;
const THUMB_SIZE = 16;

export default function VolumeSlider({
  visible,
  volume,
  onChange,
  accentColor,
  onClose,
}) {
  const trackRef = useRef(null);
  const y = useMotionValue(0); // 0 = top, TRACK_HEIGHT = bottom
  const controls = useAnimation();
  const draggingRef = useRef(false);

  // volume -> y position (only when not actively dragging, e.g. external changes)
  useEffect(() => {
    if (draggingRef.current) return;
    const targetY = TRACK_HEIGHT - (volume / 100) * TRACK_HEIGHT;
    controls.start({
      y: targetY,
      transition: { type: "spring", stiffness: 400, damping: 32 },
    });
    y.set(targetY);
  }, [volume, visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const yToVolume = (val) => {
    const clamped = Math.min(Math.max(val, 0), TRACK_HEIGHT);
    return Math.round(((TRACK_HEIGHT - clamped) / TRACK_HEIGHT) * 100);
  };

  const handleTrackTap = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const relY = clientY - rect.top;
    const vol = yToVolume(relY);
    onChange(vol);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 bg-white rounded-2xl shadow-xl px-3 py-3"
          >
            <span
              className="text-xs font-semibold"
              style={{ color: accentColor }}
            >
              {volume}
            </span>

            <div
              ref={trackRef}
              className="relative w-2 rounded-full bg-gray-100 cursor-pointer touch-none"
              style={{ height: TRACK_HEIGHT }}
              onClick={handleTrackTap}
            >
              {/* filled portion, derived straight from volume prop */}
              <div
                className="absolute bottom-0 left-0 w-full rounded-full pointer-events-none"
                style={{ backgroundColor: accentColor, height: `${volume}%` }}
              />

              {/* draggable thumb, position driven by motion value y (0 = top of track) */}
              <motion.div
                className="absolute left-1/2 rounded-full shadow-md cursor-grab active:cursor-grabbing"
                style={{
                  backgroundColor: accentColor,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  x: "-50%",
                  y,
                  top: -THUMB_SIZE / 2,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: TRACK_HEIGHT }}
                dragElastic={0}
                dragMomentum={false}
                animate={controls}
                onDragStart={() => {
                  draggingRef.current = true;
                }}
                onDrag={() => {
                  onChange(yToVolume(y.get()));
                }}
                onDragEnd={() => {
                  draggingRef.current = false;
                }}
                whileTap={{ scale: 1.3 }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
