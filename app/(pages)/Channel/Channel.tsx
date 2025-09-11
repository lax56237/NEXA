"use client";
import { useEffect, useState } from "react";
import AddChannelForm from "./AddChannelForm";
import AddVideoForm from "./AddVideoForm";

export default function ChannelPage() {
    const [view, setView] = useState<"main" | "channel" | "video">("main");
    const [channels, setChannels] = useState<any[]>([]);
    const [activeChannel, setActiveChannel] = useState<any>(null);
    const [activeVideo, setActiveVideo] = useState<any>(null);
    const [user, setUser] = useState<any>(null);

    const [showAddChannel, setShowAddChannel] = useState(false);
    const [showAddVideo, setShowAddVideo] = useState(false);

    // fetch user + channels
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/account/getUserDetail", { credentials: "include" });
                const data = await res.json();
                if (data.valid) setUser(data.details);
            } catch (err) {
                console.error("fetch user err", err);
            }
        };

        const fetchChannels = async () => {
            try {
                const res = await fetch("/api/channel/getAll", { credentials: "include" });
                const data = await res.json();
                // data.channels is the Channel document (or undefined)
                setChannels(Array.isArray(data.channels?.channels) ? data.channels.channels : []);
            } catch (err) {
                console.error("fetch channels err", err);
            }
        };

        fetchUser();
        fetchChannels();
    }, []);

    // callbacks from forms
    const handleChannelCreated = (channelDoc: any) => {
        // replace whole channels array with fresh doc from server
        if (channelDoc?.channels) setChannels(channelDoc.channels);
    };

    const handleVideoAdded = (channelDoc: any, channelName: string) => {
        if (channelDoc?.channels) {
            setChannels(channelDoc.channels);
            // update active channel view if same channel
            const c = channelDoc.channels.find((ch: any) => ch.name === channelName);
            if (c) setActiveChannel(c);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-screen bg-gray-100">
            {view === "main" && (
                <div className="w-full p-6 text-center">
                    {user && (
                        <div className="mb-6">
                            <img
                                src={user.profilePicture || "/default.png"}
                                alt="profile"
                                className="w-20 h-20 rounded-full mx-auto mb-2"
                            />
                            <h2 className="text-xl font-bold">{user.username}</h2>
                        </div>
                    )}

                    <h3 className="text-lg font-semibold mb-4">Your Channels</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {channels && channels.length > 0 ? (
                            channels.map((ch: any) => (
                                <div
                                    key={ch.name}
                                    className="p-4 bg-white rounded-xl shadow cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        setActiveChannel(ch);
                                        setView("channel");
                                    }}
                                >
                                    <img
                                        src={ch.profileImage || "/default.png"}
                                        alt="channel"
                                        className="w-24 h-24 object-cover rounded-full mb-2"
                                    />
                                    <p className="font-bold">{ch.name}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">No channels yet — make one!</div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAddChannel(true)}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
                    >
                        + Add Channel
                    </button>
                </div>
            )}

            {view === "channel" && activeChannel && (
                <div className="w-full p-6 text-center">
                    <button className="mb-4 text-blue-600" onClick={() => setView("main")}>
                        ← Back
                    </button>
                    <img
                        src={activeChannel.profileImage || "/default.png"}
                        alt="channel"
                        className="w-24 h-24 rounded-full mx-auto mb-2"
                    />
                    <h2 className="text-2xl font-bold">{activeChannel.name}</h2>
                    <p className="text-gray-600">{activeChannel.description}</p>

                    <h3 className="text-lg font-semibold mt-6 mb-4">Videos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.isArray(activeChannel.videos) && activeChannel.videos.length > 0 ? (
                            activeChannel.videos.map((vid: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="p-2 bg-white rounded shadow cursor-pointer"
                                    onClick={() => {
                                        setActiveVideo(vid);
                                        setView("video");
                                    }}
                                >
                                    <img
                                        src={vid.videoThumbnail}
                                        alt="video"
                                        className="w-full h-32 object-cover rounded mb-2"
                                    />
                                    <p className="text-sm font-semibold">{vid.title}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500">No videos yet — add the first one!</div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAddVideo(true)}
                        className="mt-6 px-4 py-2 bg-green-600 text-white rounded"
                    >
                        + Add Video
                    </button>
                </div>
            )}

            {view === "video" && activeVideo && (
                <div className="w-full p-6 text-center">
                    <button className="mb-4 text-blue-600" onClick={() => setView("channel")}>
                        ← Back to Channel
                    </button>
                    <video
                        controls
                        className="w-full max-w-2xl mx-auto rounded-lg shadow"
                        src={activeVideo.video}
                    />
                    <h2 className="text-xl font-bold mt-4">{activeVideo.title}</h2>
                    <p className="text-gray-600 mt-2">{activeVideo.description}</p>
                </div>
            )}

            {showAddChannel && (
                <AddChannelForm
                    onClose={() => setShowAddChannel(false)}
                    onCreated={(channelDoc: any) => {
                        handleChannelCreated(channelDoc);
                        setShowAddChannel(false);
                    }}
                />
            )}

            {showAddVideo && activeChannel && (
                <AddVideoForm
                    channelName={activeChannel.name}
                    onClose={() => setShowAddVideo(false)}
                    onAdded={(channelDoc: any) => {
                        handleVideoAdded(channelDoc, activeChannel.name);
                        setShowAddVideo(false);
                    }}
                />
            )}
        </div>
    );
}
