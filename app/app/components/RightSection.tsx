"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, User, UserPlus, X } from "lucide-react";

export default function RightSection() {
    const [showModal, setShowModal] = useState(false);
    const [userNumber, setUserNumber] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const open = () => {
        setStatus(null);
        setUserNumber("");
        setShowModal(true);
    };

    const close = () => {
        setShowModal(false);
        setStatus(null);
        setUserNumber("");
    };

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        if (showModal) document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [showModal]);

    const handleAddFriend = async () => {
        if (!userNumber.trim()) {
            setStatus("Please enter a user number.");
            return;
        }
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch("/api/account/addFriend", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userNumber: userNumber.trim() }),
            });
            const data = await res.json();

            if (res.ok && (data.success ?? true)) {
                setUserNumber(""); 
                setStatus("✅ Friend added successfully!");
            } else {
                setStatus(data.error || data.message || "❌ User not found.");
            }
        } catch {
            setStatus("❌ Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed top-4 right-4 z-20 flex items-center gap-4">
                <Link href="/notification">
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <Bell size={20} />
                    </button>
                </Link>

                <Link href="/user">
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <User size={20} />
                    </button>
                </Link>

                <button
                    onClick={open}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    aria-label="Add friend"
                >
                    <UserPlus size={20} />
                </button>
            </div>

            {showModal && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md"
                    onClick={close}
                >
                    <div
                        className="relative w-[90%] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={close}
                            className="absolute right-3 top-3 rounded-full p-1 hover:bg-gray-100"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        <h2 className="mb-4 text-xl font-bold">Add Friend</h2>

                        <input
                            type="text"
                            value={userNumber}
                            onChange={(e) => setUserNumber(e.target.value)}
                            placeholder="Enter user number"
                            className="mb-4 w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={close}
                                className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddFriend}
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add"}
                            </button>
                        </div>

                        {status && (
                            <p className="mt-4 text-center text-sm text-gray-700">{status}</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
