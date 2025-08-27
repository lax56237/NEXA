"use client";

import Home from "../(pages)/Home";
import Group from "../(pages)/Group/Group";
import Network from "../(pages)/Network";
import Chennel from "../(pages)/Channel";

interface CenterProps {
    activeTab: string;
}

export default function Center({ activeTab }: CenterProps) {
    const renderContent = () => {
        if (activeTab === "home") {
            return <Home />;
        } else if (activeTab === "channels") {
            return <Chennel />;
        } else if (activeTab === "network") {
            return <Network />;
        } else if (activeTab === "groups") {
            return <Group />;
        }
        return "Select a feed";
    };

    return (
        <div className="flex-1 flex justify-center items-center">
            <div
                className="w-3/4 h-3/4 rounded-xl shadow-inner flex items-center justify-center text-gray-500 text-xl font-semibold"
                style={{
                    backgroundColor:
                        activeTab === "home"
                            ? "#E0F2FE"
                            : activeTab === "channels"
                                ? "#FCE7F3"
                                : activeTab === "network"
                                    ? "#FEF9C3"
                                    : "#DCFCE7",
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
}
