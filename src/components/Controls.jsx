import { FaPlay, FaPause, FaStepBackward, FaStepForward } from "react-icons/fa";
import {
  RiForward10Fill,
  RiReplay10Fill,
  RiRepeatFill,
  RiRepeatOneFill,
} from "react-icons/ri";

export default function Controls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onSeekBack,
  onSeekForward,
  accentColor,
  isLooping,
  onToggleLoop,
}) {
  return (
    <div
      className="flex items-center justify-between"
      style={{ color: accentColor }}
    >
      <button
        onClick={onToggleLoop}
        aria-label="Toggle loop"
        className="opacity-70 hover:opacity-100 transition"
        style={{ opacity: isLooping ? 1 : 0.4 }}
      >
        {isLooping ? <RiRepeatOneFill size={18} /> : <RiRepeatFill size={18} />}
      </button>
      <div className="flex items-center gap-5">
        <button
          onClick={onSeekBack}
          aria-label="Rewind 10 seconds"
          className="opacity-70 hover:opacity-100 transition"
        >
          <RiReplay10Fill size={20} />
        </button>
        <button
          onClick={onPrev}
          aria-label="Previous song"
          className="opacity-80 hover:opacity-100 transition"
        >
          <FaStepBackward size={18} />
        </button>
        <button
          onClick={onPlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition"
          style={{ backgroundColor: accentColor }}
        >
          {isPlaying ? (
            <FaPause size={22} />
          ) : (
            <FaPlay size={22} className="ml-1" />
          )}
        </button>
        <button
          onClick={onNext}
          aria-label="Next song"
          className="opacity-80 hover:opacity-100 transition"
        >
          <FaStepForward size={18} />
        </button>
        <button
          onClick={onSeekForward}
          aria-label="Forward 10 seconds"
          className="opacity-70 hover:opacity-100 transition"
        >
          <RiForward10Fill size={20} />
        </button>
      </div>
      <div className="w-[18px]" />{" "}
      {/* spacer to balance the loop icon on the left */}
    </div>
  );
}
