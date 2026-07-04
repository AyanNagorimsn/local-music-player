import { motion } from "framer-motion";

export default function CoverArt({ src, alt, isPlaying }) {
  return (
    <div className="w-full aspect-square mb-4 pointer-events-none flex items-center justify-center">
      <motion.div
        className="w-full h-full shadow-lg overflow-hidden"
        animate={
          isPlaying
            ? {
                borderRadius: [
                  "42% 58% 63% 37% / 41% 42% 58% 59%",
                  "58% 42% 37% 63% / 55% 60% 40% 45%",
                  "42% 58% 63% 37% / 41% 42% 58% 59%",
                ],
                rotate: [0, 3, -3, 0],
                scale: [1, 1.03, 1],
              }
            : { borderRadius: "1.5rem", rotate: 0, scale: 1 }
        }
        transition={
          isPlaying
            ? { duration: 8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5, ease: "easeOut" }
        }
      >
        <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} />
      </motion.div>
    </div>
  );
}