export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
  accentColor,
}) {
  const format = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className="flex items-center gap-3 w-full"
      style={{ color: accentColor }}
    >
      <span className="text-xs font-medium opacity-70 w-10">
        {format(currentTime)}
      </span>
      <input
        type="range"
        className="seek flex-1"
        min={0}
        max={duration || 0}
        value={currentTime || 0}
        onChange={(e) => onSeek(Number(e.target.value))}
      />
      <span className="text-xs font-medium opacity-70 w-10 text-right">
        {format(duration)}
      </span>
    </div>
  );
}
