import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import dbConnect from "../../../lib/mongodb";
import Channel from "../../../models/Channel";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
    try {
        await dbConnect();

        const formData = await req.formData();
        const channelName = formData.get("channelName") as string;
        const title = formData.get("title") as string;
        const description = (formData.get("description") as string) || "";

        const videoFile = formData.get("video") as unknown as File;
        const thumbnailFile = formData.get("thumbnail") as unknown as File | null;

        if (!channelName || !title || !videoFile) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Save video
        const videoArrayBuffer = await videoFile.arrayBuffer();
        const videoPath = `/uploads/videos/${Date.now()}_${videoFile.name}`;
        const videoFullPath = path.join(process.cwd(), "public", videoPath);
        fs.mkdirSync(path.dirname(videoFullPath), { recursive: true });
        fs.writeFileSync(videoFullPath, Buffer.from(videoArrayBuffer));

        let thumbnailPath = "";
        if (thumbnailFile) {
            const thumbArrayBuffer = await thumbnailFile.arrayBuffer();
            thumbnailPath = `/uploads/thumbnails/${Date.now()}_${thumbnailFile.name}`;
            const thumbFullPath = path.join(process.cwd(), "public", thumbnailPath);
            fs.mkdirSync(path.dirname(thumbFullPath), { recursive: true });
            fs.writeFileSync(thumbFullPath, Buffer.from(thumbArrayBuffer));
        }

        const channelDoc = await Channel.findOneAndUpdate(
            { "channels.name": channelName },
            {
                $push: {
                    "channels.$.videos": {
                        title,
                        description,
                        video: videoPath,
                        videoThumbnail: thumbnailPath,
                    },
                },
            },
            { new: true }
        );

        return NextResponse.json({ success: true, channel: channelDoc });
    } catch (err) {
        console.error("Error adding video:", err);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
