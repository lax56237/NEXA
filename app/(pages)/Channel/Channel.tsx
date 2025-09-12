"use client";
import { useEffect, useState } from "react";
import AddChannelForm from "./AddChannelForm";
import AddVideoForm from "./AddVideoForm";
import MainView from "./MainView";
import ChannelView from "./ChannelView";
import VideoView from "./VideoView";

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
        <div className="relative flex flex-col items-center justify-center w-full h-screen">
            {view === "main" && (
                <MainView 
                    user={user}
                    channels={channels}
                    onChannelSelect={(ch) => {
                        setActiveChannel(ch);
                        setView("channel");
                    }}
                    onAddChannelClick={() => setShowAddChannel(true)}
                />
            )}

            {view === "channel" && activeChannel && (
                <ChannelView 
                    channel={activeChannel}
                    onBackClick={() => setView("main")}
                    onVideoSelect={(vid) => {
                        setActiveVideo(vid);
                        setView("video");
                    }}
                    onAddVideoClick={() => setShowAddVideo(true)}
                />
            )}

            {view === "video" && activeVideo && (
                <VideoView 
                    video={activeVideo}
                    onBackClick={() => setView("channel")}
                />
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
