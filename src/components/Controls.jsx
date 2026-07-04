import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaFastBackward, FaFastForward } from "react-icons/fa";

export default function Controls({ isPlaying, onPlayPause, onNext, onPrev, onSeekBack, onSeekForward, accentColor }) {
  return (
    <div className="flex items-center justify-center gap-6" style={{ color: accentColor }}>
      <button onClick={onSeekBack} aria-label="Rewind 10 seconds" className="opacity-70 hover:opacity-100 transition">
        <FaFastBackward size={16} />
      </button>
      <button onClick={onPrev} aria-label="Previous song" className="opacity-80 hover:opacity-100 transition">
        <FaStepBackward size={20} />
      </button>
      <button
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition"
        style={{ backgroundColor: accentColor }}
      >
        {isPlaying ? <FaPause size={22} /> : <FaPlay size={22} className="ml-1" />}
      </button>
      <button onClick={onNext} aria-label="Next song" className="opacity-80 hover:opacity-100 transition">
        <FaStepForward size={20} />
      </button>
      <button onClick={onSeekForward} aria-label="Forward 10 seconds" className="opacity-70 hover:opacity-100 transition">
        <FaFastForward size={16} />
      </button>
    </div>
  );
}