"use client";

import { useEffect, useState } from "react";

interface Props {
    user: {
        email: string;
        userNumber: string;
    };
}

export default function Message({ user }: Props) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch("/api/content/fetch-content/message", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email, userNumber: user.userNumber }),
                });
                const data = await res.json();
                setMessages(data.messages || []);
            } catch (err) {
                console.error("Error fetching messages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [user]);

    if (loading) return <p>Loading messages...</p>;
    if (!messages.length) return <p>No messages found.</p>;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Your Messages</h2>
            <ul className="space-y-4">
                {messages.map((msg, idx) => (
                    <li key={idx} className="border p-3 rounded shadow">
                        <p className="font-medium">{msg.message}</p>
                        <p className="text-sm text-gray-500">{msg.description}</p>
                        <p className="text-xs text-gray-400">Created: {new Date(msg.createdAt).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
