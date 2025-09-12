"use client";
import { useState } from "react";
import imageCompression from "browser-image-compression";

type Props = {
    onClose: () => void;
    onCreated: (channelDoc: any) => void;
};

export default function AddChannelForm({ onClose, onCreated }: Props) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const options = { maxSizeMB: 0.3, maxWidthOrHeight: 600, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
            setProfileImage(base64);
        } catch (err) {
            console.error("image compress err", err);
            alert("Image compression failed. Try a smaller image.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !profileImage) return alert("Name + profile image required");
        setLoading(true);
        try {
            const res = await fetch("/api/channel/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: name.trim(), description: description.trim(), profileImage }),
            });
            const data = await res.json();
            if (data.success) {
                onCreated(data.channel);
            } else {
                alert("Create channel error: " + (data.error || "unknown"));
            }
        } catch (err) {
            console.error(err);
            alert("Network error while creating channel");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl shadow-xl w-96 border border-blue-100">
                <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">Create New Channel</h2>

                <input
                    className="w-full border border-blue-200 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white bg-opacity-80"
                    placeholder="Channel Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <textarea
                    className="w-full border border-blue-200 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white bg-opacity-80 min-h-[100px]"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="mb-4 bg-white bg-opacity-70 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2 font-medium">Profile Image</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-300"
                        required
                    />
                </div>

                {profileImage && (
                    <div className="mb-6 flex justify-center">
                        <img src={profileImage} alt="preview" className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-md" />
                    </div>
                )}

                <div className="flex justify-between gap-4 mt-6">
                    <button type="button" onClick={onClose} className="px-5 py-3 bg-white border border-blue-300 rounded-lg hover:bg-gray-100 transition-colors duration-300 font-medium text-blue-800 shadow-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}
