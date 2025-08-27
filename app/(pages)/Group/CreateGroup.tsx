"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { UserPlus, Upload, X } from "lucide-react";

interface CreateGroupProps {
  user: { email: string; userNumber: string };
  setActiveComponent: (val: "list" | "create") => void;
  onCreated?: (group: any) => void;
}

export default function CreateGroup({
  user,
  setActiveComponent,
  onCreated,
}: CreateGroupProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState<{
    encoded: string;
    mimeType: string;
  } | null>(null);
  const [members, setMembers] = useState<
    { userNumber: string; role: "member" | "admin" }[]
  >([]);
  const [newMember, setNewMember] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [loading, setLoading] = useState(false);

  // Ensure creator is always included as admin
  useEffect(() => {
    if (user?.userNumber) {
      setMembers((prev) => {
        const exists = prev.some((m) => m.userNumber === user.userNumber);
        if (exists) return prev;
        return [{ userNumber: user.userNumber, role: "admin" }, ...prev];
      });
    }
  }, [user?.userNumber]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage({
        encoded: reader.result as string,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const addMember = () => {
    if (!newMember.trim()) return;
    setMembers([...members, { userNumber: newMember.trim(), role }]);
    setNewMember("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.userNumber) {
        console.error("❌ No user.userNumber passed from parent");
        setLoading(false);
        return;
      }

      // Ensure creator is admin
      const membersMap = new Map<string, string>(
        members.map((m) => [m.userNumber, m.role])
      );
      membersMap.set(user.userNumber, "admin"); // enforce admin role
      const membersObj = Object.fromEntries(membersMap);

      const res = await fetch("/api/group/createGroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupName,
          groupDescription: description,
          groupProfilePicture: profileImage,
          groupMemberss: membersObj,
          userNumber: user.userNumber, 
        }),
      });

      const data = await res.json();
      if (res.ok && data.group) {
        onCreated?.(data.group);
        setActiveComponent("list");
        setTimeout(
          () =>
            window.dispatchEvent(
              new CustomEvent("groupCreated", { detail: data.group })
            ),
          120
        );
      } else {
        console.error("❌ Create group failed", data);
      }
    } catch (err) {
      console.error("❌ Error creating group", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create New Group
          </h1>
          <button
            onClick={() => setActiveComponent("list")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage.encoded}
                  alt="Group Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <label className="px-4 py-2 bg-white border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              Choose Profile Picture
            </label>
          </div>

          {/* Group Details */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />

            <textarea
              placeholder="Group Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
            />
          </div>

          {/* Members Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="font-semibold text-gray-800 mb-4">Members</h2>

            {/* Members List */}
            <ul className="space-y-2 mb-4">
              {members.map((m, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <span className="text-gray-700">{m.userNumber}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${m.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>

            {/* Add Member Form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add member by user number"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "member" | "admin")
                }
                className="px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="button"
                onClick={addMember}
                className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-opacity"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </form>
      </div>
    </div>
  );
}
