"use client";
import { useState } from "react";

type Props = {
    user: any;
    channels: any[];
    onChannelSelect: (channel: any) => void;
    onAddChannelClick: () => void;
};

export default function MainView({ user, channels, onChannelSelect, onAddChannelClick }: Props) {
    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 p-8 text-center">
            {user && (
                <div className="mb-8 bg-white bg-opacity-80 p-6 rounded-2xl shadow-lg max-w-md mx-auto backdrop-blur-sm">
                    <img
                        src={user.profilePicture || "/default.png"}
                        alt="profile"
                        className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-blue-300 shadow-md object-cover"
                    />
                    <h2 className="text-2xl font-bold text-blue-800">{user.username}</h2>
                </div>
            )}

            <h3 className="text-2xl font-semibold mb-6 text-blue-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">Your Channels</h3>
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
                {channels && channels.length > 0 ? (
                    channels.map((ch: any) => (
                        <div
                            key={ch.name}
                            className="p-5 bg-white bg-opacity-90 rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-100 backdrop-blur-sm"
                            onClick={() => onChannelSelect(ch)}
                        >
                            <img
                                src={ch.profileImage || "/default.png"}
                                alt="channel"
                                className="w-28 h-28 object-cover rounded-full mb-3 border-2 border-blue-300 shadow-md transition-all duration-300 group-hover:border-blue-500"
                            />
                            <p className="font-bold text-lg text-blue-800">{ch.name}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-600 bg-white bg-opacity-70 p-6 rounded-xl shadow-md backdrop-blur-sm">No channels yet — make one!</div>
                )}
            </div>

            <button
                onClick={onAddChannelClick}
                className="mt-8 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 font-semibold"
            >
                + Add Channel
            </button>
        </div>
    );
}