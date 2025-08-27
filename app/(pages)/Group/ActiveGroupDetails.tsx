"use client";
import { useEffect, useState } from "react";

export default function ActiveGroupDetails({
    groupID,
    onBack,
}: {
    groupID: string;
    onBack: () => void;
}) {
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [showPopup, setShowPopup] = useState(false);
    const [newUser, setNewUser] = useState("");
    const [role, setRole] = useState<"member" | "admin">("member");
    const [adding, setAdding] = useState(false);

    const [editingDesc, setEditingDesc] = useState(false);
    const [newDesc, setNewDesc] = useState("");

    const fetchGroup = async () => {
        try {
            const res = await fetch("/api/group/getGroupDetails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ groupID }),
            });
            const data = await res.json();
            if (res.ok) setGroup(data.group);
        } catch (err) {
            console.error("Error fetching group details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroup();
    }, [groupID]);

    // Add Member
    const handleAddMember = async () => {
        if (!newUser) return;
        setAdding(true);
        try {
            const res = await fetch("/api/group/updateGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "addMember",
                    groupID,
                    userNumber: newUser,
                    role,
                }),
            });
            if (res.ok) {
                await fetchGroup();
                setShowPopup(false);
                setNewUser("");
                setRole("member");
            }
        } catch (err) {
            console.error("Error adding member:", err);
        } finally {
            setAdding(false);
        }
    };

    // Remove Member
    const handleRemoveMember = async (userNumber: string, memberRole: "member" | "admin") => {
        if (memberRole === "admin") return; // don’t remove admins
        try {
            const res = await fetch("/api/group/updateGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "removeMember",
                    groupID,
                    userNumber,
                }),
            });
            if (res.ok) await fetchGroup();
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    // Change Role
    const handleChangeRole = async (userNumber: string, newRole: "member" | "admin") => {
        try {
            const res = await fetch("/api/group/updateGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "changeRole",
                    groupID,
                    userNumber,
                    role: newRole,
                }),
            });
            if (res.ok) await fetchGroup();
        } catch (err) {
            console.error("Error changing role:", err);
        }
    };

    // Edit Description
    const handleEditDescription = async () => {
        try {
            const res = await fetch("/api/group/updateGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "editDescription",
                    groupID,
                    description: newDesc,
                }),
            });
            if (res.ok) {
                await fetchGroup();
                setEditingDesc(false);
                setNewDesc("");
            }
        } catch (err) {
            console.error("Error editing description:", err);
        }
    };

    // Exit Group
    const handleExitGroup = async () => {
        try {
            const res = await fetch("/api/group/updateGroup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "exitGroup",
                    groupID,
                }),
            });
            if (res.ok) {
                onBack(); // go back to group list after exit
            }
        } catch (err) {
            console.error("Error exiting group:", err);
        }
    };


    if (loading) return <p className="text-center text-gray-500">Loading details...</p>;
    if (!group) return <p className="text-center text-red-500">Group not found</p>;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl shadow">
                <button
                    onClick={onBack}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition"
                >
                    ← Back
                </button>
                <h1 className="text-xl font-bold">{group.groupName}</h1>
                <div className="w-10" />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                    {group.groupProfilePicture?.encoded ? (
                        <img
                            src={
                                group.groupProfilePicture.encoded.startsWith("data:")
                                    ? group.groupProfilePicture.encoded
                                    : `data:${group.groupProfilePicture.mimeType};base64,${group.groupProfilePicture.encoded}`
                            }
                            alt={group.groupName}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white text-3xl font-bold shadow-lg">
                            {group.groupName?.[0] || "?"}
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">{group.groupName}</h2>
                    {editingDesc ? (
                        <div className="mt-2 flex gap-2 justify-center">
                            <input
                                type="text"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                                className="px-2 py-1 border rounded"
                            />
                            <button
                                onClick={handleEditDescription}
                                className="px-3 py-1 bg-green-500 text-white rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingDesc(false)}
                                className="px-3 py-1 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-600">{group.groupDescription || "No description"}</p>
                    )}
                    {!editingDesc && (
                        <button
                            onClick={() => {
                                setEditingDesc(true);
                                setNewDesc(group.groupDescription || "");
                            }}
                            className="mt-2 px-2 py-1 text-sm bg-indigo-500 text-white rounded"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Members */}
                <div className="bg-white rounded-xl shadow p-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Members</h3>
                        <button
                            onClick={() => setShowPopup(true)}
                            className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                        >
                            + Add
                        </button>
                        {/* Exit Group Button */}
                        <div className="p-4">
                            <button
                                onClick={handleExitGroup}
                                className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Exit Group
                            </button>
                        </div>
                    </div>
                    <ul className="space-y-2">

                        {Object.entries(group.groupMemberss || {}).map(([id, role]) => {
                            const memberRole = role as "member" | "admin";
                            return (
                                <li
                                    key={id}
                                    className="flex justify-between items-center px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border"
                                >
                                    <span className="font-medium text-gray-700">{id}</span>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`italic px-2 py-1 rounded-full text-sm ${memberRole === "admin"
                                                ? "bg-purple-200 text-purple-800"
                                                : "bg-indigo-200 text-indigo-800"
                                                }`}
                                        >
                                            {memberRole}
                                        </span>

                                        {memberRole !== "admin" && (
                                            <>
                                                <button
                                                    onClick={() => handleChangeRole(id, "admin")}
                                                    className="text-xs px-2 py-1 bg-green-500 text-white rounded"
                                                >
                                                    Promote
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveMember(id, memberRole)}
                                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                                                >
                                                    Remove
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* Add Member Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-80">
                        <h3 className="text-lg font-semibold mb-4">Add Member</h3>
                        <input
                            type="text"
                            placeholder="Enter User Number"
                            value={newUser}
                            onChange={(e) => setNewUser(e.target.value)}
                            className="w-full mb-3 px-3 py-2 border rounded-lg"
                        />
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as "member" | "admin")}
                            className="w-full mb-3 px-3 py-2 border rounded-lg"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowPopup(false)}
                                className="px-3 py-1 bg-gray-300 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={adding}
                                className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                            >
                                {adding ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
