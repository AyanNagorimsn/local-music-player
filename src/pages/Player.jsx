import { useState, useEffect, useRef, useCallback } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { db } from "../firebase.js";
import Controls from "../components/Controls.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import ThumbnailStrip from "../components/ThumbnailStrip.jsx";
import CoverArt from "../components/CoverArt.jsx";

import AnimatedBackground from "../components/AnimatedBackground.jsx";

const ACCENT = "#7C5CFC"; // theme purple, matches PIN screen

export default function Player() {
  const [songs, setSongs] = useState([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState({});
  const [direction, setDirection] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "songs"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setSongs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const song = songs[index];

  useEffect(() => {
    if (!audioRef.current || !song) return;
    setCurrentTime(0);
    audioRef.current.load();
    if (isPlaying) audioRef.current.play().catch(() => {});
  }, [index, song]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  const goTo = useCallback(
    (newIndex, dir) => {
      if (!songs.length) return;
      const wrapped = (newIndex + songs.length) % songs.length;
      setDirection(dir);
      setIndex(wrapped);
    },
    [songs.length],
  );

  const handleNext = () => goTo(index + 1, 1);
  const handlePrev = () => goTo(index - 1, -1);

  const handleDragEnd = (e, info) => {
    const threshold = 80;
    if (info.offset.x < -threshold || info.velocity.x < -500) handleNext();
    else if (info.offset.x > threshold || info.velocity.x > 500) handlePrev();
  };

  const handleSeek = (t) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const seekBy = (delta) => {
    if (!audioRef.current) return;
    const t = Math.min(
      Math.max(audioRef.current.currentTime + delta, 0),
      duration || 0,
    );
    handleSeek(t);
  };

  const toggleLike = () => {
    if (!song) return;
    setLiked((prev) => ({ ...prev, [song.id]: !prev[song.id] }));
  };

  if (!songs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7FB] text-gray-400 text-sm">
        No songs yet.
      </div>
    );
  }

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground
        color={song?.bgColor || "#eee6f7"}
        isPlaying={isPlaying}
      />

      <audio
        ref={audioRef}
        src={song?.audioUrl}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={handleNext}
      />

      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl p-5 overflow-hidden">
        <motion.div
          key={song.id}
          custom={direction}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={handleDragEnd}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            <motion.div key={song.id + "-inner"}>
              <CoverArt
                src={song.coverUrl}
                alt={song.title}
                isPlaying={isPlaying}
              />

              <div className="mb-4 px-1">
                {song.artist && (
                  <p className="text-xs text-gray-500 mb-1">{song.artist}</p>
                )}
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900 truncate pr-2">
                    {song.title}
                  </h1>
                  <button onClick={toggleLike} aria-label="Like">
                    <FiHeart
                      size={20}
                      className={
                        liked[song.id] ? "text-[#7C5CFC]" : "text-gray-300"
                      }
                      fill={liked[song.id] ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="mb-5 overflow-x-auto scrollbar-hide">
          <ThumbnailStrip
            songs={songs}
            currentIndex={index}
            onSelect={(i) => goTo(i, i > index ? 1 : -1)}
            accentColor={ACCENT}
          />
        </div>

        <div className="mb-4 px-1">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            accentColor={ACCENT}
          />
        </div>

        <Controls
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onNext={handleNext}
          onPrev={handlePrev}
          onSeekBack={() => seekBy(-10)}
          onSeekForward={() => seekBy(10)}
          accentColor={ACCENT}
        />
      </div>
    </div>
  );
}
