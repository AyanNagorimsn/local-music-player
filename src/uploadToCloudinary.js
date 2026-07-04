const CLOUD_NAME = "kzoubt0p";
const UPLOAD_PRESET = "music_uploads";

export async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url; // hosted file URL, use for coverUrl or audioUrl
}