import { motion } from "framer-motion";
import { useMemo } from "react";

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hsl(h, s, l) {
  return `hsl(${((h % 360) + 360) % 360}, ${Math.min(Math.max(s, 0), 100)}%, ${Math.min(Math.max(l, 0), 100)}%)`;
}

export default function AnimatedBackground({ color, isPlaying }) {
  const colors = useMemo(() => {
    const [h, s, l] = hexToHsl(color);
    return {
      a: hsl(h - 15, s * 0.9, Math.min(l + 16, 92)),
      b: hsl(h, s, l),
      c: hsl(h + 18, s * 0.85, Math.max(l - 12, 20)),
      base: hsl(h, s * 0.35, 94),
    };
  }, [color]);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: colors.base }}
    >
      <motion.div
        className="absolute inset-[-40%]"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.a}, transparent 55%),
                       radial-gradient(circle at 70% 60%, ${colors.b}, transparent 50%),
                       radial-gradient(circle at 40% 80%, ${colors.c}, transparent 55%)`,
          filter: "blur(35px)",
        }}
        animate={
          isPlaying
            ? {
                rotate: [0, 20, -15, 10, 0],
                scale: [1, 1.25, 1.1, 1.3, 1],
                x: [0, 40, -30, 25, 0],
                y: [0, -35, 25, -20, 0],
              }
            : { rotate: 0, scale: 1, x: 0, y: 0 }
        }
        transition={
          isPlaying
            ? { duration: 10, repeat: Infinity, ease: "easeInOut" }
            : { duration: 1, ease: "easeOut" }
        }
      />

      <svg className="absolute inset-0 w-full h-full opacity-[0.15] mix-blend-overlay pointer-events-none">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}
