"use client";
import { useEffect, useState, useCallback } from "react";
import ActiveGroupChat from "./ActiveGroupChat";

export default function GroupList({ user, setActiveComponent }: { user: any, setActiveComponent: (val: "list" | "create") => void }) {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeGroupID, setActiveGroupID] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/group/getGroups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email }),
            });
            const data = await res.json();
            if (res.ok) setGroups(data.groups || []);
        } catch (err) {
            console.error("Error fetching groups:", err);
        } finally {
            setLoading(false);
        }
    }, [user.email]);

    useEffect(() => {
        fetchGroups();

        const onCreated = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail && detail.groupID) {
                setGroups((prev) => [detail, ...prev.filter(g => g.groupID !== detail.groupID)]);
            } else {
                fetchGroups();
            }
        };

        window.addEventListener("groupCreated", onCreated as EventListener);
        return () => window.removeEventListener("groupCreated", onCreated as EventListener);
    }, [fetchGroups]);

    if (loading)
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-indigo-600 font-medium">Loading groups...</p>
            </div>
        );

    if (!groups.length)
        return (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl">
                <p className="text-gray-600 mb-4">No groups found</p>
                <button
                    onClick={() => setActiveComponent("create")}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-opacity"
                >
                    Create New Group
                </button>
            </div>
        );

    if (activeGroupID) {
        return <ActiveGroupChat groupId={activeGroupID} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Your Groups
                    </h2>
                    <button
                        onClick={() => setActiveComponent("create")}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-opacity"
                    >
                        + New Group
                    </button>
                </div>

                {/* Groups List */}
                <ul className="space-y-3">
                    {groups.map((group) => (
                        <li
                            key={group.groupID}
                            onClick={() => setActiveGroupID(group.groupID)}
                            className="group p-4 rounded-xl bg-white border border-gray-100 shadow-sm 
                                     hover:shadow-md hover:border-indigo-100 transition-all duration-200 
                                     cursor-pointer relative overflow-hidden"
                        >
                            {/* Gradient hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 
                                          opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                            {/* Content */}
                            <div className="relative z-10">
                                <p className="font-semibold text-gray-800 mb-1">
                                    {group.groupName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {group.groupDescription}
                                </p>

                                {/* Member count */}
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                    <span>
                                        {Object.keys(group.groupMemberss || {}).length}{" "}
                                        members
                                    </span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
