'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Hash, Calendar, Clock, Star, Settings, Home, ArrowLeft } from "lucide-react";

export default function UserPage() {
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await fetch("/api/account/getUserDetail", {
                    credentials: "include"
                });

                const data = await res.json();
                console.log("user details : ", data);

                if (!data.valid) {
                    router.push("/login");
                } else {
                    setDetails(data.details);
                }
            } catch (err) {
                console.error("❌ Error fetching user details:", err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                        <User size={24} className="text-red-600" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700">No details found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Your Profile
                    </h1>
                    <p className="text-gray-600 text-lg">Manage your NEXA account and preferences</p>
                </div>
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => router.push("/usercontent")}
                        className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                    >
                        View Your Content
                    </button>
                </div>

                <div className="mb-8">
                    <a
                        href="/"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-4 py-2 rounded-xl transition-all duration-300"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Home</span>
                    </a>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center space-x-4">
                            <div className="p-4 rounded-full bg-white/20">
                                <User size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">{details.username}</h2>
                                <p className="text-blue-100 text-lg">NEXA Member</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <Mail size={20} className="text-blue-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email Address</p>
                                        <p className="font-semibold text-gray-800">{details.userEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <Hash size={20} className="text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">User Number</p>
                                        <p className="font-semibold text-gray-800">{details.userNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar size={20} className="text-purple-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Member Since</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(details.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                                    <Clock size={20} className="text-indigo-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Last Updated</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(details.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                <Clock size={20} className="mr-2" />
                                Account Timeline
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-sm">
                                    <span className="text-blue-600 font-medium">Created:</span>
                                    <span className="text-gray-700 ml-2">
                                        {new Date(details.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-blue-600 font-medium">Updated:</span>
                                    <span className="text-gray-700 ml-2">
                                        {new Date(details.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <Star size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Your Interests</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {details.interests && details.interests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {details.interests.map((i: any) => (
                                    <div key={i._id} className="p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-green-800">{i.topic}</span>
                                            <span className="text-sm text-green-600 bg-green-200 px-2 py-1 rounded-full">
                                                {i.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                                    <Star size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No interests added yet</p>
                                <p className="text-gray-400 text-sm mt-2">Start exploring content to build your interest profile</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-white/20">
                                <Settings size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Additional Details</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {details.extraDetails && details.extraDetails.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {details.extraDetails.map((e: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors duration-300">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-purple-800">{e.key}</span>
                                            <span className="text-sm text-purple-600 bg-purple-200 px-3 py-1 rounded-full">
                                                {e.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                                    <Settings size={24} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">No additional details</p>
                                <p className="text-gray-400 text-sm mt-2">Your profile is clean and simple</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
