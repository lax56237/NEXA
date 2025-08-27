"use client";
import { useEffect, useState } from "react";

export default function Video({ user }: { user: any }) {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const res = await fetch("/api/content/fetch-content/video");
                if (!res.ok) throw new Error("Failed to fetch videos");

                const data = await res.json();
                setVideos(data.videos || []);
            } catch (err) {
                console.error("Error fetching videos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, []);

    if (loading) return <p>Loading videos...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            {videos.length > 0 ? (
                videos.map((vid, i) => (
                    <div key={i} className="border rounded-lg shadow p-2">
                        <video
                            controls
                            poster={`data:${vid.thumbnail.format};base64,${vid.thumbnail.data}`}
                            className="w-full h-64 object-cover rounded"
                        >
                            <source
                                src={`data:video/mp4;base64,${vid.videoData}`}
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                        <p className="mt-2 text-sm text-gray-700">{vid.description}</p>
                    </div>
                ))
            ) : (
                <p className="col-span-2 text-center">No videos found</p>
            )}
        </div>
    );
}
