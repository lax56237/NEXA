"use client";
import { useEffect, useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import ActiveGroupDetails from "./ActiveGroupDetails";

type Msg = any;

export default function ActiveGroupChat({ groupId }: { groupId: string }) {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showDetails, setShowDetails] = useState(false); // 👈 toggle state
    const containerRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        async function validate() {
            try {
                const res = await fetch("/api/account/validate-user");
                const data = await res.json();
                if (res.ok && data.valid) setCurrentUser(data);
            } catch (err) {
                console.error("validate error", err);
            }
        }
        validate();
    }, []);

    // fetch messages
    useEffect(() => {
        if (!groupId) return;
        async function fetchMessages() {
            setLoading(true);
            try {
                const res = await fetch(`/api/group/getGroupChat?groupID=${encodeURIComponent(groupId)}`);
                const data = await res.json();
                setMessages(data.messages || []);
                requestAnimationFrame(() => {
                    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
                });
            } catch (err) {
                console.error("fetchMessages error", err);
            } finally {
                setLoading(false);
            }
        }
        fetchMessages();
    }, [groupId]);

    // helpers
    const getText = (m: any) => m?.text || m?.data?.text || "";
    const isImage = (m: any) => m?.data?.type === "image" || /image\//.test(m?.data?.mimeType || "");
    const isVideo = (m: any) => m?.data?.type === "video" || /video\//.test(m?.data?.mimeType || "");
    const getMediaSrc = (m: any) => {
        if (m.data?.url) return m.data.url;
        if (m.data?.encoded && m.data?.mimeType) return `data:${m.data.mimeType};base64,${m.data.encoded}`;
        return null;
    };
    const isFromCurrentUser = (m: any) =>
        currentUser && (m.sender === currentUser.userNumber || m.sender === currentUser.email);

    // file -> base64
    const fileToBase64 = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });

    async function sendMessage() {
        if (!input.trim() && !selectedFile) return;

        let payload: any = { groupID: groupId };

        if (selectedFile) {
            const base64 = await fileToBase64(selectedFile);
            const mimeType = selectedFile.type;

            payload = {
                ...payload,
                type: mimeType.startsWith("image/")
                    ? "image"
                    : mimeType.startsWith("video/")
                        ? "video"
                        : "file",
                data: {
                    encoded: base64.split(",")[1],
                    mimeType,
                    fileName: selectedFile.name,
                    size: selectedFile.size,
                    storageType: "encoded",
                },
            };
        } else {
            payload = {
                ...payload,
                type: "text",
                text: input,
            };
        }

        try {
            const res = await fetch("/api/group/sendMessage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.message) {
                setMessages((prev) => [...prev, data.message]);
                setInput("");
                setSelectedFile(null);
                requestAnimationFrame(() => {
                    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
                });
            } else {
                console.error("send failed", data);
            }
        } catch (err) {
            console.error("sendMessage error", err);
        }
    }

    if (showDetails) {
        return (
            <ActiveGroupDetails
                groupID={groupId}
                onBack={() => setShowDetails(false)} 
            />
        );
    }

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <div
                className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow cursor-pointer"
                onClick={() => setShowDetails(true)} 
            >
                Group Chat
            </div>

            {/* Messages */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100"
            >
                {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                ) : (
                    messages.map((msg, i) => {
                        const text = getText(msg);
                        const mediaSrc = getMediaSrc(msg);
                        const right = isFromCurrentUser(msg);
                        return (
                            <div
                                key={msg._id ?? `${i}-${msg.timestamp}`}
                                className={`mb-3 flex ${right ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`${right ? "bg-indigo-500 text-white" : "bg-gray-200 text-black"
                                        } max-w-[75%] p-3 rounded-2xl shadow`}
                                >
                                    {text && <div className="whitespace-pre-wrap">{text}</div>}

                                    {isImage(msg) && mediaSrc && (
                                        <img
                                            src={mediaSrc}
                                            alt={msg.data?.caption || "image"}
                                            className="max-w-full h-auto rounded-md mt-2"
                                        />
                                    )}

                                    {isVideo(msg) && mediaSrc && (
                                        <video controls className="max-w-full rounded-md mt-2">
                                            <source src={mediaSrc} />
                                            Your browser does not support video.
                                        </video>
                                    )}

                                    {msg.data?.type === "file" && mediaSrc && (
                                        <a
                                            href={mediaSrc}
                                            download={msg.data?.fileName || "file"}
                                            className="mt-2 text-sm underline text-blue-600 block"
                                        >
                                            📎 {msg.data?.fileName || "Download file"}
                                        </a>
                                    )}

                                    <div className="text-xs mt-2 opacity-70 text-right">
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                        }
                    }}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow hover:opacity-90"
                >
                    <Paperclip size={20} />
                </button>

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedFile ? selectedFile.name : "Type message..."}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow hover:opacity-90"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
