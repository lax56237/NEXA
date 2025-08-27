"use client";
import { useEffect, useState } from "react";

export default function Image({ user }: { user: any }) {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await fetch("/api/content/fetch-content/image");
                if (!res.ok) throw new Error("Failed to fetch images");

                const data = await res.json();
                setImages(data.images || []);
            } catch (err) {
                console.error("Error fetching images:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) return <p>Loading images...</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {images.length > 0 ? (
                images.map((img, i) => (
                    <div key={i} className="border rounded-lg shadow p-2">
                        <img
                            src={`data:${img.imageData.format};base64,${img.imageData.data}`}
                            alt={img.description}
                            className="w-full h-48 object-cover rounded"
                        />
                        <p className="mt-2 text-sm text-gray-700">{img.description}</p>
                    </div>
                ))
            ) : (
                <p className="col-span-3 text-center">No images found</p>
            )}
        </div>
    );
}
