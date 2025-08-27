"use client";

import { useEffect, useState } from "react";
import Message from "./message";
import Image from "./image";
import Video from "./video";

export default function UserContentPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/account/validate-user");
                const data = await res.json();
                if (data.valid) {
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not logged in</p>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                Welcome, {user.email}
            </h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSelected("message")}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Messages
                </button>
                <button
                    onClick={() => setSelected("image")}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Images
                </button>
                <button
                    onClick={() => setSelected("video")}
                    className="px-4 py-2 bg-purple-500 text-white rounded"
                >
                    Videos
                </button>
            </div>

            {selected === "message" && <Message user={user} />}
            {selected === "image" && <Image user={user} />}
            {selected === "video" && <Video user={user} />}
        </div>
    );
}
