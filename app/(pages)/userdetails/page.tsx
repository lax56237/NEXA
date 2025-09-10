'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Save, ArrowRight, Star, Sparkles, Image as ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";

const categories = {
    Student: ["High School", "College", "Postgraduate"],
    Professional: ["Developer", "Designer", "Doctor", "Engineer"],
    Sports: ["Football", "Basketball", "Cricket", "Tennis"],
    Movies: ["Action", "Comedy", "Drama", "Sci-Fi"],
    Singing: ["Vocals", "Guitar", "Piano", "Drums"],
    Gaming: ["PC", "Console", "Mobile", "Esports"],
    Travel: ["Adventure", "Beach", "Mountains", "Historical"],
    Food: ["Vegan", "Non-Veg", "Desserts", "Street Food"],
    Technology: ["AI", "Blockchain", "Web Dev", "Mobile Dev"],
    Art: ["Painting", "Sketching", "Photography", "Dance"]
};

export default function UserDetailPage() {
    const [username, setUsername] = useState("");
    const [selected, setSelected] = useState<{ topic: string; value: number }[]>([]);
    const [profilePicture, setProfilePicture] = useState<string>(""); // base64
    const router = useRouter();

    const toggleInterest = (category: string, sub: string) => {
        const topic = `${category} - ${sub}`;
        const exists = selected.find(i => i.topic === topic);
        if (exists) {
            setSelected(selected.filter(i => i.topic !== topic));
        } else {
            setSelected([...selected, { topic, value: 0 }]);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
            setProfilePicture(base64);
        } catch (err) {
            console.error("Error compressing image:", err);
        }
    };

    const saveDetails = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/account/createuserdetails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                username,
                interests: selected,
                extraDetails: [],
                profilePicture, // send compressed image
            }),
        });

        const data = await res.json();
        if (data.success) {
            const res2 = await fetch("/api/account/createuserprofile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username }),
            });

            const profileData = await res2.json();
            console.log("user profile : ", profileData);

            if (profileData.success) {
                router.push("/user");
            } else {
                alert("Profile creation failed: " + profileData.error);
            }
        } else {
            alert("Failed to save details: " + data.error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Complete Your Profile
                    </h1>
                    <p className="text-gray-600 text-lg">Tell us about yourself to personalize your NEXA experience</p>
                </div>

                {/* Username input */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <User size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Choose Your Username</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter a unique username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 text-lg"
                            />
                            <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">This will be your unique identifier on NEXA</p>
                    </div>
                </div>

                {/* Profile picture upload */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <ImageIcon size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Upload Profile Picture</h2>
                        </div>
                        <p className="text-purple-100 mt-2">Choose a profile picture (compressed automatically)</p>
                    </div>

                    <div className="p-8">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="block w-full text-sm text-gray-500 
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-gradient-to-r file:from-purple-600 file:to-indigo-600 
                                       file:text-white hover:file:opacity-90"
                        />

                        {profilePicture && (
                            <div className="mt-4">
                                <img
                                    src={profilePicture}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-full border-2 border-purple-400 shadow-md"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Interests */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <Star size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Select Your Interests</h2>
                        </div>
                        <p className="text-blue-100 mt-2">Choose topics that interest you to get personalized content</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {Object.entries(categories).map(([cat, subs]) => (
                                <div key={cat} className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-gray-800">{cat}</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {subs.map(sub => {
                                            const topic = `${cat} - ${sub}`;
                                            const isActive = selected.some(i => i.topic === topic);
                                            return (
                                                <button
                                                    key={sub}
                                                    onClick={() => toggleInterest(cat, sub)}
                                                    className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 font-medium ${isActive
                                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-600 shadow-lg scale-105"
                                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                        }`}
                                                >
                                                    {sub}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selected.length > 0 && (
                            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Sparkles size={20} className="text-blue-600" />
                                        <span className="text-blue-800 font-medium">
                                            {selected.length} interest{selected.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                    <div className="text-sm text-blue-600">
                                        Great choices! 🎉
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save button */}
                <div className="text-center">
                    <button
                        onClick={saveDetails}
                        disabled={!username.trim() || selected.length === 0 || !profilePicture}
                        className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <Save size={20} />
                        <span>Save & Continue</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>

                    {(!username.trim() || selected.length === 0 || !profilePicture) && (
                        <p className="text-gray-500 mt-4 text-sm">
                            Please enter a username, select at least one interest, and upload a profile picture to continue
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
