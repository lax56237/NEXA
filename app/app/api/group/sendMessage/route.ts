import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Group from "@/app/models/Group";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json().catch(() => ({}));
        const groupID = body.groupID || body.groupId || "";

        if (!groupID) {
            return NextResponse.json({ error: "groupID is required" }, { status: 400 });
        }

        // validate user from cookie
        const cookieHeader = req.headers.get("cookie") || "";
        const token = cookieHeader
            .split("; ")
            .find((c) => c.startsWith("authToken="))
            ?.split("=")[1];

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const sender = decoded?.userNumber || decoded?.email || decoded?.id || "unknown";
        const type = body.type || "text";
        const d = body.data || {};

        const message: any = {
            sender,
            data: {
                type,
                text: type === "text" ? body.text || d.text || "" : "",
                encoded: d.encoded || "",
                mimeType: d.mimeType || "",
                url: d.url || "",
                caption: d.caption || "",
                fileName: d.fileName || "",
                size: d.size || 0,
                duration: d.duration || 0,
                compressed: Boolean(d.compressed),
                storageType: d.storageType || (d.encoded ? "encoded" : d.url ? "url" : "external"),
                thumbnailUrl: d.thumbnailUrl || "",
            },
            timestamp: new Date(),
        };

        const updated = await Group.findOneAndUpdate(
            { groupID },
            { $push: { groupmedia: message } },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        const inserted =
            updated.groupmedia && updated.groupmedia.length > 0
                ? updated.groupmedia[updated.groupmedia.length - 1]
                : message;

        return NextResponse.json({ message: inserted }, { status: 201 });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
