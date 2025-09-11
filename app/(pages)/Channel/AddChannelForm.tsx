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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Create New Channel</h2>

                <input
                    className="w-full border p-2 mb-2 rounded"
                    placeholder="Channel Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <textarea
                    className="w-full border p-2 mb-2 rounded"
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mb-3"
                    required
                />

                {profileImage && (
                    <img src={profileImage} alt="preview" className="w-24 h-24 rounded-full mx-auto mb-3" />
                )}

                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>
        </div>
    );
}
