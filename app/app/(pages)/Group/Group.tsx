"use client";
import { useEffect, useState } from "react";
import GroupList from "./GroupsList";
import CreateGroup from "./CreateGroup";

export default function Group() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeComponent, setActiveComponent] = useState<"list" | "create">("list");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("/api/account/validate-user");
                const data = await res.json();

                if (res.ok && data.valid) {
                    setUser({
                        email: data.email,
                        userNumber: data.userNumber,
                    });
                }
            } catch (err) {
                console.error("Error validating user:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-500">User not logged in</p>
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-screen bg-gray-100">
            <div className="w-[90%] h-[90%] bg-white rounded-lg shadow-lg p-4 overflow-y-auto">
                {activeComponent === "list" && (
                    <GroupList user={user} setActiveComponent={setActiveComponent} />
                )}
                {activeComponent === "create" && (
                    <CreateGroup user={user} setActiveComponent={setActiveComponent} />
                )}
            </div>
        </div>
    );
}
