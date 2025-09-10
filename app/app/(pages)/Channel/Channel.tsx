"use client";

import Profile from "./Profile";
import Temp from "./Temp";
import { useState } from "react";

export default function Channel() {
    const [trigger, setTrigger] = useState("Profile");

    const renderComponent = () => {
        switch (trigger) {
            case "Profile":
                return <Profile />;
            case "Temp":
                return <Temp />;
            default:
                return <div>Not Found</div>;
        }
    };

    return (
        <div className="text-center h-[100vh] flex flex-col justify-center">
            {renderComponent()}

            <div className="mt-4 flex gap-4 justify-center">
                <button
                    onClick={() => setTrigger("Profile")}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Show Profile
                </button>

                <button
                    onClick={() => setTrigger("Temp")}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Show Temp
                </button>
            </div>
        </div>
    );
}
