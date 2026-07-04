export default function ThumbnailStrip({ songs, currentIndex, onSelect, accentColor }) {
  return (
    <div className="flex gap-3">
      {songs.map((song, i) => (
        <button
          key={song.id}
          onClick={() => onSelect(i)}
          className="flex flex-col items-center gap-1 w-16 shrink-0"
        >
          <div
            className="w-14 h-14 rounded-xl overflow-hidden border-2 transition"
            style={{ borderColor: i === currentIndex ? accentColor : "transparent" }}
          >
            <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
          </div>
          <span className="text-[10px] text-gray-500 truncate w-full text-center">{song.title}</span>
        </button>
      ))}
    </div>
  );
}