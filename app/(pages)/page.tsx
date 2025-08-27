"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Path from "../components/Path";
import RightSection from "../components/RightSection";
import Center from "../components/Center";
import { Plus, Image as ImageIcon, Video, FileText, Sparkles, Upload, X } from "lucide-react";
import { compressAndEncodeImage, compressAndEncodeVideo } from "../../lib/imageUtils";

type ValidateResponse = {
    valid: boolean;
    email?: string;
    userNumber?: string;
    [k: string]: any;
};

export default function HomePage() {
    const [activeTab, setActiveTab] = useState("home");
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formType, setFormType] = useState<"text" | "image" | "video" | null>(null);
    const [text, setText] = useState("");
    const [keywords, setKeywords] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>("");

    const router = useRouter();
    // Hide the floating action button when these tabs are active
    const showFab = !['channels', 'groups', 'network'].includes(activeTab.toLowerCase());

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/account/validate-user", { method: "GET", credentials: "include" });
                const data: ValidateResponse = await res.json();
                if (!data.valid) {
                    router.push("/login");
                } else {
                    setUserEmail(data.email || "");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Auth validation failed:", err);
                router.push("/login");
            }
        };
        checkAuth();
    }, [router]);

    const openModal = () => setShowModal(true);
    const closeModal = () => {
        if (!submitting) {
            setShowModal(false);
            setFormType(null);
            setText("");
            setKeywords("");
            setDescription("");
            setImageFile(null);
            setVideoFile(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === "image") {
                setImageFile(file);
            } else {
                setVideoFile(file);
            }
        }
    };

    const handleSubmit = async () => {
        if (!userEmail) {
            setToast("User not authenticated");
            return;
        }

        if (!keywords.trim()) {
            setToast("Please enter keywords");
            return;
        }

        if (!description.trim()) {
            setToast("Please enter a description");
            return;
        }

        let endpoint = "";
        let body: any = {
            userEmail: userEmail,
            keywords: keywords.trim(),
            description: description.trim()
        };

        if (formType === "text") {
            if (!text.trim()) {
                setToast("Please enter a message");
                return;
            }
            endpoint = "/api/content/add-message";
            body.message = text.trim();
        } else if (formType === "image") {
            if (!imageFile) {
                setToast("Please select an image file");
                return;
            }
            endpoint = "/api/content/add-post";
            try {
                const compressedImage = await compressAndEncodeImage(imageFile, 800, 600, 0.7);
                body.imageData = {
                    ...compressedImage,
                    originalSize: imageFile.size
                };
            } catch (err) {
                setToast("Error processing image file");
                return;
            }
        } else if (formType === "video") {
            if (!videoFile) {
                setToast("Please select a video file");
                return;
            }
            endpoint = "/api/content/add-video";
            try {
                const compressedVideo = await compressAndEncodeVideo(videoFile, 0.6);
                body.videoData = compressedVideo.videoData;
                body.thumbnail = {
                    ...compressedVideo.thumbnail,
                    originalSize: videoFile.size
                };
            } catch (err) {
                setToast("Error processing video file");
                return;
            }
        }

        setSubmitting(true);
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (data?.success) {
                const compressionInfo = data.compressionRatio ?
                    ` (${data.compressionRatio}% compressed)` : '';
                setToast(data.message + compressionInfo);
                closeModal();
            } else {
                setToast(data?.message || "Failed to add");
            }
        } catch (err) {
            console.error(err);
            setToast("Server error");
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 2500);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Path onChange={setActiveTab} />
            <RightSection />
            <Center activeTab={activeTab} />
            {/* Floating Action Button */}
            {showFab && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
                    <button
                        onClick={openModal}
                        className="group relative w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
                    >
                        <Plus size={32} className="transition-transform group-hover:rotate-90 duration-300" />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    </button>
                </div>
            )}

            {/* Enhanced Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                            <button
                                onClick={closeModal}
                                disabled={submitting}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-center">Create New Content</h2>
                            <p className="text-blue-100 text-center mt-2">Share your thoughts, images, or videos with the community</p>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {!formType && (
                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => setFormType("text")}
                                        className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                                                <FileText size={24} className="text-blue-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800 group-hover:text-blue-800">Text Post</h3>
                                                <p className="text-sm text-gray-500">Share your thoughts and ideas</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setFormType("image")}
                                        className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                                                <ImageIcon size={24} className="text-green-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800 group-hover:text-green-800">Image Post</h3>
                                                <p className="text-sm text-gray-500">Upload and share images</p>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setFormType("video")}
                                        className="group p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-300 hover:scale-105"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                                                <Video size={24} className="text-purple-600" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-800">Video Post</h3>
                                                <p className="text-sm text-gray-500">Share videos with your audience</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {formType === "text" && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex p-3 rounded-full bg-blue-100 mb-4">
                                            <FileText size={24} className="text-blue-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Create Text Post</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                                        <textarea
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 resize-none"
                                            rows={4}
                                            placeholder="What's on your mind? Share your thoughts..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Sparkles className="inline w-4 h-4 mr-2 text-yellow-500" />
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="AI, ML, Web Development, Technology..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="Brief description of your post..."
                                        />
                                    </div>
                                </div>
                            )}

                            {formType === "image" && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex p-3 rounded-full bg-green-100 mb-4">
                                            <ImageIcon size={24} className="text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Upload Image</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "image")}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium text-green-600 hover:text-green-500">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                            </label>
                                        </div>
                                        {imageFile && (
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800">
                                                    ✓ Selected: {imageFile.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Sparkles className="inline w-4 h-4 mr-2 text-yellow-500" />
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="AI, ML, Web Development, Technology..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="Describe your image..."
                                        />
                                    </div>
                                </div>
                            )}

                            {formType === "video" && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="inline-flex p-3 rounded-full bg-purple-100 mb-4">
                                            <Video size={24} className="text-purple-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Upload Video</h3>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Video</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-300">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => handleFileChange(e, "video")}
                                                className="hidden"
                                                id="video-upload"
                                            />
                                            <label htmlFor="video-upload" className="cursor-pointer">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium text-purple-600 hover:text-purple-500">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI up to 100MB</p>
                                            </label>
                                        </div>
                                        {videoFile && (
                                            <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <p className="text-sm text-purple-800">
                                                    ✓ Selected: {videoFile.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Sparkles className="inline w-4 h-4 mr-2 text-yellow-500" />
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="AI, ML, Web Development, Technology..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <input
                                            type="text"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                                            placeholder="Describe your video..."
                                        />
                                    </div>
                                </div>
                            )}

                            {formType && (
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={closeModal}
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={16} />
                                                <span>Create Post</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed bottom-8 right-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">{toast}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
