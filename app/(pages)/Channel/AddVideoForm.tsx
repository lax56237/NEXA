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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
            <form
                onSubmit={handleSubmit}
                className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5 border border-blue-100"
            >
                <h2 className="text-2xl font-bold text-blue-800 text-center mb-2">📹 Add Video to {channelName}</h2>

                <input
                    className="w-full border border-blue-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white bg-opacity-80"
                    placeholder="Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Thumbnail Image</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleThumbnail} 
                        className="w-full text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-300"
                    />
                    {thumbnailPreview && (
                        <div className="mt-3 flex justify-center">
                            <img src={thumbnailPreview} alt="Thumbnail" className="w-40 h-32 rounded-lg object-cover border-2 border-blue-300 shadow-md" />
                        </div>
                    )}
                </div>

                <div className="bg-white bg-opacity-70 p-3 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Video File</label>
                    <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleVideo} 
                        required 
                        className="w-full text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-300"
                    />
                    <p className="text-xs text-gray-600 mt-2 italic">Video will be uploaded to server storage.</p>
                </div>

                <textarea
                    className="w-full border border-blue-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white bg-opacity-80 min-h-[100px]"
                    placeholder="Optional description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-between gap-4 pt-4">
                    <button type="button" onClick={onClose} className="px-5 py-3 bg-white border border-blue-300 rounded-lg hover:bg-gray-100 transition-colors duration-300 font-medium text-blue-800 shadow-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? "Uploading..." : "Add Video"}
                    </button>
                </div>
            </form>
        </div>
    );
}
