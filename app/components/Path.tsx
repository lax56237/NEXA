"use client";
import { useState } from "react";

interface PathProps {
    onChange: (tab: string) => void;
}

export default function Path({ onChange }: PathProps) {
    const [activeTab, setActiveTab] = useState("home");

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        onChange(tab); 
    };

    return (
        <div className="fixed top-4 left-4 flex flex-col gap-4 bg-white shadow-md rounded-xl p-4">
            {["home", "channels", "network", "groups"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>
    );
}
