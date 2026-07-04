import { useState, useEffect, useRef } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { Reorder } from "framer-motion";
import {
  FiUpload,
  FiCheckCircle,
  FiMenu,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
} from "react-icons/fi";
import { db } from "../firebase.js";
import { uploadToCloudinary } from "../uploadToCloudinary.js";
import PinGate from "../components/PinGate.jsx";

const ACCENT = "#7C5CFC";
const emptyForm = { title: "", artist: "", bgColor: "#eee6f7" };

function getAudioDuration(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      resolve(audio.duration);
      URL.revokeObjectURL(url);
    });
  });
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("admin_unlocked") === "true",
  );
  const [songs, setSongs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const coverInputRef = useRef(null);
  const audioInputRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "songs"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setSongs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setCoverFile(null);
    setCoverPreview(null);
    setAudioFile(null);
    setEditingId(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) setAudioFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let coverUrl = form.coverUrl;
      let audioUrl = form.audioUrl;
      let duration = form.duration;

      if (coverFile) coverUrl = await uploadToCloudinary(coverFile);
      if (audioFile) {
        audioUrl = await uploadToCloudinary(audioFile);
        duration = await getAudioDuration(audioFile);
      }

      const payload = {
        title: form.title,
        artist: form.artist,
        bgColor: form.bgColor,
        coverUrl,
        audioUrl,
        duration: duration || null,
      };

      if (editingId) {
        await updateDoc(doc(db, "songs", editingId), payload);
      } else {
        if (!coverUrl || !audioUrl) {
          alert("Please select both a cover image and an audio file.");
          setUploading(false);
          return;
        }
        const maxOrder = songs.reduce(
          (max, s) => Math.max(max, s.order ?? 0),
          0,
        );
        await addDoc(collection(db, "songs"), {
          ...payload,
          order: maxOrder + 1,
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check the console.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (song) => {
    setForm({
      title: song.title,
      artist: song.artist,
      bgColor: song.bgColor,
      coverUrl: song.coverUrl,
      audioUrl: song.audioUrl,
      duration: song.duration,
    });
    setCoverPreview(song.coverUrl);
    setEditingId(song.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this song?")) return;
    await deleteDoc(doc(db, "songs", id));
  };

  const handleReorder = (newOrder) => setSongs(newOrder);

  const commitOrder = async () => {
    const batch = writeBatch(db);
    songs.forEach((song, i) => {
      batch.update(doc(db, "songs", song.id), { order: i + 1 });
    });
    await batch.commit();
  };

  if (!unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <a
            href="/"
            className="flex items-center justify-center w-9 h-9 rounded-full shrink-0 transition"
            style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
          >
            <FiArrowLeft size={18} />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Your Songs
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-6 mb-8 space-y-5"
        >
          <h2 className="font-semibold text-gray-800">
            {editingId ? "Edit song" : "Add new song"}
          </h2>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Artist</label>
            <input
              value={form.artist}
              onChange={(e) => setForm({ ...form, artist: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Background color
            </label>
            <input
              type="color"
              value={form.bgColor}
              onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
              className="w-full h-full cursor-pointer border-0 outline-none"
              style={{ padding: 0 }}
            />
          </div>

          {/* Cover upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Cover image
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition"
                style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
              >
                <FiUpload size={15} />
                Choose image
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-24 h-24 rounded-2xl object-cover shadow"
                />
              )}
            </div>
            {editingId && !coverFile && (
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to keep current cover
              </p>
            )}
          </div>

          {/* Audio upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Audio file
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition"
                style={{ backgroundColor: `${ACCENT}1A`, color: ACCENT }}
              >
                <FiUpload size={15} />
                Choose audio
              </button>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="hidden"
              />
              {audioFile && (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium truncate max-w-[200px]">
                  <FiCheckCircle size={16} className="shrink-0" />
                  <span className="truncate">{audioFile.name}</span>
                </span>
              )}
            </div>
            {editingId && !audioFile && (
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to keep current audio
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {uploading
                ? "Uploading..."
                : editingId
                  ? "Save changes"
                  : "Add song"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Reorderable list */}
        <h2 className="text-sm font-semibold text-gray-500 mb-2 px-1">
          Current Songs
        </h2>
        <Reorder.Group
          axis="y"
          values={songs}
          onReorder={handleReorder}
          className="bg-white rounded-2xl shadow overflow-hidden"
        >
          {songs.map((song) => (
            <Reorder.Item
              key={song.id}
              value={song}
              onDragEnd={commitOrder}
              className="flex items-center gap-3 p-4 border-b border-gray-50 last:border-b-0 bg-white cursor-grab active:cursor-grabbing"
            >
              <FiMenu className="text-gray-300 shrink-0" size={18} />
              <img
                src={song.coverUrl}
                alt={song.title}
                className="w-20 h-20 rounded-2xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {song.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDuration(song.duration)}
                </p>
              </div>
              <div
                className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                style={{ backgroundColor: song.bgColor }}
              />
              <button
                onClick={() => handleEdit(song)}
                className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg shrink-0 hover:bg-green-100 transition"
              >
                <FiEdit2 size={13} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(song.id)}
                className="flex items-center gap-1 text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg shrink-0 hover:bg-red-100 transition"
              >
                <FiTrash2 size={13} />
                Delete
              </button>
            </Reorder.Item>
          ))}
          {!songs.length && (
            <p className="p-4 text-sm text-gray-400">No songs yet.</p>
          )}
        </Reorder.Group>
      </div>
    </div>
  );
}
