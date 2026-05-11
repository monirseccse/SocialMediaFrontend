"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { createPost } from "@/lib/api";
import { PostVisibility } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";

interface CreatePostProps {
  onCreated: () => void;
}

export default function CreatePost({ onCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<PostVisibility>(PostVisibility.Public);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB."); return; }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  function removeImage() {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    if (!content.trim() && !image) { setError("Write something or add a photo."); return; }
    setError("");
    setSubmitting(true);
    try {
      await createPost({ content: content.trim(), image: image ?? undefined, visibility });
      setContent("");
      removeImage();
      setVisibility(PostVisibility.Public);
      onCreated();
    } catch {
      setError("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="bg-white rounded-[6px] px-6 pb-6 pt-6 mb-4"
      style={{ boxShadow: "var(--shadow1)" }}
    >
      {/* Textarea row */}
      <div className="flex gap-3">
        {user && <Avatar name={user.name} size="md" className="flex-shrink-0" />}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); setError(""); }}
            rows={3}
            placeholder="Write something ..."
            className="w-full rounded-[6px] px-4 pt-3 pb-3 text-sm border transition-colors"
            style={{
              background: "var(--bg3)",
              borderColor: "var(--bg3)",
              color: "var(--color)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--bg3)")}
          />
          {/* Visibility toggle inside textarea area */}
          <div className="absolute top-2 right-2 flex rounded overflow-hidden border" style={{ borderColor: "var(--bg4)" }}>
            <button
              onClick={() => setVisibility(PostVisibility.Public)}
              className="px-2 py-0.5 text-xs font-medium transition-colors"
              style={{
                background: visibility === PostVisibility.Public ? "var(--color5)" : "var(--bg2)",
                color: visibility === PostVisibility.Public ? "#fff" : "var(--color7)",
              }}
            >
              Public
            </button>
            <button
              onClick={() => setVisibility(PostVisibility.Private)}
              className="px-2 py-0.5 text-xs font-medium transition-colors"
              style={{
                background: visibility === PostVisibility.Private ? "var(--color5)" : "var(--bg2)",
                color: visibility === PostVisibility.Private ? "#fff" : "var(--color7)",
              }}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mt-3 rounded-[6px] overflow-hidden">
          <div className="relative w-full aspect-video bg-gray-100">
            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2 ml-[52px]">{error}</p>}

      {/* Action bar */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Photo */}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 px-3 py-2 rounded-[6px] text-sm hover:bg-gray-100 transition-colors"
            style={{ color: "var(--color7)" }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z" />
            </svg>
            Photo
          </button>
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-[6px] text-sm hover:bg-gray-100 transition-colors"
            style={{ color: "var(--color7)" }}
          >
            <svg width="22" height="24" fill="none" viewBox="0 0 22 24">
              <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726zm0 1.5H5.76C4.169 6 3.197 7.05 3.197 8.688v7.015c0 1.636.972 2.688 2.562 2.688h5.726c1.586 0 2.562-1.054 2.562-2.688v-.686-6.329c0-1.636-.973-2.688-2.562-2.688zM18.4 8.57l-.062.02-2.921 1.306v4.596l2.921 1.307c.165.073.343-.036.38-.215l.008-.07V8.876c0-.195-.16-.334-.326-.305z" />
            </svg>
            Video
          </button>
        </div>

        {/* Post button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || (!content.trim() && !image)}
          className="flex items-center gap-2 px-5 py-2 rounded-[6px] text-sm font-medium text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--color5)" }}
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="14" height="13" fill="none" viewBox="0 0 14 13">
              <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zm2.727 5.121c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
            </svg>
          )}
          Post
        </button>
      </div>
    </div>
  );
}
