"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";

type Props = {
    channelName: string;
    onClose: () => void;
    onAdded: (channelDoc: any) => void;
};

export default function AddVideoForm({ channelName, onClose, onAdded }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // Compress thumbnail
    const handleThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 800, useWebWorker: true };
            const compressed = await imageCompression(file, options);
            setThumbnailFile(compressed);
            const base64 = await imageCompression.getDataUrlFromFile(compressed);
            setThumbnailPreview(base64);
        } catch (err) {
            console.error(err);
            alert("Thumbnail compression failed");
        }
    };

    const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setVideoFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !videoFile) return alert("Title and video are required");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("channelName", channelName);
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
            formData.append("video", videoFile);

            const res = await fetch("/api/channel/addVideo", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            if (data.success) {
                onAdded(data.channel);
                onClose();
            } else {
                alert(data.error || "Failed to add video");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Error adding video");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4"
            >
                <h2 className="text-xl font-bold">📹 Add Video to {channelName}</h2>

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <label className="block text-sm font-medium mt-2">Thumbnail Image</label>
                <input type="file" accept="image/*" onChange={handleThumbnail} />
                {thumbnailPreview && (
                    <img src={thumbnailPreview} alt="Thumbnail" className="w-32 h-32 rounded mt-2" />
                )}

                <label className="block text-sm font-medium mt-2">Video File</label>
                <input type="file" accept="video/*" onChange={handleVideo} required />
                <p className="text-xs text-gray-500">Video will be uploaded to server storage.</p>

                <textarea
                    className="w-full border p-2 rounded mt-2"
                    placeholder="Optional description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
                        {loading ? "Uploading..." : "Add Video"}
                    </button>
                </div>
            </form>
        </div>
    );
}
